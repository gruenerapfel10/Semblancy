"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAmplify } from "@/app/Providers";
import { v4 as uuidv4 } from "uuid";
import styles from "./PostForm.module.css";

export default function PostForm({ postId = null }) {
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    identityId,
    uploadFile,
    getFileUrl,
    listFiles,
  } = useAmplify();
  const fileInputRef = useRef(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("changelog");
  const [version, setVersion] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState("open");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [originalPost, setOriginalPost] = useState(null);

  // Check authentication and load post if in edit mode
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // If postId is provided, we're in edit mode
    if (postId) {
      setIsEdit(true);
      loadPost(postId);
    }
  }, [isAuthenticated, postId, router]);

  // Load post data for editing
  const loadPost = async (id) => {
    setLoading(true);
    setError(null);

    try {
      // List files to find the post by ID
      const files = await listFiles("changelog/");
      const postFiles = files.filter((file) =>
        file.key.includes(`/${id}.json`)
      );

      if (postFiles.length === 0) {
        throw new Error("Post not found");
      }

      // Get the post file URL
      const url = await getFileUrl(postFiles[0].key);

      // Fetch the post data
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch post data");
      }

      const post = await response.json();
      setOriginalPost(post);

      // Populate form fields
      setTitle(post.title || "");
      setContent(post.content || "");
      setPostType(post.type || "changelog");
      setVersion(post.version || "");
      setTags(post.tags || []);
      setTagsInput(post.tags ? post.tags.join(", ") : "");

      if (post.type === "problem") {
        setStatus(post.status || "open");
      }

      // Load image previews if any
      if (post.images && post.images.length > 0) {
        const imageUrls = await Promise.all(
          post.images.map((imagePath) => getFileUrl(imagePath))
        );

        setImagePreviewUrls(
          imageUrls.map((url, index) => ({
            url,
            path: post.images[index],
          }))
        );
      }
    } catch (err) {
      console.error("Error loading post:", err);
      setError("Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

    // Generate preview URLs
    const newPreviewUrls = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    setImagePreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
  };

  // Remove a selected image
  const removeImage = (index) => {
    const newPreviewUrls = [...imagePreviewUrls];
    const removedPreview = newPreviewUrls.splice(index, 1)[0];
    setImagePreviewUrls(newPreviewUrls);

    // If the preview was for a selected file (not an existing image)
    if (removedPreview.file) {
      setSelectedFiles((prevFiles) =>
        prevFiles.filter((file) => file !== removedPreview.file)
      );

      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(removedPreview.url);
    }
  };

  // Process tags from comma-separated input
  const processTagsInput = () => {
    const processedTags = tagsInput
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    // Remove duplicates
    const uniqueTags = [...new Set(processedTags)];
    setTags(uniqueTags);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    // Final tags processing
    processTagsInput();

    setSavingPost(true);
    setError(null);

    try {
      const postId = isEdit ? originalPost.id : uuidv4();
      const timestamp = new Date().toISOString();

      // Upload images first if any
      const uploadedImagePaths = [];

      // Keep existing images in edit mode
      if (isEdit && originalPost.images) {
        for (const preview of imagePreviewUrls) {
          if (preview.path) {
            uploadedImagePaths.push(preview.path);
          }
        }
      }

      // Upload new selected files
      for (const file of selectedFiles) {
        const fileExt = file.name.split(".").pop().toLowerCase();
        const imagePath = `changelog/${postId}/images/${uuidv4()}.${fileExt}`;

        await uploadFile(file, imagePath);
        uploadedImagePaths.push(imagePath);
      }

      // Prepare post data
      const postData = {
        id: postId,
        title,
        content,
        type: postType,
        tags,
        createdAt: isEdit ? originalPost.createdAt : timestamp,
        updatedAt: timestamp,
        author: user.username,
        images: uploadedImagePaths,
      };

      // Add version for changelog posts
      if (postType === "changelog" && version.trim()) {
        postData.version = version.trim();
      }

      // Add status for problem posts
      if (postType === "problem") {
        postData.status = isEdit ? status : "open";
      }

      // Upload post JSON file
      const postPath = `changelog/${postId}/${postId}.json`;
      await uploadFile(
        new Blob([JSON.stringify(postData, null, 2)], {
          type: "application/json",
        }),
        postPath
      );

      // Redirect to the changelog page
      router.push("/changelog");
    } catch (err) {
      console.error("Error saving post:", err);
      setError("Failed to save post. Please try again.");
      setSavingPost(false);
    }
  };

  // Loading state display
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading post data...</p>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>
          {isEdit ? "Edit Post" : "Create New Post"}
        </h1>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Post Type</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="postType"
                value="changelog"
                checked={postType === "changelog"}
                onChange={() => setPostType("changelog")}
                className={styles.radioInput}
              />
              Changelog Entry
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="postType"
                value="problem"
                checked={postType === "problem"}
                onChange={() => setPostType("problem")}
                className={styles.radioInput}
              />
              Problem Report
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.formLabel}>
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.formInput}
            placeholder="Enter post title"
            required
          />
        </div>

        {postType === "changelog" && (
          <div className={styles.formGroup}>
            <label htmlFor="version" className={styles.formLabel}>
              Version (optional)
            </label>
            <input
              type="text"
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className={styles.formInput}
              placeholder="e.g., 1.2.0"
            />
          </div>
        )}

        {postType === "problem" && isEdit && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Status</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status"
                  value="open"
                  checked={status === "open"}
                  onChange={() => setStatus("open")}
                  className={styles.radioInput}
                />
                Open
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status"
                  value="fixed"
                  checked={status === "fixed"}
                  onChange={() => setStatus("fixed")}
                  className={styles.radioInput}
                />
                Fixed
              </label>
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.formLabel}>
            Content (Markdown supported)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textArea}
            rows={10}
            placeholder="Enter post content with Markdown formatting"
            required
          ></textarea>
          <div className={styles.markdownHint}>
            <strong>Markdown tips:</strong> Use # for headings, * for lists, **
            for bold, * for italic, ``` for code blocks
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags" className={styles.formLabel}>
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tagsInput}
            onChange={(e) => {
              setTagsInput(e.target.value);
              processTagsInput();
            }}
            onBlur={processTagsInput}
            className={styles.formInput}
            placeholder="e.g., ui, performance, bug"
          />
          {tags.length > 0 && (
            <div className={styles.tagsPreview}>
              {tags.map((tag, index) => (
                <span key={index} className={styles.tagPreview}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Images (optional)</label>
          <div
            className={styles.imageUploadArea}
            onClick={() => fileInputRef.current.click()}
          >
            <div className={styles.uploadIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7"></path>
                <path d="M16 5h6v6"></path>
                <path d="M8 21l15-15"></path>
              </svg>
            </div>
            <div className={styles.uploadText}>
              <p>Click to upload images</p>
              <p className={styles.uploadHint}>PNG, JPG, GIF up to 5MB</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className={styles.fileInput}
            />
          </div>

          {imagePreviewUrls.length > 0 && (
            <div className={styles.imagePreviewContainer}>
              {imagePreviewUrls.map((preview, index) => (
                <div key={index} className={styles.imagePreviewItem}>
                  <div className={styles.imagePreviewWrapper}>
                    <Image
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      width={100}
                      height={100}
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeImageButton}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.push("/changelog")}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={savingPost}
          >
            {savingPost ? (
              <>
                <span className={styles.buttonSpinner}></span>
                {isEdit ? "Saving..." : "Publishing..."}
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Publish Post"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
