importScripts(
  "https://cdn.jsdelivr.net/npm/aws-amplify@5.0.4/dist/aws-amplify.min.js"
);

let uploadQueue = [];
let isUploading = false;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  clients.claim();
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  const message = event.data;

  if (message.type === "startUpload") {
    console.log("[Service Worker] Received upload job:", message.uploadId);
    uploadQueue.push(message.uploadId);

    // Start processing queue if not already running
    if (!isUploading) {
      processUploadQueue();
    }
  }

  if (message.type === "pauseUpload") {
    console.log("[Service Worker] Pausing upload:", message.uploadId);
    // Implement pause logic
  }

  if (message.type === "resumeUpload") {
    console.log("[Service Worker] Resuming upload:", message.uploadId);
    // Implement resume logic
  }

  if (message.type === "configureAmplify") {
    // Configure Amplify with settings from main thread
    self.AWS.Amplify.configure(message.config);
  }
});

// Process uploads in the queue
async function processUploadQueue() {
  if (uploadQueue.length === 0 || isUploading) {
    return;
  }

  isUploading = true;
  const uploadId = uploadQueue.shift();

  try {
    console.log("[Service Worker] Processing upload:", uploadId);

    // Access file from IndexedDB
    const db = await openDatabase();
    const tx = db.transaction(["files"], "readonly");
    const store = tx.objectStore("files");
    const uploadInfo = await store.get(uploadId);

    if (!uploadInfo) {
      console.error(`[Service Worker] No upload found with ID: ${uploadId}`);
      processNextUpload();
      return;
    }

    // Execute the upload
    await executeUpload(uploadInfo);

    // Cleanup after successful upload
    const deleteTx = db.transaction(["files"], "readwrite");
    const deleteStore = deleteTx.objectStore("files");
    await deleteStore.delete(uploadId);

    // Also cleanup upload state
    const uploadStateTx = db.transaction(["uploadState"], "readwrite");
    const uploadStateStore = uploadStateTx.objectStore("uploadState");
    await uploadStateStore.delete(uploadId);

    console.log(`[Service Worker] Upload completed for ${uploadId}`);

    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "uploadComplete",
        uploadId,
      });
    });
  } catch (error) {
    console.error("[Service Worker] Upload error:", error);

    // Notify clients of error
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "uploadError",
        uploadId,
        error: error.message,
      });
    });
  }

  // Process next upload
  processNextUpload();
}

function processNextUpload() {
  isUploading = false;
  if (uploadQueue.length > 0) {
    setTimeout(processUploadQueue, 100);
  }
}

// Execute an upload using AWS Amplify
async function executeUpload(uploadInfo) {
  const { file, options } = uploadInfo;

  // Here we would use AWS Amplify to upload the file
  // For this background worker implementation, we'll need to
  // use AWS SDK directly or ensure Amplify is available in the worker

  return new Promise((resolve, reject) => {
    // Implementation depends on how AWS Amplify is available in the worker
    // This is a placeholder for the actual upload implementation

    if (self.AWS && self.AWS.Amplify) {
      self.AWS.Amplify.Storage.put(options.path, file, options)
        .then(resolve)
        .catch(reject);
    } else {
      reject(new Error("AWS Amplify not available in service worker"));
    }
  });
}

// Open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("uploadFiles", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("uploadState")) {
        db.createObjectStore("uploadState", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

self.onmessage = function (e) {
  const { file, chunkSize, action } = e.data;

  if (action === "prepareChunks") {
    const chunks = [];
    let offset = 0;

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);
      chunks.push({
        start: offset,
        end: offset + chunk.size,
        size: chunk.size,
      });
      offset += chunkSize;
    }

    self.postMessage({ chunks, totalSize: file.size });
  }
};
