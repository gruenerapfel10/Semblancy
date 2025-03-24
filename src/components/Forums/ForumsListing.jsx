"use client";
import { useState } from "react";
import styles from "../../app/dashboard/forums/forums.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faComment,
  faEye,
  faThumbsUp,
  faClock,
  faPlus,
  faLock,
  faThumbtack,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTopics } from "@/hooks/useForums";
import { useAmplify } from "@/app/context/Providers";
import NewTopicModal from "./NewTopicModal";
import { useRouter } from "next/navigation";

export default function ForumsListing() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const { topics, loading, error, refreshTopics, createTopic } = useTopics(
    null,
    activeCategory
  );
  const { user, isAuthenticated } = useAmplify();

  // Filter topics based on search term
  const filteredTopics = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTopic = async (topicData) => {
    try {
      await createTopic({
        ...topicData,
        category: activeCategory === "all" ? "general" : activeCategory,
      });

      setShowNewTopicModal(false);
      refreshTopics();
    } catch (error) {
      console.error("Error creating topic:", error);
      alert(error.message || "Failed to create topic");
    }
  };

  const handleViewTopic = (topicId) => {
    router.push(`/dashboard/forums?topicId=${topicId}`);
  };

  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Student Forums</h1>
        <p className={styles.subtitle}>
          Discuss, ask questions, and connect with other students
        </p>

        <div className={styles.searchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search forums..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={styles.newTopicButton}
            onClick={() =>
              isAuthenticated
                ? setShowNewTopicModal(true)
                : router.push("/login")
            }
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>New Topic</span>
          </button>
        </div>
      </div>

      <div className={styles.categoryNav}>
        <button
          className={`${styles.categoryButton} ${
            activeCategory === "all" ? styles.activeCategory : ""
          }`}
          onClick={() => setActiveCategory("all")}
        >
          All Topics
        </button>
        <button
          className={`${styles.categoryButton} ${
            activeCategory === "mathematics" ? styles.activeCategory : ""
          }`}
          onClick={() => setActiveCategory("mathematics")}
        >
          Mathematics
        </button>
        <button
          className={`${styles.categoryButton} ${
            activeCategory === "physics" ? styles.activeCategory : ""
          }`}
          onClick={() => setActiveCategory("physics")}
        >
          Physics
        </button>
        <button
          className={`${styles.categoryButton} ${
            activeCategory === "chemistry" ? styles.activeCategory : ""
          }`}
          onClick={() => setActiveCategory("chemistry")}
        >
          Chemistry
        </button>
        <button
          className={`${styles.categoryButton} ${
            activeCategory === "english" ? styles.activeCategory : ""
          }`}
          onClick={() => setActiveCategory("english")}
        >
          English
        </button>
        <button
          className={`${styles.categoryButton} ${
            activeCategory === "history" ? styles.activeCategory : ""
          }`}
          onClick={() => setActiveCategory("history")}
        >
          History
        </button>
        <button
          className={`${styles.categoryButton} ${
            activeCategory === "general" ? styles.activeCategory : ""
          }`}
          onClick={() => setActiveCategory("general")}
        >
          General
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <LoadingSpinner text="Loading forums..." />
        ) : error ? (
          <div className={styles.errorState}>
            <h3>Error Loading Forums</h3>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={refreshTopics}>
              Retry
            </button>
          </div>
        ) : (
          <div className={styles.topicsList}>
            {filteredTopics.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No topics found</h3>
                <p>Be the first to start a discussion in this category!</p>
                <button
                  className={styles.createTopicButton}
                  onClick={() =>
                    isAuthenticated
                      ? setShowNewTopicModal(true)
                      : router.push("/login")
                  }
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Create New Topic</span>
                </button>
              </div>
            ) : (
              filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className={`${styles.topicCard} ${
                    topic.isSticky ? styles.stickyTopic : ""
                  } ${topic.isLocked ? styles.lockedTopic : ""}`}
                  onClick={() => handleViewTopic(topic.id)}
                >
                  {topic.isSticky && (
                    <div className={styles.stickyBadge}>
                      <FontAwesomeIcon icon={faThumbtack} /> Pinned
                    </div>
                  )}
                  {topic.isLocked && (
                    <div className={styles.lockedBadge}>
                      <FontAwesomeIcon icon={faLock} /> Locked
                    </div>
                  )}
                  <div className={styles.topicMain}>
                    <h3 className={styles.topicTitle}>{topic.title}</h3>
                    <div className={styles.topicMeta}>
                      <span className={styles.topicAuthor}>
                        Posted by {topic.author}
                      </span>
                      <span className={styles.topicCategory}>
                        {topic.category.charAt(0).toUpperCase() +
                          topic.category.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.topicStats}>
                    <div className={styles.statItem}>
                      <FontAwesomeIcon
                        icon={faComment}
                        className={styles.statIcon}
                      />
                      <span>{topic.replyCount || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <FontAwesomeIcon
                        icon={faEye}
                        className={styles.statIcon}
                      />
                      <span>{topic.views}</span>
                    </div>
                    <div className={styles.statItem}>
                      <FontAwesomeIcon
                        icon={faThumbsUp}
                        className={styles.statIcon}
                      />
                      <span>{topic.likes}</span>
                    </div>
                    <div className={styles.lastActive}>
                      <FontAwesomeIcon
                        icon={faClock}
                        className={styles.statIcon}
                      />
                      <span>{formatRelativeTime(topic.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showNewTopicModal && (
        <NewTopicModal
          onClose={() => setShowNewTopicModal(false)}
          onSubmit={handleCreateTopic}
          category={activeCategory === "all" ? "general" : activeCategory}
        />
      )}
    </div>
  );
}
