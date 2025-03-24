// src/components/forums/ModernNewTopicModal.jsx
import { useState } from "react";
import styles from "./NewTopicModal.module.css";
import { motion, AnimatePresence } from "framer-motion";

// Replace FontAwesome with Lucide icons
import {
  X,
  Send,
  Image,
  Link,
  Code,
  Quote,
  Bold,
  Italic,
  Type,
  Info,
  AlertTriangle,
  CornerDownRight,
  ChevronDown,
  List,
  ListOrdered,
  Hash
} from "lucide-react";

export default function ModernNewTopicModal({ onClose, onSubmit, category }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("write");
  const [showFormatting, setShowFormatting] = useState(false);
  const [showTopicTips, setShowTopicTips] = useState(false);

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

  const insertFormatting = (type) => {
    let insertion = "";
    let selectionStart = document.getElementById("topic-content").selectionStart;
    let selectionEnd = document.getElementById("topic-content").selectionEnd;
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
        insertion = `![${selectedText || "image alt text"}](https://example.com/image.jpg)`;
        break;
      case "quote":
        insertion = `> ${selectedText || "quoted text"}`;
        break;
      case "code":
        insertion = `\`${selectedText || "code"}\``;
        break;
      case "codeblock":
        insertion = `\`\`\`\n${selectedText || "code block"}\n\`\`\``;
        break;
      case "heading":
        insertion = `## ${selectedText || "Heading"}`;
        break;
      case "list":
        insertion = `\n- ${selectedText || "List item 1"}\n- List item 2\n- List item 3`;
        break;
      case "orderedlist":
        insertion = `\n1. ${selectedText || "List item 1"}\n2. List item 2\n3. List item 3`;
        break;
      default:
        insertion = selectedText;
    }
    
    const newContent = content.substring(0, selectionStart) + insertion + content.substring(selectionEnd);
    setContent(newContent);
    
    // Focus back to textarea after insertion
    setTimeout(() => {
      const textarea = document.getElementById("topic-content");
      textarea.focus();
      textarea.setSelectionRange(
        selectionStart + insertion.length,
        selectionStart + insertion.length
      );
    }, 0);
  };

  // Modal animations
  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modal = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300 
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.modalOverlay}
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={e => {
          // Close if clicking the overlay (not the modal content)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div 
          className={styles.modalContent}
          variants={modal}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <div className={styles.headerContent}>
              <motion.div 
                className={styles.modalIcon}
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Hash size={24} />
              </motion.div>
              <h2>Create New Topic</h2>
            </div>
            <button
              className={styles.closeButton}
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <motion.div 
              className={styles.errorMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <div className={styles.formHeader}>
                <label htmlFor="topic-title">Title</label>
                <motion.button
                  type="button"
                  className={styles.tipButton}
                  onClick={() => setShowTopicTips(!showTopicTips)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Info size={14} />
                  <span>Topic Tips</span>
                </motion.button>
              </div>

              <AnimatePresence>
                {showTopicTips && (
                  <motion.div 
                    className={styles.topicTips}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>
                      <strong>Tips for a good topic:</strong>
                    </p>
                    <ul>
                      <li>Use a clear, descriptive title</li>
                      <li>Include necessary details in your post</li>
                      <li>Be specific with your questions</li>
                      <li>Select the appropriate category</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={styles.inputWrapper}>
                <input
                  id="topic-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title"
                  disabled={isSubmitting}
                  className={styles.topicTitle}
                  maxLength={100}
                />
                {title.length > 0 && (
                  <span className={styles.charCounter}>
                    {title.length}/100
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.editorHeader}>
                <div className={styles.editorTabs}>
                  <button 
                    type="button"
                    className={`${styles.editorTab} ${activeTab === "write" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("write")}
                  >
                    <Type size={16} />
                    <span>Write</span>
                  </button>
                  <button 
                    type="button"
                    className={`${styles.editorTab} ${activeTab === "preview" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("preview")}
                  >
                    <CornerDownRight size={16} />
                    <span>Preview</span>
                  </button>
                </div>
                
                <button 
                  type="button" 
                  className={`${styles.formattingToggle} ${showFormatting ? styles.active : ""}`}
                  onClick={() => setShowFormatting(!showFormatting)}
                >
                  <ChevronDown size={16} className={`${styles.toggleIcon} ${showFormatting ? styles.open : ""}`} />
                  <span>Formatting Tools</span>
                </button>
              </div>

              <AnimatePresence>
                {showFormatting && (
                  <motion.div 
                    className={styles.formattingToolbar}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.formattingGroup}>
                      <button type="button" onClick={() => insertFormatting("bold")} title="Bold" className={styles.formattingButton}>
                        <Bold size={16} />
                      </button>
                      <button type="button" onClick={() => insertFormatting("italic")} title="Italic" className={styles.formattingButton}>
                        <Italic size={16} />
                      </button>
                      <button type="button" onClick={() => insertFormatting("heading")} title="Heading" className={styles.formattingButton}>
                        <Type size={16} />
                      </button>
                    </div>

                    <div className={styles.formattingGroup}>
                      <button type="button" onClick={() => insertFormatting("link")} title="Link" className={styles.formattingButton}>
                        <Link size={16} />
                      </button>
                      <button type="button" onClick={() => insertFormatting("image")} title="Image" className={styles.formattingButton}>
                        <Image size={16} />
                      </button>
                    </div>

                    <div className={styles.formattingGroup}>
                      <button type="button" onClick={() => insertFormatting("list")} title="Bullet List" className={styles.formattingButton}>
                        <List size={16} />
                      </button>
                      <button type="button" onClick={() => insertFormatting("orderedlist")} title="Numbered List" className={styles.formattingButton}>
                        <ListOrdered size={16} />
                      </button>
                    </div>

                    <div className={styles.formattingGroup}>
                      <button type="button" onClick={() => insertFormatting("quote")} title="Quote" className={styles.formattingButton}>
                        <Quote size={16} />
                      </button>
                      <button type="button" onClick={() => insertFormatting("code")} title="Inline Code" className={styles.formattingButton}>
                        <Code size={16} />
                      </button>
                      <button type="button" onClick={() => insertFormatting("codeblock")} title="Code Block" className={styles.formattingButton}>
                        <Code size={16} className={styles.codeBlockIcon} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTab === "write" ? (
                <div className={styles.textareaWrapper}>
                  <textarea
                    id="topic-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What would you like to discuss? Share your thoughts, questions, or ideas here..."
                    disabled={isSubmitting}
                    className={styles.topicContent}
                    rows={12}
                  />
                  {content.length > 0 && (
                    <span className={styles.contentCounter}>
                      {content.length} characters
                    </span>
                  )}
                </div>
              ) : (
                <div className={styles.previewContent}>
                  {content ? (
                    <div className={styles.markdownPreview}>
                      {/* In a real app, you'd render Markdown here */}
                      {content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.previewEmpty}>
                      <Image size={20} className={styles.emptyIcon} />
                      <p>Nothing to preview yet. Start writing to see a preview.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.formActions}>
              <div className={styles.categorySection}>
                <span className={styles.categoryLabel}>Category:</span>
                <span className={styles.categoryTag}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </div>
              
              <div className={styles.actionButtons}>
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className={styles.cancelButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className={`${styles.submitButton} ${(!title.trim() || !content.trim()) ? styles.disabled : ''}`}
                  whileHover={title.trim() && content.trim() ? { scale: 1.05 } : {}}
                  whileTap={title.trim() && content.trim() ? { scale: 0.95 } : {}}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? "Creating..." : "Create Topic"}</span>
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}