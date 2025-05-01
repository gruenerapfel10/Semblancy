"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin-forums.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faFlag,
  faTrash,
  faCheck,
  faTimes,
  faSearch,
  faLock,
  faUnlock,
  faThumbsUp,
  faThumbsDown,
  faThumbtack,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAmplify } from "@/app/context/Providers";
import { useAdminForum, useTopics } from "@/hooks/useForums";
import ForumService from "@/services/ForumService";

export default function AdminForums() {
  const router = useRouter();
  const { user, isAuthenticated } = useAmplify();
  const [activeTab, setActiveTab] = useState("flagged");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    flaggedContent,
    loading: flagsLoading,
    error: flagsError,
    refreshFlaggedContent,
    reviewFlag,
    updateTopicAdmin,
  } = useAdminForum();

  const {
    topics: recentTopics,
    loading: topicsLoading,
    error: topicsError,
    refreshTopics,
  } = useTopics();

  // Check for admin/moderator privileges
  const hasModeratorPrivileges = user?.groups?.some((group) =>
    ["Admins", "Moderators"].includes(group)
  );

  // Check if user is authorized
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    router.push("/login");
    return <LoadingSpinner text="Redirecting to login..." />;
  }

  if (!hasModeratorPrivileges) {
    // Redirect to dashboard if not authorized
    router.push("/dashboard");
    return <LoadingSpinner text="Unauthorized access. Redirecting..." />;
  }

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Refresh data for the selected tab
    if (tab === "flagged") {
      refreshFlaggedContent();
    } else if (tab === "topics") {
      refreshTopics();
    }
  };

  // Handle topic actions
  const handleTopicAction = async (action, topicId) => {
    try {
      switch (action) {
        case "lock":
          await updateTopicAdmin(topicId, { isLocked: true });
          break;
        case "unlock":
          await updateTopicAdmin(topicId, { isLocked: false });
          break;
        case "sticky":
          await updateTopicAdmin(topicId, { isSticky: true });
          break;
        case "unsticky":
          await updateTopicAdmin(topicId, { isSticky: false });
          break;
        case "remove":
          await updateTopicAdmin(topicId, { isRemoved: true });
          break;
      }

      // Refresh topics
      refreshTopics();
    } catch (err) {
      console.error(`Error performing ${action} on topic:`, err);
      alert(`Failed to ${action} topic. Please try again.`);
    }
  };

  // Handle flagged content actions
  const handleFlagAction = async (action, flagId, contentId, contentType) => {
    try {
      if (action === "approve") {
        // Mark flag as resolved and take no action on content
        await reviewFlag(flagId, "approved", "keep");
      } else if (action === "remove") {
        // Remove the content and resolve the flag
        await reviewFlag(flagId, "approved", "remove");
      }
    } catch (err) {
      console.error(`Error handling flag action:`, err);
      alert("Failed to process flagged content. Please try again.");
    }
  };

  // Filter topics based on search term
  const filteredTopics = recentTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // View topic details
  const viewTopic = (topicId) => {
    router.push(`/dashboard/forums?topicId=${topicId}`);
  };

  // Determine loading state
  const isLoading = activeTab === "flagged" ? flagsLoading : topicsLoading;

  // Determine error state
  const error = activeTab === "flagged" ? flagsError : topicsError;

  if (isLoading) {
    return <LoadingSpinner text="Loading admin tools..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Forum Administration</h1>
        <p className={styles.subtitle}>Manage and moderate forum content</p>
      </div>

      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "flagged" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("flagged")}
        >
          <FontAwesomeIcon icon={faFlag} /> Flagged Content
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "topics" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabChange("topics")}
        >
          <FontAwesomeIcon icon={faUsers} /> Manage Topics
        </button>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.contentContainer}>
        {error && (
          <div className={styles.errorContainer}>
            <h2>Error</h2>
            <p>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() =>
                activeTab === "flagged"
                  ? refreshFlaggedContent()
                  : refreshTopics()
              }
            >
              Retry
            </button>
          </div>
        )}

        {activeTab === "flagged" && !error && (
          <div className={styles.flaggedContent}>
            <h2 className={styles.sectionTitle}>Flagged Content</h2>

            {flaggedContent.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No flagged content to review.</p>
              </div>
            ) : (
              <div className={styles.flagList}>
                {flaggedContent.map((flag) => (
                  <div key={flag.id} className={styles.flagItem}>
                    <div className={styles.flagHeader}>
                      <div className={styles.flagType}>
                        {flag.contentType === "topic" ? "Topic" : "Reply"}
                      </div>
                      <div className={styles.flagReporter}>
                        Reported by: {flag.reporterId}
                      </div>
                      <div className={styles.flagDate}>
                        {formatDate(flag.createdAt)}
                      </div>
                    </div>

                    <div className={styles.flagContent}>
                      <p className={styles.flaggedContent}>
                        Content ID: {flag.contentId}
                        {/* In a real implementation, you'd fetch and display the actual content */}
                      </p>
                      <p className={styles.flagReason}>
                        <strong>Reason:</strong> {flag.reason}
                      </p>
                    </div>

                    <div className={styles.flagActions}>
                      <button
                        className={styles.approveButton}
                        onClick={() =>
                          handleFlagAction(
                            "approve",
                            flag.id,
                            flag.contentId,
                            flag.contentType
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faCheck} /> Approve Content
                      </button>
                      <button
                        className={styles.removeButton}
                        onClick={() =>
                          handleFlagAction(
                            "remove",
                            flag.id,
                            flag.contentId,
                            flag.contentType
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} /> Remove Content
                      </button>
                      {flag.contentType === "topic" && (
                        <button
                          className={styles.viewButton}
                          onClick={() => viewTopic(flag.contentId)}
                        >
                          View Topic
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "topics" && !error && (
          <div className={styles.topicsContent}>
            <h2 className={styles.sectionTitle}>Manage Topics</h2>

            {filteredTopics.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No topics found matching your search.</p>
              </div>
            ) : (
              <div className={styles.topicsList}>
                {filteredTopics.map((topic) => (
                  <div key={topic.id} className={styles.topicItem}>
                    <div
                      className={styles.topicMain}
                      onClick={() => viewTopic(topic.id)}
                    >
                      <h3 className={styles.topicTitle}>{topic.title}</h3>
                      <div className={styles.topicMeta}>
                        <span className={styles.topicAuthor}>
                          Posted by {topic.author}
                        </span>
                        <span className={styles.topicDate}>
                          {formatDate(topic.createdAt)}
                        </span>
                        <span className={styles.topicCategory}>
                          {topic.category.charAt(0).toUpperCase() +
                            topic.category.slice(1)}
                        </span>
                        {topic.isLocked && (
                          <span className={styles.topicLocked}>Locked</span>
                        )}
                        {topic.isSticky && (
                          <span className={styles.topicSticky}>Pinned</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.topicActions}>
                      {topic.isLocked ? (
                        <button
                          className={styles.actionButton}
                          onClick={() => handleTopicAction("unlock", topic.id)}
                          title="Unlock Topic"
                        >
                          <FontAwesomeIcon icon={faUnlock} />
                        </button>
                      ) : (
                        <button
                          className={styles.actionButton}
                          onClick={() => handleTopicAction("lock", topic.id)}
                          title="Lock Topic"
                        >
                          <FontAwesomeIcon icon={faLock} />
                        </button>
                      )}

                      {topic.isSticky ? (
                        <button
                          className={styles.actionButton}
                          onClick={() =>
                            handleTopicAction("unsticky", topic.id)
                          }
                          title="Remove Pin"
                        >
                          <FontAwesomeIcon icon={faThumbsDown} />
                        </button>
                      ) : (
                        <button
                          className={styles.actionButton}
                          onClick={() => handleTopicAction("sticky", topic.id)}
                          title="Pin Topic"
                        >
                          <FontAwesomeIcon icon={faThumbtack} />
                        </button>
                      )}

                      <button
                        className={styles.actionButton}
                        onClick={() => handleTopicAction("remove", topic.id)}
                        title="Remove Topic"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
