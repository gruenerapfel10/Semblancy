// File: src/context/ForumsProvider.js

"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAmplify } from "./AmplifyProvider";
import ForumService from "../services/ForumService";

const ForumsContext = createContext(null);

export function ForumsProvider({ children }) {
  const { user, isAuthenticated } = useAmplify();
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load topics when category changes
  useEffect(() => {
    fetchTopics();
  }, [currentCategory]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await ForumService.getCategories();
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load forum categories");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch topics based on current category
  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      let topicsData;

      if (currentCategory === "all") {
        topicsData = await ForumService.getTopics();
      } else {
        topicsData = await ForumService.getTopics(currentCategory);
      }

      setTopics(topicsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching topics:", err);
      setError("Failed to load topics");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new topic
  const createTopic = async (topicData) => {
    if (!isAuthenticated || !user) {
      throw new Error("You must be logged in to create a topic");
    }

    try {
      const newTopic = await ForumService.createTopic({
        ...topicData,
        authorId: user.userId,
        author: user.username,
      });

      // Refresh topics
      fetchTopics();
      return newTopic;
    } catch (err) {
      console.error("Error creating topic:", err);
      throw err;
    }
  };

  // Create a reply to a topic
  const createReply = async (topicId, content) => {
    if (!isAuthenticated || !user) {
      throw new Error("You must be logged in to reply");
    }

    try {
      const reply = await ForumService.createReply({
        topicId,
        content,
        authorId: user.userId,
        author: user.username,
      });

      return reply;
    } catch (err) {
      console.error("Error creating reply:", err);
      throw err;
    }
  };

  // Like a topic
  const likeTopic = async (topicId) => {
    if (!isAuthenticated) {
      throw new Error("You must be logged in to like a topic");
    }

    try {
      await ForumService.toggleTopicLike(topicId);
      // Refresh topics to get updated like count
      fetchTopics();
    } catch (err) {
      console.error("Error liking topic:", err);
      throw err;
    }
  };

  // Like a reply
  const likeReply = async (replyId) => {
    if (!isAuthenticated) {
      throw new Error("You must be logged in to like a reply");
    }

    try {
      await ForumService.toggleReplyLike(replyId);
    } catch (err) {
      console.error("Error liking reply:", err);
      throw err;
    }
  };

  // Report content
  const reportContent = async (contentId, contentType, reason) => {
    if (!isAuthenticated || !user) {
      throw new Error("You must be logged in to report content");
    }

    try {
      await ForumService.reportContent(
        contentId,
        contentType,
        reason,
        user.userId
      );
    } catch (err) {
      console.error("Error reporting content:", err);
      throw err;
    }
  };

  // Context value
  const value = {
    categories,
    topics,
    currentCategory,
    isLoading,
    error,
    setCurrentCategory,
    refreshCategories: fetchCategories,
    refreshTopics: fetchTopics,
    createTopic,
    createReply,
    likeTopic,
    likeReply,
    reportContent,
  };

  return (
    <ForumsContext.Provider value={value}>{children}</ForumsContext.Provider>
  );
}

export function useForums() {
  const context = useContext(ForumsContext);
  if (!context) {
    throw new Error("useForums must be used within a ForumsProvider");
  }
  return context;
}
