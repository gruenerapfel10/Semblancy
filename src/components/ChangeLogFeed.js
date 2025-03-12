"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAmplify } from "@/app/Providers";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import styles from "./changelog-feed.module.css";

export default function ChangelogFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isAuthenticated,
    user,
    identityId,
    getFileUrl,
    listFiles,
    deleteFile,
    uploadFile,
  } = useAmplify();

  // States for posts and filtering
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [allTags, setAllTags] = useState([]);

  // Post action loading states
  const [actionLoading, setActionLoading] = useState({});

  // Extract URL parameters on component mount
  useEffect(() => {
    const type = searchParams.get("type") || "all";
    const status = searchParams.get("status") || "all";
    const query = searchParams.get("query") || "";
    const tag = searchParams.get("tag") || "";
    const sort = searchParams.get("sort") || "newest";

    setSelectedType(type);
    setSelectedStatus(status);
    setSearchQuery(query);
    setFilterTag(tag);
    setSortOrder(sort);
  }, [searchParams]);

  // Load posts on component mount and when filters change
  useEffect(() => {
    fetchPosts();
  }, [isAuthenticated, identityId]);

  // Fetch posts from S3
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated || !identityId) {
        throw new Error("Authentication required");
      }

      // List all files in the changelog folder
      const files = await listFiles("changelog/");

      // Filter only JSON files
      const jsonFiles = files.filter((file) => file.key.endsWith(".json"));

      // Load the content of each file
      const postsData = await Promise.all(
        jsonFiles.map(async (file) => {
          try {
            // Get the file URL
            const url = await getFileUrl(file.key);

            // Fetch the file content
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Failed to fetch ${file.key}`);
            }

            const data = await response.json();

            // Add the file key for reference
            data.fileKey = file.key;

            // If post has images, get their URLs
            if (data.images && data.images.length > 0) {
              data.imageUrls = await Promise.all(
                data.images.map((imagePath) => getFileUrl(imagePath))
              );
            }

            return data;
          } catch (err) {
            console.error(`Error loading ${file.key}:`, err);
            return null;
          }
        })
      );

      // Filter out any null values from failed loads
      const validPosts = postsData.filter((post) => post !== null);

      // Sort posts
      const sortedPosts = sortPosts(validPosts, sortOrder);

      // Extract all unique tags
      const tags = [
        ...new Set(sortedPosts.flatMap((post) => post.tags || [])),
      ].sort();

      setPosts(sortedPosts);
      setAllTags(tags);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to sort posts
  const sortPosts = (posts, order) => {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      if (order === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  };

  // Toggle problem status (open/fixed)
  const toggleProblemStatus = async (post) => {
    if (actionLoading[post.id]) return;

    setActionLoading((prev) => ({ ...prev, [post.id]: true }));

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
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === post.id ? updatedPost : p))
      );

      console.log(`Post ${post.id} status updated to ${updatedPost.status}`);
    } catch (err) {
      console.error("Error updating post status:", err);
      alert("Failed to update post status. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [post.id]: false }));
    }
  };

  // Delete a post
  const deletePost = async (post) => {
    if (actionLoading[post.id]) return;

    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [post.id]: true }));

    try {
      // Delete the post file
      await deleteFile(post.fileKey);

      // If post has images, delete them too
      if (post.images && post.images.length > 0) {
        for (const imagePath of post.images) {
          await deleteFile(imagePath);
        }
      }

      // Remove the post from the local state
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));

      console.log(`Post ${post.id} deleted successfully`);
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [post.id]: false }));
    }
  };

  // Update URL when filters change
  const updateFilters = (key, value) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (value && value !== "all") {
      current.set(key, value);
    } else {
      current.delete(key);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`/changelog${query}`);
  };

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateFilters("query", value);
  };

  // Handle filter changes
  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value);
    updateFilters("type", value);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setSelectedStatus(value);
    updateFilters("status", value);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    updateFilters("sort", value);

    // Re-sort posts
    setPosts(sortPosts(posts, value));
  };

  const handleTagClick = (tag) => {
    setFilterTag(tag === filterTag ? "" : tag);
    updateFilters("tag", tag === filterTag ? "" : tag);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedStatus("all");
    setSortOrder("newest");
    setFilterTag("");
    router.push("/changelog");
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
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Filter posts based on current filters
  const filteredPosts = posts.filter((post) => {
    // Type filter
    if (selectedType !== "all" && post.type !== selectedType) {
      return false;
    }

    // Status filter (only applicable for problem posts)
    if (selectedStatus !== "all" && post.type === "problem") {
      if (post.status !== selectedStatus) {
        return false;
      }
    }

    // Tag filter
    if (filterTag && (!post.tags || !post.tags.includes(filterTag))) {
      return false;
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.tags &&
          post.tags.some((tag) => tag.toLowerCase().includes(query))) ||
        (post.version && post.version.toLowerCase().includes(query))
      );
    }

    return true;
  });

  return (
    <div className={styles.changelogContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Changelog & Issues</h1>
          <p className={styles.subtitle}>
            Track updates, improvements, and reported issues
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Type</label>
              <select
                value={selectedType}
                onChange={handleTypeChange}
                className={styles.filterSelect}
              >
                <option value="all">All Types</option>
                <option value="changelog">Changelog</option>
                <option value="problem">Problem</option>
              </select>
            </div>

            {(selectedType === "all" || selectedType === "problem") && (
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className={styles.filterSelect}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            )}

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort</label>
              <select
                value={sortOrder}
                onChange={handleSortChange}
                className={styles.filterSelect}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {(selectedType !== "all" ||
              selectedStatus !== "all" ||
              searchQuery ||
              filterTag) && (
              <button onClick={clearFilters} className={styles.clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          {allTags.length > 0 && (
            <div className={styles.tagsContainer}>
              <h3 className={styles.tagsTitle}>Tags</h3>
              <div className={styles.tagsList}>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`${styles.tagButton} ${
                      tag === filterTag ? styles.activeTag : ""
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className={styles.actions}>
              <Link href="/changelog/new" className={styles.newPostButton}>
                Create New Post
              </Link>
            </div>
          )}
        </aside>

        <main className={styles.feedContent}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading posts...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
              <button onClick={fetchPosts} className={styles.retryButton}>
                Retry
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className={styles.noResults}>
              <h3>No posts found</h3>
              <p>Try adjusting your filters or create a new post</p>
            </div>
          ) : (
            <div className={styles.postsList}>
              {filteredPosts.map((post) => {
                const typeInfo = getPostTypeInfo(post.type);
                const statusInfo =
                  post.type === "problem" ? getStatusInfo(post.status) : null;

                return (
                  <div key={post.id} className={styles.postCard}>
                    <div className={styles.postHeader}>
                      <div className={styles.postMeta}>
                        <div className={styles.badges}>
                          <span className={typeInfo.className}>
                            {typeInfo.label}
                          </span>
                          {statusInfo && (
                            <span className={statusInfo.className}>
                              {statusInfo.label}
                            </span>
                          )}
                          {post.version && (
                            <span className={styles.versionBadge}>
                              v{post.version}
                            </span>
                          )}
                        </div>
                        <span className={styles.postDate}>
                          {formatDate(post.createdAt)}
                        </span>
                      </div>

                      {isAuthenticated && (
                        <div className={styles.postActions}>
                          {post.type === "problem" && (
                            <button
                              onClick={() => toggleProblemStatus(post)}
                              className={`${styles.actionButton} ${
                                post.status === "open"
                                  ? styles.fixButton
                                  : styles.reopenButton
                              }`}
                              disabled={actionLoading[post.id]}
                            >
                              {actionLoading[post.id] ? (
                                <span className={styles.buttonSpinner}></span>
                              ) : post.status === "open" ? (
                                "Mark Fixed"
                              ) : (
                                "Reopen"
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
                            onClick={() => deletePost(post)}
                            className={styles.deleteButton}
                            disabled={actionLoading[post.id]}
                          >
                            {actionLoading[post.id] ? (
                              <span className={styles.buttonSpinner}></span>
                            ) : (
                              "Delete"
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <h2 className={styles.postTitle}>
                      <Link
                        href={`/changelog/view?id=${post.id}`}
                        className={styles.postTitleLink}
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <div className={styles.postContent}>
                      <ReactMarkdown className={styles.markdown}>
                        {post.content.length > 300
                          ? `${post.content.substring(0, 300)}...`
                          : post.content}
                      </ReactMarkdown>

                      {post.content.length > 300 && (
                        <Link
                          href={`/changelog/${post.id}`}
                          className={styles.readMore}
                        >
                          Read more
                        </Link>
                      )}
                    </div>

                    {post.imageUrls && post.imageUrls.length > 0 && (
                      <div className={styles.postImages}>
                        {post.imageUrls.slice(0, 3).map((imageUrl, index) => (
                          <div key={index} className={styles.imagePreview}>
                            <Image
                              src={imageUrl}
                              alt={`Image ${index + 1} for ${post.title}`}
                              width={100}
                              height={100}
                              className={styles.previewImage}
                            />
                          </div>
                        ))}
                        {post.imageUrls.length > 3 && (
                          <div className={styles.moreImages}>
                            +{post.imageUrls.length - 3} more
                          </div>
                        )}
                      </div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className={styles.postTags}>
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={styles.postTag}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={styles.postFooter}>
                      <div className={styles.postAuthor}>
                        Posted by{" "}
                        <span className={styles.authorName}>{post.author}</span>
                      </div>

                      <Link
                        href={`/changelog/view?id=${post.id}`}
                        className={styles.viewDetails}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
