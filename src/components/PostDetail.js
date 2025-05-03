"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAmplify } from "@/app/context/Providers";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import styles from "./PostDetail.module.css";

export default function PostDetail({ postId }) {
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    identityId,
    getFileUrl,
    listFiles,
    deleteFile,
    uploadFile,
  } = useAmplify();

  // States
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Load post data
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        // List files to find the post
        const files = await listFiles("changelog/");
        const postFiles = files.filter((file) =>
          file.key.includes(`/${postId}.json`)
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

        const postData = await response.json();
        setPost(postData);

        // Load images if any
        if (postData.images && postData.images.length > 0) {
          const urls = await Promise.all(
            postData.images.map((imagePath) => getFileUrl(imagePath))
          );

          setImageUrls(urls);
          if (urls.length > 0) {
            setSelectedImage(urls[0]);
          }
        }
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Failed to load post. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, getFileUrl, listFiles]);

  // Toggle problem status (open/fixed)
  const toggleProblemStatus = async () => {
    if (actionLoading || !post || post.type !== "problem") return;

    setActionLoading(true);

    try {
      // Create updated post data
      const updatedPost = {
        ...post,
        status: post.status === "open" ? "fixed" : "open",
        updatedAt: new Date().toISOString(),
        updatedBy: user.username,
      };

      // Upload the updated post
      await uploadFile(
        new Blob([JSON.stringify(updatedPost, null, 2)], {
          type: "application/json",
        }),
        post.fileKey
      );

      // Update the post in the local state
      setPost(updatedPost);

      console.log(`Post ${post.id} status updated to ${updatedPost.status}`);
    } catch (err) {
      console.error("Error updating post status:", err);
      alert("Failed to update post status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete post
  const deletePost = async () => {
    if (actionLoading || !post) return;

    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      // Delete the post file
      await deleteFile(post.fileKey);

      // If post has images, delete them too
      if (post.images && post.images.length > 0) {
        for (const imagePath of post.images) {
          await deleteFile(imagePath);
        }
      }

      // Redirect to the changelog page
      router.push("/changelog");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
      setActionLoading(false);
    }
  };

  // Get post type badge class and label
  const getPostTypeInfo = (type) => {
    switch (type) {
      case "changelog":
        return { className: styles.changelogBadge, label: "Changelog" };
      case "problem":
        return { className: styles.problemBadge, label: "Problem" };
      default:
        return { className: styles.defaultBadge, label: "Post" };
    }
  };

  // Get post status badge class and label
  const getStatusInfo = (status) => {
    switch (status) {
      case "open":
        return { className: styles.openBadge, label: "Open" };
      case "fixed":
        return { className: styles.fixedBadge, label: "Fixed" };
      default:
        return { className: styles.defaultBadge, label: status };
    }
  };

  // Format date in a readable way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading post...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <Link href="/changelog" className={styles.backButton}>
          Back to Changelog
        </Link>
      </div>
    );
  }

  // Post not found
  if (!post) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>Post not found</p>
        <Link href="/changelog" className={styles.backButton}>
          Back to Changelog
        </Link>
      </div>
    );
  }

  const typeInfo = getPostTypeInfo(post.type);
  const statusInfo =
    post.type === "problem" ? getStatusInfo(post.status) : null;

  return (
    <div className={styles.postDetailContainer}>
      <div className={styles.postDetailHeader}>
        <Link href="/changelog" className={styles.backLink}>
          ← Back to Changelog
        </Link>

        {isAuthenticated && (
          <div className={styles.actions}>
            {post.type === "problem" && (
              <button
                onClick={toggleProblemStatus}
                className={`${styles.actionButton} ${
                  post.status === "open"
                    ? styles.fixButton
                    : styles.reopenButton
                }`}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className={styles.buttonSpinner}></span>
                ) : post.status === "open" ? (
                  "Mark as Fixed"
                ) : (
                  "Reopen Issue"
                )}
              </button>
            )}
            <Link
              href={`/changelog/edit?id=${post.id}`}
              className={styles.editButton}
            >
              Edit
            </Link>
            <button
              onClick={deletePost}
              className={styles.deleteButton}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <span className={styles.buttonSpinner}></span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        )}
      </div>

      <div className={styles.postDetailContent}>
        <div className={styles.postMeta}>
          <div className={styles.badges}>
            <span className={typeInfo.className}>{typeInfo.label}</span>
            {statusInfo && (
              <span className={statusInfo.className}>{statusInfo.label}</span>
            )}
            {post.version && (
              <span className={styles.versionBadge}>v{post.version}</span>
            )}
          </div>
          <div className={styles.dateMeta}>
            <span className={styles.dateLabel}>Posted:</span>
            <span
              className={styles.dateValue}
              title={formatDate(post.createdAt)}
            >
              {formatRelativeTime(post.createdAt)}
            </span>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <>
                <span className={styles.dateLabel}>Updated:</span>
                <span
                  className={styles.dateValue}
                  title={formatDate(post.updatedAt)}
                >
                  {formatRelativeTime(post.updatedAt)}
                </span>
              </>
            )}
          </div>
        </div>

        <h1 className={styles.postTitle}>{post.title}</h1>

        <div className={styles.authorInfo}>
          <span className={styles.authorLabel}>Posted by</span>
          <span className={styles.authorName}>{post.author}</span>
        </div>

        {imageUrls.length > 0 && (
          <div className={styles.imagesContainer}>
            <div className={styles.mainImageContainer}>
              <Image
                src={selectedImage}
                alt={post.title}
                width={800}
                height={500}
                className={styles.mainImage}
              />
            </div>

            {imageUrls.length > 1 && (
              <div className={styles.imageThumbnails}>
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className={`${styles.thumbnail} ${
                      url === selectedImage ? styles.selectedThumbnail : ""
                    }`}
                    onClick={() => setSelectedImage(url)}
                  >
                    <Image
                      src={url}
                      alt={`Image ${index + 1}`}
                      width={100}
                      height={100}
                      className={styles.thumbnailImage}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.markdownContent}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className={styles.postTags}>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/changelog?tag=${tag}`}
                className={styles.postTag}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className={styles.postFooter}>
          <div className={styles.postDates}>
            <div className={styles.postDate}>
              <span className={styles.dateLabel}>Posted:</span>
              <span className={styles.dateValue}>
                {formatDate(post.createdAt)}
              </span>
            </div>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <div className={styles.postDate}>
                <span className={styles.dateLabel}>Last updated:</span>
                <span className={styles.dateValue}>
                  {formatDate(post.updatedAt)}
                </span>
                {post.updatedBy && (
                  <span className={styles.updatedBy}>by {post.updatedBy}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
