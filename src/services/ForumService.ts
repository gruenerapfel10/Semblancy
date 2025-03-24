// src/services/ForumService.ts
import { generateClient } from "aws-amplify/api";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Forum, Topic, Reply, Flag, UserForumStats } from "../types/forum";
import { useAmplify } from "@/app/context/Providers";
import { QueryCommandOutput, ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from "aws-amplify/auth";

const getDocClient = async () => {
  const session = await fetchAuthSession();
  if (!session || !session.credentials) {
    throw new Error("No valid authentication session");
  }

  const dynamoClient = new DynamoDBClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION || "eu-west-2",
    credentials: session.credentials,
  });

  return DynamoDBDocumentClient.from(dynamoClient);
};

// Table names
const FORUMS_TABLE = "Forums";
const TOPICS_TABLE = "Topics";
const REPLIES_TABLE = "Replies";
const FLAGS_TABLE = "Flags";
const USER_STATS_TABLE = "UserForumStats";

export default class ForumService {
  // Forum operations
  static async getForums(): Promise<Forum[]> {
    try {
      const command = new QueryCommand({
        TableName: FORUMS_TABLE,
        // No specific condition needed for listing all forums
      });

      const docClient = await getDocClient();
      const response = await docClient.send(command);

      return response.Items as Forum[];
    } catch (error) {
      console.error("Error fetching forums:", error);
      throw error;
    }
  }

  static async getForum(id: string): Promise<Forum | null> {
    try {
      const command = new GetCommand({
        TableName: FORUMS_TABLE,
        Key: { id },
      });

      const docClient = await getDocClient();
      const response = await docClient.send(command);

      return (response.Item as Forum) || null;
    } catch (error) {
      console.error("Error fetching forum:", error);
      throw error;
    }
  }

  static async getTopics(
    forumId?: string,
    category?: string
  ): Promise<Topic[]> {
    try {
      const docClient = await getDocClient();

      let command;
      const expressionAttributeValues: Record<string, any> = {
        ":false": false,
      };
      let filterExpression =
        "(attribute_not_exists(isRemoved) OR isRemoved = :false)";

      if (category && category !== "all") {
        filterExpression += " AND category = :category";
        expressionAttributeValues[":category"] = category;
      }

      let response: QueryCommandOutput | ScanCommandOutput;

      if (forumId) {
        command = new QueryCommand({
          TableName: TOPICS_TABLE,
          IndexName: "ForumIdIndex",
          KeyConditionExpression: "forumId = :forumId",
          ExpressionAttributeValues: {
            ...expressionAttributeValues,
            ":forumId": forumId,
          },
          FilterExpression: filterExpression,
        });
        response = (await docClient.send(command)) as QueryCommandOutput;
      } else {
        command = new ScanCommand({
          TableName: TOPICS_TABLE,
          ExpressionAttributeValues: expressionAttributeValues,
          FilterExpression: filterExpression,
        });
        response = (await docClient.send(command)) as ScanCommandOutput;
      }

      const topics = (response.Items as Topic[]) || [];

      return topics.sort((a, b) => {
        if (a.isSticky && !b.isSticky) return -1;
        if (!a.isSticky && b.isSticky) return 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    } catch (error) {
      console.error("Error fetching topics:", error);
      throw error;
    }
  }

  static async getTopic(id: string): Promise<Topic | null> {
    try {
      const command = new GetCommand({
        TableName: TOPICS_TABLE,
        Key: { id },
      });

      const docClient = await getDocClient();
      const response = await docClient.send(command);

      return (response.Item as Topic) || null;
    } catch (error) {
      console.error("Error fetching topic:", error);
      throw error;
    }
  }

  static async createTopic(
    topic: Omit<Topic, "id" | "createdAt" | "updatedAt">
  ): Promise<Topic> {
    try {
      const timestamp = new Date().toISOString();
      const newTopic: Topic = {
        ...topic,
        id: `topic_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 10)}`,
        views: 0,
        likes: 0,
        replyCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const command = new PutCommand({
        TableName: TOPICS_TABLE,
        Item: newTopic,
      });

      const docClient = await getDocClient();
      await docClient.send(command);

      // Update user stats
      await this.updateUserStats(newTopic.authorId, newTopic.author, "topic");

      return newTopic;
    } catch (error) {
      console.error("Error creating topic:", error);
      throw error;
    }
  }

  static async updateTopic(
    id: string,
    updates: Partial<Topic>
  ): Promise<Topic> {
    try {
      // Build update expression
      let updateExpression = "SET updatedAt = :updatedAt";
      const expressionAttributeValues: Record<string, any> = {
        ":updatedAt": new Date().toISOString(),
      };

      // Add each update to the expression
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== "id" && key !== "createdAt") {
          updateExpression += `, ${key} = :${key}`;
          expressionAttributeValues[`:${key}`] = value;
        }
      });

      const command = new UpdateCommand({
        TableName: TOPICS_TABLE,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      });

      const docClient = await getDocClient();
      const response = await docClient.send(command);

      return response.Attributes as Topic;
    } catch (error) {
      console.error("Error updating topic:", error);
      throw error;
    }
  }

  static async incrementTopicViews(topicId: string): Promise<Topic> {
    try {
      const command = new UpdateCommand({
        TableName: TOPICS_TABLE,
        Key: {
          id: topicId,
        },
        UpdateExpression: "SET #viewsAttr = if_not_exists(#viewsAttr, :zero) + :inc",
        ExpressionAttributeNames: {
          "#viewsAttr": "views"  // Use expression attribute name for reserved keyword
        },
        ExpressionAttributeValues: {
          ":inc": 1,
          ":zero": 0,
        },
        ReturnValues: "ALL_NEW",
      });
  
      const docClient = await getDocClient();
      const response = await docClient.send(command);
  
      return response.Attributes as Topic;
    } catch (error) {
      console.error("Error incrementing topic views:", error);
      throw error;
    }
  }

  static async toggleTopicLike(
    id: string,
    increment: boolean = true
  ): Promise<Topic> {
    try {
      const command = new UpdateCommand({
        TableName: TOPICS_TABLE,
        Key: { id },
        UpdateExpression: "SET likes = likes + :inc, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":inc": increment ? 1 : -1,
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      });

      const docClient = await getDocClient();
      const response = await docClient.send(command);

      return response.Attributes as Topic;
    } catch (error) {
      console.error("Error toggling topic like:", error);
      throw error;
    }
  }

  // Reply operations
  static async getReplies(topicId: string): Promise<Reply[]> {
    try {
      const command = new QueryCommand({
        TableName: REPLIES_TABLE,
        IndexName: "TopicIdIndex",
        KeyConditionExpression: "topicId = :topicId",
        FilterExpression:
          "attribute_not_exists(isRemoved) OR isRemoved = :false",
        ExpressionAttributeValues: {
          ":topicId": topicId,
          ":false": false,
        },
      });

      const docClient = await getDocClient();
      const response = await docClient.send(command);

      const replies = (response.Items as Reply[]) || [];

      // Sort by createdAt
      return replies.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } catch (error) {
      console.error("Error fetching replies:", error);
      throw error;
    }
  }

  static async createReply(
    reply: Omit<Reply, "id" | "createdAt" | "updatedAt">
  ): Promise<Reply> {
    try {
      const timestamp = new Date().toISOString();
      const newReply: Reply = {
        ...reply,
        id: `reply_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 10)}`,
        likes: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const command = new PutCommand({
        TableName: REPLIES_TABLE,
        Item: newReply,
      });

      const docClient = await getDocClient();
      await docClient.send(command);

      // Increment reply count on topic
      await this.incrementTopicReplyCount(reply.topicId);

      // Update user stats
      await this.updateUserStats(newReply.authorId, newReply.author, "reply");

      return newReply;
    } catch (error) {
      console.error("Error creating reply:", error);
      throw error;
    }
  }

  static async updateReply(
    id: string,
    updates: Partial<Reply>
  ): Promise<Reply> {
    try {
      // Build update expression
      let updateExpression = "SET updatedAt = :updatedAt";
      const expressionAttributeValues: Record<string, any> = {
        ":updatedAt": new Date().toISOString(),
      };

      // Add each update to the expression
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== "id" && key !== "createdAt") {
          updateExpression += `, ${key} = :${key}`;
          expressionAttributeValues[`:${key}`] = value;
        }
      });

      const command = new UpdateCommand({
        TableName: REPLIES_TABLE,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      });

      const docClient = await getDocClient();
      const response = await docClient.send(command);

      return response.Attributes as Reply;
    } catch (error) {
      console.error("Error updating reply:", error);
      throw error;
    }
  }

  static async toggleReplyLike(
    id: string,
    increment: boolean = true
  ): Promise<Reply> {
    try {
      const command = new UpdateCommand({
        TableName: REPLIES_TABLE,
        Key: { id },
        UpdateExpression: "SET likes = likes + :inc, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":inc": increment ? 1 : -1,
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      });

      const docClient = await getDocClient();
      const response = await docClient.send(command);

      return response.Attributes as Reply;
    } catch (error) {
      console.error("Error toggling reply like:", error);
      throw error;
    }
  }

  // Flag operations
  static async createFlag(
    flag: Omit<Flag, "id" | "createdAt" | "status">
  ): Promise<Flag> {
    try {
      const timestamp = new Date().toISOString();
      const newFlag: Flag = {
        ...flag,
        id: `flag_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        status: "pending",
        createdAt: timestamp,
      };

      const command = new PutCommand({
        TableName: FLAGS_TABLE,
        Item: newFlag,
      });

      const docClient = await getDocClient();

      await docClient.send(command);
      return newFlag;
    } catch (error) {
      console.error("Error creating flag:", error);
      throw error;
    }
  }

  static async getFlaggedContent(): Promise<Flag[]> {
    try {
      const command = new QueryCommand({
        TableName: FLAGS_TABLE,
        IndexName: "StatusIndex",
        KeyConditionExpression: "status = :status",
        ExpressionAttributeValues: { ":status": "pending" },
      });

      const docClient = await getDocClient();
      const response = await docClient.send(command);

      return (response.Items as Flag[]) || [];
    } catch (error) {
      console.error("Error fetching flagged content:", error);
      throw error;
    }
  }

  static async reviewFlag(
    id: string,
    status: "approved" | "rejected",
    reviewerId: string
  ): Promise<Flag> {
    try {
      const timestamp = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: FLAGS_TABLE,
        Key: { id },
        UpdateExpression:
          "SET status = :status, reviewedBy = :reviewedBy, reviewedAt = :reviewedAt",
        ExpressionAttributeValues: {
          ":status": status,
          ":reviewedBy": reviewerId,
          ":reviewedAt": timestamp,
        },
        ReturnValues: "ALL_NEW",
      });

      const docClient = await getDocClient();
      const response = await docClient.send(command);

      return response.Attributes as Flag;
    } catch (error) {
      console.error("Error reviewing flag:", error);
      throw error;
    }
  }

  // Helper methods
  private static async incrementTopicReplyCount(
    topicId: string
  ): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: TOPICS_TABLE,
        Key: { id: topicId },
        UpdateExpression:
          "SET replyCount = replyCount + :inc, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":inc": 1,
          ":updatedAt": new Date().toISOString(),
        },
      });

      const docClient = await getDocClient();
      await docClient.send(command);
    } catch (error) {
      console.error("Error incrementing topic reply count:", error);
      // Don't throw - non-critical update
    }
  }

  // User stats methods
  static async updateUserStats(
    userId: string,
    username: string,
    action: "topic" | "reply" | "like"
  ): Promise<void> {
    try {
      // Get current stats
      const getCommand = new GetCommand({
        TableName: USER_STATS_TABLE,
        Key: { userId },
      });
      const docClient = await getDocClient();

      const response = await docClient.send(getCommand);
      const stats = response.Item as UserForumStats;

      if (!stats) {
        // Create new stats
        const newStats: UserForumStats = {
          userId,
          username,
          topicsCreated: action === "topic" ? 1 : 0,
          repliesCreated: action === "reply" ? 1 : 0,
          likesReceived: action === "like" ? 1 : 0,
          lastActive: new Date().toISOString(),
        };

        const putCommand = new PutCommand({
          TableName: USER_STATS_TABLE,
          Item: newStats,
        });

        await docClient.send(putCommand);
      } else {
        // Update existing stats
        let updateExpression = "SET lastActive = :lastActive";
        const expressionAttributeValues: Record<string, any> = {
          ":lastActive": new Date().toISOString(),
        };

        if (action === "topic") {
          updateExpression += ", topicsCreated = topicsCreated + :inc";
          expressionAttributeValues[":inc"] = 1;
        } else if (action === "reply") {
          updateExpression += ", repliesCreated = repliesCreated + :inc";
          expressionAttributeValues[":inc"] = 1;
        } else if (action === "like") {
          updateExpression += ", likesReceived = likesReceived + :inc";
          expressionAttributeValues[":inc"] = 1;
        }

        const updateCommand = new UpdateCommand({
          TableName: USER_STATS_TABLE,
          Key: { userId },
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttributeValues,
        });

        await docClient.send(updateCommand);
      }
    } catch (error) {
      console.error("Error updating user stats:", error);
      // Don't throw - this is a non-critical update
    }
  }
}
