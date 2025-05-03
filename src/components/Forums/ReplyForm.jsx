// src/components/forums/ModernReplyForm.jsx
import { useState, useRef, useEffect } from "react";
import styles from "./ReplyForm.module.css";
import { motion, AnimatePresence } from "framer-motion";

// Import Lucide icons
import {
  Send,
  X,
  Image,
  Link,
  Smile,
  Code,
  Bold,
  Italic,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function ModernReplyForm({
  onSubmit,
  onCancel,
  parentReplyId = null,
  initialFocus = false
}) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);
  
  // Sample emoji set
  const emojis = ["😀", "👍", "🎉", "❤️", "🔥", "👏", "🤔", "😊", "👋", "✅", "⭐", "🚀", "💡", "📝", "👀", "💯", "🎓", "📚", "🧠", "💭"];

  // Set initial focus if needed
  useEffect(() => {
    if (initialFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [initialFocus]);

  // Auto resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return; // Don't submit empty replies
    }

    try {
      setIsSubmitting(true);
      await onSubmit(content.trim(), parentReplyId);
      setContent("");
      setIsExpanded(false);
    } catch (err) {
      console.error("Error submitting reply:", err);
      alert(err.message || "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertEmoji = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const insertFormatting = (type) => {
    if (!textareaRef.current) return;
    
    let insertion = "";
    let selectionStart = textareaRef.current.selectionStart;
    let selectionEnd = textareaRef.current.selectionEnd;
    let selectedText = content.substring(selectionStart, selectionEnd);
    
    switch(type) {
      case "bold":
        insertion = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        insertion = `*${selectedText || "italic text"}*`;
        break;
      case "link":
        insertion = `[${selectedText || "link text"}](https://example.com)`;
        break;
      case "image":
        insertion = `![${selectedText || "image description"}](https://example.com/image.jpg)`;
        break;
      case "code":
        insertion = `\`${selectedText || "code"}\``;
        break;
      default:
        insertion = selectedText;
    }
    
    const newContent = content.substring(0, selectionStart) + insertion + content.substring(selectionEnd);
    setContent(newContent);
    
    // Focus back to textarea after insertion
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          selectionStart + insertion.length,
          selectionStart + insertion.length
        );
      }
    }, 0);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setShowFormatting(true);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  };

  return (
    <motion.div 
      className={`${styles.replyForm} ${isExpanded ? styles.expanded : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <form onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <div className={styles.expandToggle} onClick={toggleExpand}>
            {isExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronUp size={18} />
            )}
            <span>{isExpanded ? "Compact mode" : "Expand editor"}</span>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className={styles.formattingBar}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <button 
                  type="button" 
                  onClick={() => insertFormatting("bold")}
                  title="Bold"
                  className={styles.formattingButton}
                >
                  <Bold size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting("italic")}
                  title="Italic"
                  className={styles.formattingButton}
                >
                  <Italic size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting("link")}
                  title="Insert Link"
                  className={styles.formattingButton}
                >
                  <Link size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting("image")}
                  title="Insert Image"
                  className={styles.formattingButton}
                >
                  <Image size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting("code")}
                  title="Inline Code"
                  className={styles.formattingButton}
                >
                  <Code size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className={styles.textareaWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.replyInput}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isExpanded ? "Share your thoughts in detail..." : "Write a reply..."}
            disabled={isSubmitting}
            rows={isExpanded ? 4 : 2}
          />
          
          <div className={styles.textareaTools}>
            <div className={styles.emojiPickerWrapper}>
              <button 
                type="button" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Add Emoji"
                className={`${styles.emojiToggle} ${showEmojiPicker ? styles.active : ''}`}
              >
                <Smile size={16} />
              </button>
              
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    className={styles.emojiPicker}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {emojis.map(emoji => (
                      <button 
                        key={emoji} 
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className={styles.emojiButton}
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className={styles.charCount}>
              {content.length > 0 ? `${content.length} characters` : ''}
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <motion.button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={16} />
            <span>Cancel</span>
          </motion.button>

          <motion.button
            type="submit"
            className={`${styles.submitButton} ${!content.trim() ? styles.disabled : ''}`}
            disabled={isSubmitting || !content.trim()}
            whileHover={content.trim() ? { scale: 1.05 } : {}}
            whileTap={content.trim() ? { scale: 0.95 } : {}}
          >
            <Send size={16} />
            <span>{isSubmitting ? "Posting..." : "Post Reply"}</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}