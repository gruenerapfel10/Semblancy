// src/utils/awsConfig.js

// Common AWS Configuration for DynamoDB direct access
// This file centralizes AWS SDK configuration

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from "aws-amplify/auth";

// Initialize DynamoDB client with credentials
export const createDynamoDBClient = async () => {
  try {
    // Get the current authentication session from Amplify
    const session = await fetchAuthSession();

    if (!session || !session.credentials) {
      throw new Error("No valid authentication credentials found");
    }

    // Configure DynamoDB client with credentials from Amplify session
    const dynamoClient = new DynamoDBClient({
      region: process.env.NEXT_PUBLIC_AWS_REGION || "eu-west-2",
      credentials: session.credentials,
    });

    // Create and return document client
    return DynamoDBDocumentClient.from(dynamoClient);
  } catch (error) {
    console.error("Error creating DynamoDB client:", error);
    throw error;
  }
};

// Table name constants
export const FORUMS_TABLE = "Forums";
export const TOPICS_TABLE = "Topics";
export const REPLIES_TABLE = "Replies";
export const FLAGS_TABLE = "Flags";
export const USER_STATS_TABLE = "UserForumStats";

// Format date for DynamoDB queries
export const formatDateForQuery = (date = new Date()) => {
  return date.toISOString();
};

// Helper function to check if user has moderator privileges
export const hasModeratorPrivileges = (user) => {
  if (!user || !user.groups) return false;
  return user.groups.some((group) => ["Admins", "Moderators"].includes(group));
};

// Helper function to generate a unique ID with prefix
export const generateId = (prefix) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${randomString}`;
};
