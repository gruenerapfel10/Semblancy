// src/components/forums/NewTopicModal.jsx
import { useState } from "react";
import styles from "../Forums/NewTopicModal.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function NewTopicModal({ onClose, onSubmit, category }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!title.trim()) {
      setError("Please enter a title for your topic");
      return;
    }

    if (!content.trim()) {
      setError("Please enter content for your topic");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
      });
    } catch (err) {
      setError(err.message || "Failed to create topic. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Create New Topic</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="topic-title">Title</label>
            <input
              id="topic-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              disabled={isSubmitting}
              className={styles.topicTitle}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="topic-content">Content</label>
            <textarea
              id="topic-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to discuss?"
              disabled={isSubmitting}
              className={styles.topicContent}
              rows={10}
            />
          </div>

          <div className={styles.formActions}>
            <span className={styles.categoryTag}>
              Category: {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
            <div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? "Creating..." : "Create Topic"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
