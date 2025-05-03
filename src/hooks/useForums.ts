// src/hooks/useForums.ts
import { useState, useEffect, useCallback } from "react";
import ForumService from "../services/ForumService";
import { Topic } from "../types/forum";
import { useAmplify } from "../app/context/Providers";

export function useTopics(forumId?: string, category?: string) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAmplify();

  const loadTopics = useCallback(async () => {
    try {
      setLoading(true);
      const topicsData = await ForumService.getTopics(forumId, category);
      setTopics(topicsData);
      setError(null);
    } catch (err) {
      console.error("Error loading topics:", err);
      setError("Failed to load topics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [forumId, category]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const createTopic = async (topicData: {
    title: string;
    content: string;
    category: string;
    forumId?: string;
  }) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error("You must be logged in to create a topic");
      }

      const newTopic = await ForumService.createTopic({
        title: topicData.title,
        content: topicData.content,
        category: topicData.category,
        forumId: topicData.forumId || "general",
        author: user.username,
        authorId: user.userId,
        isSticky: false,
        isLocked: false,
        views: 0, // Add this
        likes: 0, // Add this
        replyCount: 0, // Add this
      });

      setTopics((prev) => [newTopic, ...prev]);
      return newTopic;
    } catch (err) {
      console.error("Error creating topic:", err);
      throw err;
    }
  };

  return {
    topics,
    loading,
    error,
    refreshTopics: loadTopics,
    createTopic,
  };
}

export function useTopic(id: string) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAmplify();

  const loadTopic = useCallback(async () => {
    try {
      setLoading(true);

      // Get topic details
      const topicData = await ForumService.getTopic(id);
      if (!topicData) {
        setError("Topic not found");
        return;
      }

      setTopic(topicData);

      // Increment view count
      await ForumService.incrementTopicViews(id);

      // Get replies
      const repliesData = await ForumService.getReplies(id);
      setReplies(repliesData);

      setError(null);
    } catch (err) {
      console.error("Error loading topic:", err);
      setError("Failed to load topic. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTopic();
  }, [loadTopic]);

  const createReply = async (content: string, parentReplyId?: string) => {
    try {
      if (!isAuthenticated || !user || !topic) {
        throw new Error("You must be logged in to reply");
      }

      if (topic.isLocked) {
        throw new Error("This topic is locked and cannot receive new replies");
      }

      const newReply = await ForumService.createReply({
        content,
        topicId: id,
        author: user.username,
        authorId: user.userId,
        parentReplyId,
        likes: 0, // Add this missing required field
      });

      // Add to local state
      setReplies((prev) => [...prev, newReply]);

      return newReply;
    } catch (err) {
      console.error("Error creating reply:", err);
      throw err;
    }
  };

  const toggleLike = async () => {
    try {
      if (!isAuthenticated || !topic) return;

      const updatedTopic = await ForumService.toggleTopicLike(id);
      setTopic(updatedTopic);

      return updatedTopic;
    } catch (err) {
      console.error("Error liking topic:", err);
      throw err;
    }
  };

  return {
    topic,
    replies,
    loading,
    error,
    refreshTopic: loadTopic,
    createReply,
    toggleLike,
  };
}

export function useAdminForum() {
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAmplify();

  const loadFlaggedContent = useCallback(async () => {
    try {
      setLoading(true);
      const flags = await ForumService.getFlaggedContent();
      setFlaggedContent(flags);
      setError(null);
    } catch (err) {
      console.error("Error loading flagged content:", err);
      setError("Failed to load flagged content. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlaggedContent();
  }, [loadFlaggedContent]);

  const reviewFlag = async (
    flagId: string,
    status: "approved" | "rejected",
    contentAction?: "remove" | "keep"
  ) => {
    try {
      if (!user) throw new Error("Not authenticated");

      // Update flag status
      const updatedFlag = await ForumService.reviewFlag(
        flagId,
        status,
        user.userId
      );

      // If content should be removed, handle that
      if (contentAction === "remove" && updatedFlag) {
        const { contentId, contentType } = updatedFlag;

        if (contentType === "topic") {
          await ForumService.updateTopic(contentId, {
            isRemoved: true,
          });
        } else if (contentType === "reply") {
          await ForumService.updateReply(contentId, {
            isRemoved: true,
          });
        }
      }

      // Remove from local state
      setFlaggedContent((prev) => prev.filter((flag) => flag.id !== flagId));

      return updatedFlag;
    } catch (err) {
      console.error("Error reviewing flag:", err);
      throw err;
    }
  };

  const updateTopicAdmin = async (topicId: string, updates: Partial<Topic>) => {
    try {
      const updatedTopic = await ForumService.updateTopic(topicId, updates);
      return updatedTopic;
    } catch (err) {
      console.error("Error updating topic:", err);
      throw err;
    }
  };

  return {
    flaggedContent,
    loading,
    error,
    refreshFlaggedContent: loadFlaggedContent,
    reviewFlag,
    updateTopicAdmin,
  };
}
