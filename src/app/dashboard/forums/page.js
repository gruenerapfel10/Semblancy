"use client";
import { useState, useEffect } from "react";
import styles from "./forums.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faComment,
  faEye,
  faThumbsUp,
  faClock,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Forums() {
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  // Simulate loading forum data
  useEffect(() => {
    const timer = setTimeout(() => {
      const forumData = [
        {
          id: 1,
          title: "Tips for solving complex calculus problems?",
          author: "MathWhiz",
          category: "mathematics",
          replies: 24,
          views: 156,
          likes: 42,
          lastActive: "2025-03-15T10:30:00",
          isSticky: true,
        },
        {
          id: 2,
          title: "Study group for AP Physics C: Mechanics",
          author: "PhysicsStudent",
          category: "physics",
          replies: 18,
          views: 98,
          likes: 31,
          lastActive: "2025-03-16T14:45:00",
        },
        {
          id: 3,
          title: "Help with organic chemistry nomenclature",
          author: "ChemNerd",
          category: "chemistry",
          replies: 32,
          views: 210,
          likes: 48,
          lastActive: "2025-03-16T16:20:00",
        },
        {
          id: 4,
          title: "How to approach literature analysis essays?",
          author: "BookLover",
          category: "english",
          replies: 15,
          views: 87,
          likes: 22,
          lastActive: "2025-03-15T09:15:00",
        },
        {
          id: 5,
          title: "Resources for history exam preparation",
          author: "HistoryBuff",
          category: "history",
          replies: 9,
          views: 65,
          likes: 17,
          lastActive: "2025-03-14T11:50:00",
        },
        {
          id: 6,
          title: "What calculators are allowed in the exam?",
          author: "ExamPrepper",
          category: "general",
          replies: 7,
          views: 112,
          likes: 15,
          lastActive: "2025-03-13T13:25:00",
        },
      ];

      setTopics(forumData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter topics based on active category
  const filteredTopics =
    activeCategory === "all"
      ? topics
      : topics.filter((topic) => topic.category === activeCategory);

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
          />
          <button className={styles.newTopicButton}>
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
        {isLoading ? (
          <LoadingSpinner text="Loading forums..." />
        ) : (
          <div className={styles.topicsList}>
            {filteredTopics.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No topics found</h3>
                <p>Be the first to start a discussion in this category!</p>
                <button className={styles.createTopicButton}>
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
                  }`}
                >
                  {topic.isSticky && (
                    <div className={styles.stickyBadge}>Pinned</div>
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
                      <span>{topic.replies}</span>
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
                      <span>{formatRelativeTime(topic.lastActive)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
