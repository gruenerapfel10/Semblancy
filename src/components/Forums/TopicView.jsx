"use client";
import { useState, useEffect } from "react";
import styles from "./TopicView.module.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ThumbsUp,
  Share,
  Flag,
  Reply,
  Lock,
  Trash,
  Edit,
  Clock,
  Send,
  MoreHorizontal,
  MessageCircle,
  Heart,
  Award,
  Calendar,
  User,
  BookmarkCheck,
  Bookmark,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTopic } from "@/hooks/useForums";
import { useAmplify } from "@/app/context/Providers";
import ReplyForm from "../Forums/ReplyForm";
import ForumService from "@/services/ForumService";
import { useRouter } from "next/navigation";

// User Avatar Component
const UserAvatar = ({ name, size = 40, image = null }) => {
  // Generate consistent color based on name
  const getInitialAndColor = (name) => {
    const initial = name ? name.charAt(0).toUpperCase() : "?";
    const colors = [
      "linear-gradient(135deg, #FF9966, #FF5E62)",
      "linear-gradient(135deg, #43CBFF, #9708CC)",
      "linear-gradient(135deg, #FFC371, #FF5F6D)",
      "linear-gradient(135deg, #4E65FF, #92EFFD)",
      "linear-gradient(135deg, #A9F1DF, #FFBBBB)",
      "linear-gradient(135deg, #7F7FD5, #86A8E7)",
    ];
    
    // Use username to determine consistent color
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    
    return { initial, background: colors[colorIndex] };
  };
  
  const { initial, background } = getInitialAndColor(name);
  
  if (image) {
    return (
      <div 
        className={styles.authorAvatar} 
        style={{ 
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: `${size}px`, 
          height: `${size}px` 
        }}
      />
    );
  }
  
  return (
    <div 
      className={styles.authorAvatar} 
      style={{ 
        background, 
        width: `${size}px`, 
        height: `${size}px`,
        fontSize: `${size/2.5}px`
      }}
    >
      {initial}
    </div>
  );
};

// Format date for display with relative time
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function TopicView({ topicId, onBack }) {
  const router = useRouter();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [likedStatus, setLikedStatus] = useState({});
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

  // Handle like toggling with animation
  const handleLike = async () => {
    await toggleLike();
    setLikedStatus(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  // Handle reply like toggling
  const handleReplyLike = async (replyId) => {
    await ForumService.toggleReplyLike(replyId);
    setLikedStatus(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
    refreshTopic();
  };

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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingSpinner text="Loading discussion..." />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className={styles.errorContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Error</h2>
        <p>{error}</p>
        <motion.button 
          className={styles.backButton} 
          onClick={onBack}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} /> Back to Forums
        </motion.button>
      </motion.div>
    );
  }

  if (!topic) {
    return (
      <motion.div 
        className={styles.errorContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Topic Not Found</h2>
        <motion.button 
          className={styles.backButton} 
          onClick={onBack}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} /> Back to Forums
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.topicHeader}>
        <motion.button 
          className={styles.backButton} 
          onClick={onBack}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} /> Back to Forums
        </motion.button>

        <motion.h1 
          className={styles.topicTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {topic.title}
        </motion.h1>

        <motion.div 
          className={styles.topicMeta}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className={styles.authorInfo}>
            <UserAvatar name={topic.author} size={48} image={topic.authorAvatar} />
            <div className={styles.authorDetails}>
              <span className={styles.authorName}>{topic.author}</span>
              <span className={styles.postDate}>
                <Clock size={14} className={styles.dateIcon} />
                {formatDate(topic.createdAt)}
              </span>
            </div>
          </div>

          <div className={styles.topicActions}>
            <motion.button 
              className={`${styles.actionButton} ${styles.likeButton} ${likedStatus[topicId] ? styles.liked : ''}`} 
              onClick={handleLike}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThumbsUp size={18} /> <span>{topic.likes}</span>
            </motion.button>

            <motion.button 
              className={`${styles.actionButton} ${styles.shareButton}`}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share size={18} /> <span>Share</span>
            </motion.button>

            {isAuthenticated && !isAuthor && (
              <motion.button 
                className={`${styles.actionButton} ${styles.reportButton}`}
                onClick={handleReport}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Flag size={18} /> <span>Report</span>
              </motion.button>
            )}

            {isAdminOrModerator && (
              <motion.button
                className={`${styles.actionButton} ${
                  topic.isLocked ? styles.lockedButton : ""
                }`}
                onClick={handleToggleLock}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Lock size={18} /> <span>{topic.isLocked ? "Unlock" : "Lock"}</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div 
        className={styles.topicContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p>{topic.content}</p>
      </motion.div>

      <div className={styles.repliesSection}>
        <motion.div 
          className={styles.repliesHeader}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2>
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </h2>

          {isAuthenticated && !topic.isLocked ? (
            <motion.button
              className={styles.replyButton}
              onClick={() => setShowReplyForm(!showReplyForm)}
              whileHover={{ y: -5, boxShadow: "0 8px 25px rgba(0, 70, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Reply size={18} />
              <span>{showReplyForm ? "Cancel" : "Reply"}</span>
            </motion.button>
          ) : topic.isLocked ? (
            <div className={styles.lockedMessage}>
              <Lock size={18} /> This topic is locked
            </div>
          ) : (
            <motion.button
              className={styles.replyButton}
              onClick={() => router.push("/login")}
              whileHover={{ y: -5, boxShadow: "0 8px 25px rgba(0, 70, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Reply size={18} /> <span>Login to Reply</span>
            </motion.button>
          )}
        </motion.div>

        <AnimatePresence>
          {showReplyForm && (
            <motion.div 
              className={styles.replyFormContainer}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ReplyForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {replies.length > 0 ? (
          <div className={styles.repliesList}>
            {replies.map((reply, index) => (
              <motion.div 
                key={reply.id} 
                className={styles.replyCard}
                style={{ "--reply-index": index }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
              >
                <div className={styles.replyHeader}>
                  <div className={styles.replyAuthor}>
                    <UserAvatar name={reply.author} size={40} image={reply.authorAvatar} />
                    <div className={styles.replyAuthorDetails}>
                      <span className={styles.replyAuthorName}>{reply.author}</span>
                      <span className={styles.replyDate}>
                        <Clock size={14} className={styles.clockIcon} />
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.replyActions}>
                    {(isAdminOrModerator ||
                      (user && reply.authorId === user.userId)) && (
                      <>
                        <motion.button 
                          className={styles.replyActionButton}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button 
                          className={styles.replyActionButton}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash size={16} />
                        </motion.button>
                      </>
                    )}

                    {isAuthenticated && !isAuthor && (
                      <motion.button
                        className={styles.replyActionButton}
                        onClick={() => handleReplyReport(reply.id)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Flag size={16} />
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className={styles.replyContent}>
                  <p>{reply.content}</p>
                </div>

                <div className={styles.replyFooter}>
                  <motion.button
                    className={`${styles.likeButton} ${likedStatus[reply.id] ? styles.liked : ''}`}
                    onClick={() => handleReplyLike(reply.id)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ThumbsUp size={16} /> <span>{reply.likes}</span>
                  </motion.button>

                  {isAuthenticated && !topic.isLocked && (
                    <motion.button
                      className={styles.replyToButton}
                      onClick={() => {
                        setShowReplyForm(true);
                        // You could add logic here to focus on the reply form
                        // and maybe add a mention of the user being replied to
                      }}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Reply size={16} /> <span>Reply</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className={styles.noReplies}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <p>No replies yet. Be the first to reply!</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}