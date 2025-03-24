"use client";
import { useState, useEffect } from "react";
import styles from "./TopicView.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faThumbsUp,
  faShare,
  faFlag,
  faReply,
  faLock,
  faTrash,
  faEdit,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTopic } from "@/hooks/useForums";
import { useAmplify } from "@/app/context/Providers";
import ReplyForm from "../Forums/ReplyForm";
import ForumService from "@/services/ForumService";
import { useRouter } from "next/navigation";

export default function TopicView({ topicId, onBack }) {
  const router = useRouter();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const {
    topic,
    replies,
    loading,
    error,
    refreshTopic,
    createReply,
    toggleLike,
  } = useTopic(topicId);

  const { user, isAuthenticated } = useAmplify();

  // Check if user is admin or moderator
  const isAdminOrModerator = user?.groups?.some(
    (group) => group === "Admins" || group === "Moderators"
  );

  // Check if user is the author
  const isAuthor = topic && user && topic.authorId === user.userId;

  // Handle reply submission
  const handleReply = async (content) => {
    try {
      await createReply(content);
      setShowReplyForm(false);
    } catch (err) {
      console.error("Error creating reply:", err);
      alert(err.message || "Failed to post reply. Please try again.");
    }
  };

  // Handle topic lock/unlock
  const handleToggleLock = async () => {
    if (!isAdminOrModerator || !topic) return;

    try {
      await ForumService.updateTopic(topicId, {
        isLocked: !topic.isLocked,
      });
      refreshTopic();
    } catch (err) {
      console.error("Error toggling lock status:", err);
      alert("Failed to update topic status");
    }
  };

  // Handle report
  const handleReport = async () => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    const reason = prompt("Please provide a reason for reporting this topic:");
    if (!reason) return; // User cancelled

    try {
      await ForumService.createFlag({
        contentId: topicId,
        contentType: "topic",
        reporterId: user.userId,
        reason,
      });

      alert("Thank you for your report. A moderator will review this content.");
    } catch (err) {
      console.error("Error reporting topic:", err);
      alert("Failed to submit report. Please try again.");
    }
  };

  // Handle reply report
  const handleReplyReport = async (replyId) => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    const reason = prompt("Please provide a reason for reporting this reply:");
    if (!reason) return; // User cancelled

    try {
      await ForumService.createFlag({
        contentId: replyId,
        contentType: "reply",
        reporterId: user.userId,
        reason,
      });

      alert("Thank you for your report. A moderator will review this content.");
    } catch (err) {
      console.error("Error reporting reply:", err);
      alert("Failed to submit report. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <LoadingSpinner text="Loading topic..." />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button className={styles.backButton} onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Forums
        </button>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className={styles.errorContainer}>
        <h2>Topic Not Found</h2>
        <button className={styles.backButton} onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Forums
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topicHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Forums
        </button>

        <h1 className={styles.topicTitle}>{topic.title}</h1>

        <div className={styles.topicMeta}>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{topic.author}</span>
            <span className={styles.postDate}>
              {formatDate(topic.createdAt)}
            </span>
          </div>

          <div className={styles.topicActions}>
            <button className={styles.actionButton} onClick={toggleLike}>
              <FontAwesomeIcon icon={faThumbsUp} /> {topic.likes}
            </button>

            <button className={styles.actionButton}>
              <FontAwesomeIcon icon={faShare} /> Share
            </button>

            {isAuthenticated && !isAuthor && (
              <button className={styles.actionButton} onClick={handleReport}>
                <FontAwesomeIcon icon={faFlag} /> Report
              </button>
            )}

            {isAdminOrModerator && (
              <button
                className={`${styles.actionButton} ${
                  topic.isLocked ? styles.lockedButton : ""
                }`}
                onClick={handleToggleLock}
              >
                <FontAwesomeIcon icon={faLock} />{" "}
                {topic.isLocked ? "Unlock" : "Lock"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.topicContent}>
        <p>{topic.content}</p>
      </div>

      <div className={styles.repliesSection}>
        <div className={styles.repliesHeader}>
          <h2>
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </h2>

          {isAuthenticated && !topic.isLocked ? (
            <button
              className={styles.replyButton}
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <FontAwesomeIcon icon={faReply} />{" "}
              {showReplyForm ? "Cancel" : "Reply"}
            </button>
          ) : topic.isLocked ? (
            <div className={styles.lockedMessage}>
              <FontAwesomeIcon icon={faLock} /> This topic is locked
            </div>
          ) : (
            <button
              className={styles.replyButton}
              onClick={() => router.push("/login")}
            >
              <FontAwesomeIcon icon={faReply} /> Login to Reply
            </button>
          )}
        </div>

        {showReplyForm && (
          <ReplyForm
            onSubmit={handleReply}
            onCancel={() => setShowReplyForm(false)}
          />
        )}

        {replies.length > 0 ? (
          <div className={styles.repliesList}>
            {replies.map((reply) => (
              <div key={reply.id} className={styles.replyCard}>
                <div className={styles.replyHeader}>
                  <div className={styles.replyAuthor}>
                    <span className={styles.authorName}>{reply.author}</span>
                    <span className={styles.replyDate}>
                      <FontAwesomeIcon
                        icon={faClock}
                        className={styles.clockIcon}
                      />
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>

                  <div className={styles.replyActions}>
                    {(isAdminOrModerator ||
                      (user && reply.authorId === user.userId)) && (
                      <>
                        <button className={styles.replyActionButton}>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className={styles.replyActionButton}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    )}

                    {isAuthenticated && !isAuthor && (
                      <button
                        className={styles.replyActionButton}
                        onClick={() => handleReplyReport(reply.id)}
                      >
                        <FontAwesomeIcon icon={faFlag} />
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.replyContent}>
                  <p>{reply.content}</p>
                </div>

                <div className={styles.replyFooter}>
                  <button
                    className={styles.likeButton}
                    onClick={() => ForumService.toggleReplyLike(reply.id)}
                  >
                    <FontAwesomeIcon icon={faThumbsUp} /> {reply.likes}
                  </button>

                  {isAuthenticated && !topic.isLocked && (
                    <button
                      className={styles.replyToButton}
                      onClick={() => {
                        setShowReplyForm(true);
                        // You could add logic here to focus on the reply form
                        // and maybe add a mention of the user being replied to
                      }}
                    >
                      <FontAwesomeIcon icon={faReply} /> Reply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noReplies}>
            <p>No replies yet. Be the first to reply!</p>
          </div>
        )}
      </div>
    </div>
  );
}
