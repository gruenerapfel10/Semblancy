"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { sendMessage, generateTestResponse, setApiKey, hasApiKey, clearApiKey } from "@/services/ai-service";

// Create context
const AIAssistantContext = createContext(undefined);

// System message with LaTeX formatting instructions
const SYSTEM_MESSAGE = `You are an AI assistant for GCSE students. When including mathematical content, use LaTeX notation to ensure proper display.

GUIDANCE FOR MATHEMATICAL CONTENT:
- For inline formulas (simple expressions within text), use single dollar signs: $x^2$
- For standalone equations or complex formulas, use double dollar signs: $$E = mc^2$$
- For fractions, use proper LaTeX notation: $\\frac{a}{b}$ not $a/b$
- For integrals, use proper syntax: $\\int_{a}^{b} f(x) \\, dx$ with spacing via \\,
- For summations, use proper syntax: $\\sum_{i=1}^{n} x_i$
- Superscripts: use ^ (e.g., $x^2$) 
- Subscripts: use _ (e.g., $x_1$)
- Greek letters: use the backslash (e.g., $\\alpha$, $\\beta$, $\\Delta x$)

GENERAL FORMATTING:
- Use standard markdown for text formatting like **bold**, *italic*, and lists
- Break complex explanations into clear steps
- Use examples when explaining mathematical concepts

Aim to present information in a clear, well-structured way that's accessible to high school students.
You can use examples, step-by-step explanations, and visual descriptions to help explain concepts.

Your goal is to provide accurate, helpful information tailored to the student's question.`;

export function AIAssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const chatContainerRef = useRef(null);

  // Check if API key is set on load
  useEffect(() => {
    setApiKeySet(hasApiKey());
  }, []);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle AI Assistant with Cmd+J or Ctrl+J
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        toggleAssistant();
        return;
      }

      if (!isOpen) return;

      // Close on escape
      if (e.key === "Escape") {
        e.preventDefault();
        closeAssistant();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const openAssistant = () => {
    setIsOpen(true);
    
    // If API key is not set, show the dialog
    if (!apiKeySet) {
      setShowApiKeyDialog(true);
    }
  };

  const closeAssistant = () => {
    setIsOpen(false);
  };

  const toggleAssistant = () => {
    console.log("toggleAssistant called in context, current state:", isOpen);
    
    // Use the function form of setState to guarantee we're working with the latest state
    setIsOpen(prevState => {
      const newState = !prevState;
      console.log(`Setting isOpen to ${newState}`);
      return newState;
    });
    
    // Additional logging
    console.log("toggleAssistant function completed");
  };
  
  const saveApiKey = () => {
    const success = setApiKey(apiKeyInput);
    if (success) {
      setApiKeySet(true);
      setShowApiKeyDialog(false);
      setApiKeyInput("");
    } else {
      alert("Invalid API key format. Please enter a valid OpenAI API key.");
    }
  };
  
  const removeApiKey = () => {
    clearApiKey();
    setApiKeySet(false);
  };

  const sendMessageToAI = async (message) => {
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = { id: Date.now(), role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      if (!apiKeySet) {
        // Use test response if no API key
        const testResponse = await generateTestResponse(message);
        const assistantMessage = { 
          id: Date.now() + 1, 
          role: 'assistant', 
          content: testResponse.content 
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Prepare messages history for the API call
        const messageHistory = [
          { role: "system", content: SYSTEM_MESSAGE },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: message }
        ];
        
        // Create a placeholder for the streaming response
        const streamingId = Date.now() + 1;
        const placeholderMessage = { 
          id: streamingId, 
          role: 'assistant', 
          content: '' 
        };
        setMessages(prev => [...prev, placeholderMessage]);
        setStreamingMessageId(streamingId);
        
        // Handle streaming updates
        const onChunk = (chunk) => {
          setMessages(prev => {
            const updatedMessages = [...prev];
            const messageIndex = updatedMessages.findIndex(m => m.id === streamingId);
            
            if (messageIndex !== -1) {
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                content: updatedMessages[messageIndex].content + chunk
              };
            }
            
            return updatedMessages;
          });
        };
        
        // Call API with streaming
        await sendMessage(messageHistory, { onChunk, stream: true });
        setStreamingMessageId(null);
      }
    } catch (error) {
      console.error("Error sending message to AI:", error);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1,
          role: 'assistant', 
          content: "Sorry, I encountered an error. " + (error.message || "Please try again.") 
        }
      ]);
      setStreamingMessageId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const value = {
    isOpen,
    messages,
    inputValue,
    isLoading,
    apiKeySet,
    apiKeyInput,
    showApiKeyDialog,
    streamingMessageId,
    chatContainerRef,
    openAssistant,
    closeAssistant,
    toggleAssistant,
    sendMessage: sendMessageToAI,
    setInputValue,
    clearChat,
    setApiKeyInput,
    saveApiKey,
    removeApiKey,
    setShowApiKeyDialog
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider");
  }
  return context;
} 