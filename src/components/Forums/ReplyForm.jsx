// src/components/forums/ReplyForm.jsx
import { useState } from "react";
import styles from "./ReplyForm.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function ReplyForm({
  onSubmit,
  onCancel,
  parentReplyId = null,
}) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return; // Don't submit empty replies
    }

    try {
      setIsSubmitting(true);
      await onSubmit(content.trim(), parentReplyId);
      setContent("");
    } catch (err) {
      console.error("Error submitting reply:", err);
      alert(err.message || "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.replyForm}>
      <form onSubmit={handleSubmit}>
        <textarea
          className={styles.replyInput}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reply..."
          disabled={isSubmitting}
          rows={5}
        />

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !content.trim()}
          >
            <FontAwesomeIcon icon={faPaperPlane} />{" "}
            {isSubmitting ? "Posting..." : "Post Reply"}
          </button>
        </div>
      </form>
    </div>
  );
}
