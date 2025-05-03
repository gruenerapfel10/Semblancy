// S3MultipartUploadManager.js
import { uploadData, getUrl, remove, list } from "aws-amplify/storage";

export class S3UploadManager {
  constructor(config = {}) {
    this.chunkSize = 5 * 1024 * 1024; // 5MB chunks
    this.concurrentUploads = config.concurrentUploads || 2;
    this.maxRetries = config.maxRetries || 3;
  }

  async resumeUpload(file, path, progressCallback = null) {
    // Just call uploadFile with firstChunkOnly = false
    return this.uploadFile(file, path, progressCallback, false);
  }

  async uploadFile(
    file,
    path,
    progressCallback = null,
    firstChunkOnly = false
  ) {
    try {
      // Calculate number of chunks
      const fileSize = file.size;
      const numChunks = Math.ceil(fileSize / this.chunkSize);

      // Check for existing upload state
      let uploadState = await this.loadUploadState(path);

      // Create new upload state if needed
      if (!uploadState) {
        uploadState = {
          id: `upload_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 15)}`,
          path,
          fileName: file.name,
          fileSize,
          chunkSize: this.chunkSize,
          totalChunks: numChunks,
          chunksUploaded: [],
          startTime: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          progress: 0,
        };
      }

      // Upload first chunk if not already done
      if (!uploadState.chunksUploaded.includes(0)) {
        const firstChunk = file.slice(0, this.chunkSize);

        // Upload the first chunk
        await uploadData({
          path,
          data: firstChunk,
          options: {
            contentType: file.type || "application/octet-stream",
            onProgress: (progress) => {
              const chunkProgress = (progress.loaded / progress.total) * 100;
              const overallProgress = firstChunkOnly
                ? ((chunkProgress * this.chunkSize) / fileSize) * 100
                : chunkProgress / numChunks;

              if (progressCallback) {
                progressCallback({
                  chunk: 0,
                  chunkProgress,
                  overallProgress: Math.min(Math.round(overallProgress), 100),
                });
              }
            },
          },
        }).result;

        uploadState.chunksUploaded.push(0);
        uploadState.lastUpdated = new Date().toISOString();

        // Calculate progress
        uploadState.progress = Math.round((1 / numChunks) * 100);
      }

      // Save upload state
      await this.saveUploadState(path, uploadState);

      // Stop here if only uploading first chunk
      if (firstChunkOnly) {
        return { state: uploadState, completed: false };
      }

      // Upload remaining chunks
      for (let i = 1; i < numChunks; i += this.concurrentUploads) {
        const uploadPromises = [];

        for (let j = 0; j < this.concurrentUploads && i + j < numChunks; j++) {
          const chunkIndex = i + j;

          // Skip already uploaded chunks
          if (uploadState.chunksUploaded.includes(chunkIndex)) {
            continue;
          }

          // Calculate chunk range
          const start = chunkIndex * this.chunkSize;
          const end = Math.min(start + this.chunkSize, fileSize);
          const chunk = file.slice(start, end);

          // Upload this chunk
          const chunkPath = `${path}.part${chunkIndex}`;
          const uploadPromise = uploadData({
            path: chunkPath,
            data: chunk,
            options: {
              contentType: file.type || "application/octet-stream",
              onProgress: (progress) => {
                const chunkProgress = (progress.loaded / progress.total) * 100;
                const chunksComplete = uploadState.chunksUploaded.length;
                const overallProgress =
                  ((chunksComplete + chunkProgress / 100) / numChunks) * 100;

                if (progressCallback) {
                  progressCallback({
                    chunk: chunkIndex,
                    chunkProgress,
                    overallProgress: Math.min(Math.round(overallProgress), 100),
                  });
                }
              },
            },
          }).result.then(() => {
            // Mark chunk as uploaded
            uploadState.chunksUploaded.push(chunkIndex);
            uploadState.progress = Math.round(
              (uploadState.chunksUploaded.length / numChunks) * 100
            );
            uploadState.lastUpdated = new Date().toISOString();

            // Save state periodically
            return this.saveUploadState(path, uploadState);
          });

          uploadPromises.push(uploadPromise);
        }

        // Wait for current batch to complete
        await Promise.all(uploadPromises);
      }

      // All chunks uploaded, now merge them
      await this.mergeChunks(path, uploadState);

      // Clean up upload state
      await this.deleteUploadState(path);

      return { state: uploadState, completed: true };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async saveUploadState(path, state) {
    try {
      const statePath = `${path}.uploadstate`;
      await uploadData({
        path: statePath,
        data: new Blob([JSON.stringify(state)], { type: "application/json" }),
        options: { contentType: "application/json" },
      }).result;
    } catch (error) {
      console.error("Error saving upload state:", error);
      throw error;
    }
  }

  async loadUploadState(path) {
    try {
      const statePath = `${path}.uploadstate`;
      const { url } = await getUrl({ path: statePath });
      const response = await fetch(url);

      if (response.ok) {
        const text = await response.text();
        return JSON.parse(text);
      }

      return null;
    } catch (error) {
      // State likely doesn't exist
      return null;
    }
  }

  async deleteUploadState(path) {
    try {
      const statePath = `${path}.uploadstate`;
      await remove({ path: statePath });
    } catch (error) {
      console.error("Error deleting upload state:", error);
      // Continue even if this fails
    }
  }

  async mergeChunks(path, uploadState) {
    try {
      // Get the first chunk
      const { url: firstChunkUrl } = await getUrl({ path });
      const firstChunkResponse = await fetch(firstChunkUrl);

      if (!firstChunkResponse.ok) {
        throw new Error(
          `Failed to fetch first chunk: ${firstChunkResponse.status}`
        );
      }

      const firstChunk = await firstChunkResponse.arrayBuffer();

      // Get all other chunks
      const otherChunks = [];
      for (let i = 1; i < uploadState.totalChunks; i++) {
        const chunkPath = `${path}.part${i}`;
        const { url: chunkUrl } = await getUrl({ path: chunkPath });
        const chunkResponse = await fetch(chunkUrl);

        if (chunkResponse.ok) {
          const chunk = await chunkResponse.arrayBuffer();
          otherChunks.push(chunk);
        }
      }

      // Merge all chunks
      const totalSize =
        firstChunk.byteLength +
        otherChunks.reduce((total, chunk) => total + chunk.byteLength, 0);

      const mergedArray = new Uint8Array(totalSize);
      let offset = 0;

      // Copy first chunk
      mergedArray.set(new Uint8Array(firstChunk), offset);
      offset += firstChunk.byteLength;

      // Copy other chunks
      for (const chunk of otherChunks) {
        mergedArray.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      // Upload the complete file
      await uploadData({
        path,
        data: mergedArray,
        options: {
          contentType: uploadState.contentType || "application/octet-stream",
        },
      }).result;

      // Clean up chunk files
      for (let i = 1; i < uploadState.totalChunks; i++) {
        const chunkPath = `${path}.part${i}`;
        await remove({ path: chunkPath });
      }
    } catch (error) {
      console.error("Error merging chunks:", error);
      throw error;
    }
  }
}

export function createUploadManager(config = {}) {
  return new S3UploadManager(config);
}
