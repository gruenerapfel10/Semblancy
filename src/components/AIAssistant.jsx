"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAIAssistant } from "@/app/context/AIAssistantContext";
import { Send, X, RefreshCw, Sparkles, Minimize2, Copy, Edit, Trash2, CornerUpLeft } from "lucide-react";
import styles from "./AIAssistant.module.css";
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';
import katex from 'katex';
import Logo from "@/components/Logo";

// Message component with stable LaTeX rendering
const Message = ({ message, isStreaming, onCopy, onEdit, onDelete }) => {
  const contentRef = useRef(null);
  const bufferRef = useRef(null);
  const latexRenderedRef = useRef(false);
  const [isLatexProcessing, setIsLatexProcessing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  // Process content to identify LaTeX and other formatting
  const processContent = useCallback((content) => {
    if (!content) return '';
    
    // Split into paragraphs while preserving LaTeX delimiters
    const paragraphs = content.split('\n\n').map(p => p.trim()).filter(p => p !== '');
    
    if (paragraphs.length === 0) {
      // If no paragraphs after splitting, use the entire content as a single paragraph
      paragraphs.push(content);
    }
    
    // Process each paragraph
    return paragraphs.map((paragraph, idx) => {
      // Skip processing for LaTeX blocks (we'll handle them later)
      if (paragraph.startsWith('$$') && paragraph.endsWith('$$')) {
        return `<p data-p-id="${message.id}-p${idx}">${paragraph}</p>`;
      }
      
      // Handle headers (### Header)
      if (paragraph.startsWith('###')) {
        return `<h3 data-p-id="${message.id}-h${idx}">${paragraph.substring(3).trim()}</h3>`;
      } else if (paragraph.startsWith('##')) {
        return `<h2 data-p-id="${message.id}-h${idx}">${paragraph.substring(2).trim()}</h2>`;
      } else if (paragraph.startsWith('#')) {
        return `<h1 data-p-id="${message.id}-h${idx}">${paragraph.substring(1).trim()}</h1>`;
      }
      
      // Handle list items with dash (-) to convert to bullet points
      if (paragraph.trim().match(/^- /)) {
        // This is likely a list item, we'll handle it in the inner HTML processing
        const listContent = paragraph.replace(/^- /, '');
        
        // Process bold text in list items (using global flag and capturing group)
        let processedListContent = listContent;
        
        // Improved regex for bold text that properly handles LaTeX content 
        processedListContent = processedListContent.replace(/\*\*((?:[^*]|\*(?!\*))+)\*\*/g, '<strong>$1</strong>');
        
        // Process italics after handling bold text
        processedListContent = processedListContent.replace(/\*((?:[^*])+)\*/g, '<em>$1</em>');
        
        return `<li data-p-id="${message.id}-li${idx}">${processedListContent}</li>`;
      }
      
      // Improved regex for bold text that properly handles LaTeX content
      let processed = paragraph.replace(/\*\*((?:[^*]|\*(?!\*))+)\*\*/g, '<strong>$1</strong>');
      
      // Process italics after handling bold text
      processed = processed.replace(/\*((?:[^*])+)\*/g, '<em>$1</em>');
      
      // Check for LaTeX fractions and integrals (update regex to handle Greek letters)
      const hasTallLatex = /\\(?:frac|int|sum|prod|binom|Delta)/.test(processed);
      const tallLatexAttr = hasTallLatex ? ' data-has-tall-latex="true"' : '';
      
      // Just return the processed text, we'll handle LaTeX separately
      return `<p data-p-id="${message.id}-p${idx}"${tallLatexAttr}>${processed}</p>`;
    }).join('');
  }, [message.id]);
  
  // Normalize and clean LaTeX delimiters
  const normalizeLatex = useCallback((html) => {
    if (!html) return html;
    
    let normalized = html;
    
    // Fix common LaTeX errors:
    
    // 1. Fix \inta^b -> \int_a^b (missing underscore)
    normalized = normalized.replace(/\\int([a-zA-Z0-9])(\^|\^{[^}]*})/g, '\\int_$1$2');
    
    // 2. Fix summation notation
    normalized = normalized.replace(/\\sum{([^}]*)}/g, '\\sum_{$1}');
    
    // 3. Fix HTML-encoded LaTeX delimiters
    normalized = normalized.replace(/&lt;em&gt;/g, '_');
    normalized = normalized.replace(/&lt;\/em&gt;/g, '');
    
    // 4. Fix broken inline delimiters with HTML
    normalized = normalized.replace(/<\/?em>/g, '');
    
    // 5. Fix broken subscripts/superscripts
    normalized = normalized.replace(/([a-zA-Z0-9])<em>([0-9a-zA-Z])/g, '$1_$2');
    normalized = normalized.replace(/([a-zA-Z0-9])<\/em>([0-9a-zA-Z])/g, '$1_$2');
    
    // 6. Fix integral notation for Simpson's rule and other applications
    normalized = normalized.replace(/\\int{([^}]*)}\^{([^}]*)}/g, '\\int_{$1}^{$2}');
    normalized = normalized.replace(/\\int_([a-zA-Z0-9])([a-zA-Z0-9])/g, '\\int_$1 $2');
    
    // 7. Fix delta notation
    normalized = normalized.replace(/\\Delta([a-zA-Z])/g, '\\Delta $1');
    normalized = normalized.replace(/\\Delta\\x/g, '\\Delta x');
    
    // 8. Properly balance LaTeX delimiters
    const inlineDelimiters = (normalized.match(/(?<!\$)\$/g) || []).length;
    if (inlineDelimiters % 2 !== 0) {
      // Add missing closing delimiter at the end if needed
      normalized += '$';
    }
    
    // 9. Ensure display math has proper spacing
    normalized = normalized.replace(/\$\$([\s\S]*?)\$\$/g, (match, content) => {
      // Add spacing before and after if needed
      return `$$ ${content.trim()} $$`;
    });
    
    // 10. Fix common fraction issues
    normalized = normalized.replace(/\\frac([a-zA-Z0-9])([a-zA-Z0-9])/g, '\\frac{$1}{$2}');
    
    return normalized;
  }, []);
  
  // Safely render LaTeX in the buffer without triggering React re-renders
  const renderLatexInBuffer = useCallback(() => {
    if (!bufferRef.current || !message.content) return false;
    
    try {
      // Get all content elements including headers, paragraphs and individual list items
      const contentElements = bufferRef.current.querySelectorAll('p, h1, h2, h3, li');
      let hasLatex = false;
      
      // First, check if we have any list items to wrap in <ul>
      const listItems = bufferRef.current.querySelectorAll('li');
      if (listItems.length > 0) {
        // Create a ul element to wrap all list items
        const ul = document.createElement('ul');
        
        // Extract list items and append to the ul
        listItems.forEach(li => {
          const clone = li.cloneNode(true);
          ul.appendChild(clone);
        });
        
        // Replace the first list item with the ul
        if (listItems[0].parentNode) {
          listItems[0].parentNode.replaceChild(ul, listItems[0]);
          
          // Remove the rest of the list items as they're now in the ul
          for (let i = 1; i < listItems.length; i++) {
            if (listItems[i].parentNode) {
              listItems[i].parentNode.removeChild(listItems[i]);
            }
          }
        }
      }
      
      // Now get the updated elements (after list processing)
      const updatedElements = bufferRef.current.querySelectorAll('p, h1, h2, h3, ul li');
      
      // Process each element for LaTeX
      updatedElements.forEach(element => {
        let html = element.innerHTML;
        let latexFound = false;
        
        // Normalize LaTeX first
        html = normalizeLatex(html);
        
        // First process display math ($$...$$)
        const processedDisplay = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
          latexFound = true;
          hasLatex = true;
          try {
            const rendered = katex.renderToString(latex.trim(), { 
              displayMode: true,
              throwOnError: false,
              strict: false,
              trust: true
            });
            return `<div class="${styles.latexBlock}">${rendered}</div>`;
          } catch (e) {
            console.error('LaTeX display error:', e);
            return `<div class="${styles.latexBlock} ${styles.latexError}">
              <div class="${styles.latexErrorContent}">${match}</div>
              <div class="${styles.latexErrorMessage}">LaTeX Error: ${e.message}</div>
            </div>`;
          }
        });
        
        // Then process inline math ($...$) with improved regex that handles more complex expressions
        let processedFinal = processedDisplay.replace(/(?<![a-zA-Z0-9])\$((?!\$)(\\[a-zA-Z]+(\{[^}]*\})*|[^$\\]|\\.|[\s\S])*?)\$/g, (match, latex) => {
          latexFound = true;
          hasLatex = true;
          try {
            const rendered = katex.renderToString(latex.trim(), { 
              displayMode: false,
              throwOnError: false,
              strict: false,
              trust: true
            });
            return rendered;
          } catch (e) {
            console.error('LaTeX inline error:', e);
            return `<span class="${styles.latexError}" title="${e.message}">${match}</span>`;
          }
        });
        
        // Only update if LaTeX was found
        if (latexFound || processedFinal !== html) {
          element.innerHTML = processedFinal;
        }
      });
      
      return hasLatex;
    } catch (e) {
      console.error('Error during LaTeX processing:', e);
      return false;
    }
  }, [message.content, normalizeLatex]);
  
  // Swap content from buffer to visible content
  const swapBufferToContent = useCallback(() => {
    if (contentRef.current && bufferRef.current) {
      contentRef.current.innerHTML = bufferRef.current.innerHTML;
      setIsLatexProcessing(false);
    }
  }, []);
  
  // Process new content when it changes
  useEffect(() => {
    // Don't process if we don't have refs or content
    if (!bufferRef.current || !contentRef.current || !message.content) return;
    
    // If this is the first render or not streaming, directly set content
    if (!isStreaming || contentRef.current.innerHTML === '') {
      contentRef.current.innerHTML = processContent(message.content);
      latexRenderedRef.current = false;
      
      // Process LaTeX after a small delay
      const timer = setTimeout(() => {
        if (contentRef.current) {
          // Get all content elements
          const contentElements = contentRef.current.querySelectorAll('p, h1, h2, h3, li');
          
          // First, check if we have any list items to wrap in <ul>
          const listItems = contentRef.current.querySelectorAll('li');
          if (listItems.length > 0) {
            // Create a ul element to wrap all list items
            const ul = document.createElement('ul');
            
            // Extract list items and append to the ul
            listItems.forEach(li => {
              const clone = li.cloneNode(true);
              ul.appendChild(clone);
            });
            
            // Replace the first list item with the ul
            if (listItems[0].parentNode) {
              listItems[0].parentNode.replaceChild(ul, listItems[0]);
              
              // Remove the rest of the list items as they're now in the ul
              for (let i = 1; i < listItems.length; i++) {
                if (listItems[i].parentNode) {
                  listItems[i].parentNode.removeChild(listItems[i]);
                }
              }
            }
          }
          
          // Now get the updated elements (after list processing)
          const updatedElements = contentRef.current.querySelectorAll('p, h1, h2, h3, ul li');
          
          // Process each element for LaTeX
          updatedElements.forEach(element => {
            let html = element.innerHTML;
            let latexFound = false;
            
            // Normalize LaTeX first
            html = normalizeLatex(html);
            
            // Process display math ($$...$$)
            const processedDisplay = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
              latexFound = true;
              try {
                const rendered = katex.renderToString(latex.trim(), { 
                  displayMode: true,
                  throwOnError: false,
                  strict: false,
                  trust: true
                });
                return `<div class="${styles.latexBlock}">${rendered}</div>`;
              } catch (e) {
                console.error('LaTeX display error:', e);
                return `<div class="${styles.latexBlock} ${styles.latexError}">
                  <div class="${styles.latexErrorContent}">${match}</div>
                  <div class="${styles.latexErrorMessage}">LaTeX Error: ${e.message}</div>
                </div>`;
              }
            });
            
            // Process inline math ($...$)
            let processedFinal = processedDisplay.replace(/(?<![a-zA-Z0-9])\$((?!\$)(\\[a-zA-Z]+(\{[^}]*\})*|[^$\\]|\\.|[\s\S])*?)\$/g, (match, latex) => {
              latexFound = true;
              try {
                const rendered = katex.renderToString(latex.trim(), { 
                  displayMode: false,
                  throwOnError: false,
                  strict: false,
                  trust: true
                });
                return rendered;
              } catch (e) {
                console.error('LaTeX inline error:', e);
                return `<span class="${styles.latexError}" title="${e.message}">${match}</span>`;
              }
            });
            
            // Only update if LaTeX was found
            if (latexFound || processedFinal !== html) {
              element.innerHTML = processedFinal;
            }
            
            // Apply word-by-word fade-in animation by wrapping words in spans
            if (isStreaming) {
              // Only apply to non-LaTeX content (to avoid breaking rendered LaTeX)
              const textNodes = Array.from(element.childNodes).filter(node => 
                node.nodeType === Node.TEXT_NODE
              );
              
              textNodes.forEach(textNode => {
                const words = textNode.textContent.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                
                words.forEach((word, i) => {
                  if (word.trim() === '') {
                    fragment.appendChild(document.createTextNode(word));
                  } else {
                    const span = document.createElement('span');
                    span.className = styles.wordChunk;
                    span.textContent = word;
                    span.style.animationDelay = `${i * 30}ms`;
                    fragment.appendChild(span);
                  }
                });
                
                textNode.parentNode.replaceChild(fragment, textNode);
              });
            }
          });
          
          latexRenderedRef.current = true;
        }
      }, 10);
      
      return () => clearTimeout(timer);
    }
    
    // For streaming updates, use buffer approach with word-by-word animation
    setIsLatexProcessing(true);
    
    // Prepare the buffer with the new content
    bufferRef.current.innerHTML = processContent(message.content);
    
    // Process LaTeX in the buffer
    const timer = setTimeout(() => {
      const hasLatex = renderLatexInBuffer();
      
      // Swap buffer to content
      swapBufferToContent();
      
      // Apply fade-in animation to latest content words
      if (contentRef.current && isStreaming) {
        // Find all text nodes that aren't inside LaTeX elements
        const elements = contentRef.current.querySelectorAll('p, h1, h2, h3, li');
        elements.forEach(element => {
          // Skip LaTeX containers
          if (element.querySelector('.katex') || element.closest('.latexBlock')) {
            return;
          }
          
          // Apply animation to text nodes only
          const textNodes = Array.from(element.childNodes).filter(node => 
            node.nodeType === Node.TEXT_NODE
          );
          
          textNodes.forEach(textNode => {
            const words = textNode.textContent.split(/(\s+)/);
            const fragment = document.createDocumentFragment();
            
            words.forEach((word, i) => {
              if (word.trim() === '') {
                fragment.appendChild(document.createTextNode(word));
              } else {
                const span = document.createElement('span');
                span.className = styles.wordChunk;
                span.textContent = word;
                span.style.animationDelay = `${i * 30}ms`;
                fragment.appendChild(span);
              }
            });
            
            textNode.parentNode.replaceChild(fragment, textNode);
          });
        });
      }
      
      // If no LaTeX was found, we can mark as rendered immediately
      if (!hasLatex) {
        latexRenderedRef.current = true;
      }
    }, 10);
    
    return () => clearTimeout(timer);
  }, [message.content, processContent, renderLatexInBuffer, swapBufferToContent, isStreaming, normalizeLatex]);
  
  // Handle message actions
  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      onCopy && onCopy(message.id);
    }
  };
  
  // Get classes for message
  const messageClasses = useMemo(() => {
    let classes = `${styles.message} message-${message.id} `;
    classes += message.role === "user" ? styles.userMessage : styles.assistantMessage;
    if (isStreaming) classes += ` ${styles.streaming}`;
    if (isLatexProcessing) classes += ` ${styles.processing}`;
    return classes;
  }, [message.id, message.role, isStreaming, isLatexProcessing]);

  return (
    <motion.div
      className={messageClasses}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.2, 
        delay: 0.05,
      }}
      layout="position"
      onMouseEnter={() => message.role === "assistant" && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={styles.messageContent}>
        {message.role === "assistant" ? (
          <div className={styles.messageIcon}>
            <Logo showIcon={true} showTitle={false} showTagline={false} />
          </div>
        ) : (
          <div className={styles.messageIcon}></div>
        )}
        <div className={styles.messageText}>
          {/* Visible content */}
          <div 
            ref={contentRef}
            className={styles.messageTextContent}
          />
          
          {/* Hidden buffer for processing */}
          <div 
            ref={bufferRef}
            className={styles.hiddenBuffer}
          />
          
          {/* Message actions (only for assistant messages) */}
          {message.role === "assistant" && showActions && (
            <div className={styles.messageActions}>
              <button 
                className={styles.actionButton}
                onClick={handleCopy}
                aria-label="Copy message"
              >
                <Copy size={14} />
              </button>
              {onEdit && (
                <button 
                  className={styles.actionButton}
                  onClick={() => onEdit(message.id, message.content)}
                  aria-label="Edit message"
                >
                  <Edit size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function AIAssistant() {
  const {
    messages,
    inputValue,
    isLoading,
    streamingMessageId,
    chatContainerRef,
    sendMessage,
    setInputValue,
    clearChat,
    isOpen: isExpanded,
    toggleAssistant: toggleExpand
  } = useAIAssistant();

  const inputRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastExpandedPosition, setLastExpandedPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 600, height: 700 });
  const dragRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [minimizedPosition, setMinimizedPosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true after mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate and set minimized position after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMinimizedPosition({
        x: window.innerWidth - 80,
        y: 0
      });
    }
  }, []);
  
  // Focus input when assistant is expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          try {
            inputRef.current.focus();
          } catch (e) {
            console.log('Could not focus input:', e);
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);
  
  // Restore focus to input after sending a message
  useEffect(() => {
    if (isExpanded && inputRef.current && !isLoading) {
      try {
        inputRef.current.focus();
      } catch (e) {
        console.log('Could not focus input after message:', e);
      }
    }
  }, [isLoading, isExpanded]);

  // Add keyboard shortcut handler directly in the component
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl/Command + J
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault(); // Prevent default browser behavior
        console.log("Shortcut pressed in AIAssistant component, current state:", isExpanded);
        
        // This is the crucial line - we're going back to the raw context source
        if (typeof toggleExpand === 'function') {
          toggleExpand();
          console.log("toggleExpand called from component, should toggle visibility");
          
          // If currently not expanded (will be expanded after toggle), wait before focusing
          if (!isExpanded && inputRef.current) {
            setTimeout(() => {
              if (inputRef.current) {
                try {
                  inputRef.current.focus();
                } catch (e) {
                  console.log('Could not focus input after keyboard shortcut:', e);
                }
              }
            }, 300);
          }
        }
      }
    };
    
    // Remove existing global listeners first to avoid duplicates
    window.removeEventListener('keydown', handleKeyDown);
    
    // Only add event listener on client-side
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      
      // Clean up event listener on unmount
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [toggleExpand, isExpanded, inputRef]);
  
  // Ensure KaTeX is loaded
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Import KaTeX dynamically to ensure it's only loaded on the client
      import('katex').then(katexModule => {
        window.katex = katexModule.default;
        console.log("KaTeX loaded successfully");
      }).catch(err => {
        console.error("Error loading KaTeX:", err);
      });
    }
  }, []);

  // For CSS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      link.integrity = 'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, []);

  // Ensure proper scrolling for messages
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      // Only scroll to bottom when a new message is added or completed, not during streaming
      if (!streamingMessageId) {
        const timer = setTimeout(() => {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, streamingMessageId]);

  // Track the position for expanded state
  useEffect(() => {
    if (isExpanded) {
      setLastExpandedPosition(position);
    }
  }, [position, isExpanded]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
    }
  };

  // Handle key press in the input
  const handleKeyPress = (e) => {
    // Check for shift+enter to add a new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle drag stop
  const handleDragStop = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };
  
  // Handle real-time resize with optimized performance
  const handleResize = (e, direction, ref, delta) => {
    // Use requestAnimationFrame to optimize performance during resize
    requestAnimationFrame(() => {
      // Update size based on ref dimensions
      setSize({
        width: ref.offsetWidth,
        height: ref.offsetHeight
      });
      
      // For bottom-right resizing, ensure the position remains fixed at top-left
      // The re-resizable component handles this automatically
      
      // Don't force scroll to bottom during resize - allow user to maintain their scroll position
    });
  };
  
  // Handle message copy
  const handleMessageCopy = (messageId) => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  // Handle message edit
  const handleMessageEdit = (messageId, content) => {
    setEditingMessageId(messageId);
    setEditText(content);
  };
  
  // Handle editing cancellation
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  return (
    <>
      {isClient ? (
        <Draggable
          handle=".handle"
          bounds="body"
          position={isExpanded ? position : minimizedPosition}
          onStop={handleDragStop}
          disabled={!isExpanded}
          nodeRef={dragRef}
        >
          <div 
            ref={dragRef}
            className={`${styles.aiToast} ${isExpanded ? styles.expanded : ''}`}
            style={{ 
              display: isExpanded ? 'block' : 'none',
              pointerEvents: isExpanded ? 'auto' : 'none'
            }}
          >
            <motion.div
              className={styles.aiContainer}
              initial={false}
              animate={{
                borderRadius: isExpanded ? "20px" : "30px",
                boxShadow: isExpanded 
                  ? "0 10px 25px rgba(0, 0, 0, 0.2)"
                  : "0 4px 12px rgba(0, 0, 0, 0.15)"
              }}
              style={{ 
                width: isExpanded ? size.width : 60, 
                height: isExpanded ? size.height : 60
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 28,
                // Don't animate width and height via framer-motion to avoid lag
                // They're set directly via style prop instead
                width: { duration: 0 },
                height: { duration: 0 }
              }}
            >
              {!isExpanded ? (
                // Collapsed state - just show the button
                <motion.button
                  className={styles.aiTriggerButton}
                  onClick={toggleExpand}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles size={24} />
                </motion.button>
              ) : (
                // Expanded state - show the full chat interface
                <Resizable
                  className={styles.resizableContainer}
                  size={{ width: size.width, height: size.height }}
                  onResize={handleResize}  // Call during resize, not just on stop
                  minWidth={400}
                  minHeight={400}
                  maxWidth={1200}
                  maxHeight={900}
                  enable={{
                    top: false,
                    right: true,
                    bottom: true,
                    left: false,
                    topRight: false,
                    bottomRight: true,
                    bottomLeft: false,
                    topLeft: false
                  }}
                  handleComponent={{
                    bottomRight: <div className={styles.resizeHandleCorner}></div>,
                    right: <div className={styles.resizeHandleRight}></div>,
                    bottom: <div className={styles.resizeHandleBottom}></div>
                  }}
                  handleStyles={{
                    bottomRight: { zIndex: 2, cursor: 'nwse-resize' },
                    right: { zIndex: 2, cursor: 'ew-resize' },
                    bottom: { zIndex: 2, cursor: 'ns-resize' }
                  }}
                >
                  {/* Custom resize handles are now provided via handleComponent prop */}
                  <div className={styles.aiChatInterface}>
                    {/* Background gradient blobs */}
                    <div className={styles.gradientBlob1}></div>
                    <div className={styles.gradientBlob2}></div>
                  
                    {/* Header */}
                    <div className={`${styles.aiHeader} handle`}>
                      <div className={styles.aiTitle}>
                        <Logo showIcon={true} showTitle={false} showTagline={false} className={styles.aiIcon} />
                        <h2>Lancy - your personal AI assistant</h2>
                      </div>
                      <div className={styles.aiControls}>
                        <button 
                          className={styles.minimizeButton} 
                          onClick={toggleExpand}
                          aria-label="Minimize assistant"
                        >
                          <Minimize2 size={16} />
                        </button>
                        <button 
                          className={styles.closeButton} 
                          onClick={() => {
                            toggleExpand();
                            setTimeout(() => clearChat(), 300);
                          }}
                          aria-label="Close assistant"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className={styles.chatContainer} ref={chatContainerRef}>
                      <AnimatePresence>
                        {messages.length === 0 ? (
                          <motion.div 
                            className={styles.emptyState}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Sparkles size={32} className={styles.emptyIcon} />
                            <h3>Ask me anything</h3>
                            <p>Math, Science, History - I'm here to help!</p>
                          </motion.div>
                        ) : (
                          <div className={styles.messagesWrapper}>
                            {messages.map((message) => (
                              <Message 
                                key={message.id} 
                                message={message} 
                                isStreaming={streamingMessageId === message.id}
                                onCopy={handleMessageCopy}
                                onEdit={message.role === "assistant" ? handleMessageEdit : null}
                              />
                            ))}
                            {/* Add a spacer at the bottom to ensure content doesn't jump */}
                            <div className={styles.messagesSpacer}></div>
                          </div>
                        )}
                      </AnimatePresence>
                      {isLoading && !streamingMessageId && (
                        <motion.div 
                          className={`${styles.message} ${styles.assistantMessage}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className={styles.messageContent}>
                            <div className={styles.messageIcon}>
                              <Logo showIcon={true} showTitle={false} showTagline={false} size={"small"}/>
                            </div>
                            <div className={styles.loadingIndicator}>
                              <RefreshCw size={16} className={styles.loadingIcon} />
                              <span>Thinking...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Copy notification */}
                      <AnimatePresence>
                        {isCopied && (
                          <motion.div 
                            className={styles.copyNotification}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            Copied to clipboard!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Edit Message Interface */}
                    {editingMessageId && (
                      <div className={styles.editMessageContainer}>
                        <textarea 
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className={styles.editMessageTextarea}
                          placeholder="Edit message..."
                        />
                        <div className={styles.editActions}>
                          <button
                            className={styles.cancelEditButton}
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                          <button
                            className={styles.saveEditButton}
                            onClick={() => {
                              // Update message logic would go here
                              setEditingMessageId(null);
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className={styles.inputArea}>
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask a question... (Shift+Enter for new line)"
                        className={styles.aiInput}
                        disabled={isLoading}
                        rows={1}
                      />
                      <motion.button
                        type="submit"
                        className={styles.sendButton}
                        disabled={!inputValue.trim() || isLoading}
                        aria-label="Send message"
                        whileTap={{ scale: 0.92 }}
                      >
                        <Send size={16} />
                      </motion.button>
                    </form>
                  </div>
                </Resizable>
              )}
            </motion.div>
          </div>
        </Draggable>
      ) : null}
    </>
  );
}