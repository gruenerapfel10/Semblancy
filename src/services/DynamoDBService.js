// File: src/services/DynamoDBService.js

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from "aws-amplify/auth";

class DynamoDBService {
  constructor() {
    this.client = null;
    this.docClient = null;
  }

  async initialize() {
    if (this.docClient) return this.docClient;

    try {
      // Get credentials from current Amplify session
      const { credentials } = await fetchAuthSession();

      // Create DynamoDB client with credentials
      this.client = new DynamoDBClient({
        region: process.env.NEXT_PUBLIC_AWS_REGION || "eu-west-2",
        credentials,
      });

      // Create document client for easier DynamoDB operations
      this.docClient = DynamoDBDocumentClient.from(this.client);
      return this.docClient;
    } catch (error) {
      console.error("Failed to initialize DynamoDB client:", error);
      throw error;
    }
  }

  async get(tableName, key) {
    await this.initialize();

    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });

    try {
      const response = await this.docClient.send(command);
      return response.Item;
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      throw error;
    }
  }

  async put(tableName, item) {
    await this.initialize();

    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });

    try {
      return await this.docClient.send(command);
    } catch (error) {
      console.error(`Error putting item to ${tableName}:`, error);
      throw error;
    }
  }

  async update(
    tableName,
    key,
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames
  ) {
    await this.initialize();

    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_NEW",
    });

    try {
      const response = await this.docClient.send(command);
      return response.Attributes;
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      throw error;
    }
  }

  async delete(tableName, key) {
    await this.initialize();

    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });

    try {
      return await this.docClient.send(command);
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      throw error;
    }
  }

  async query(
    tableName,
    keyConditionExpression,
    expressionAttributeValues,
    expressionAttributeNames,
    indexName = null
  ) {
    await this.initialize();

    const params = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    if (indexName) {
      params.IndexName = indexName;
    }

    const command = new QueryCommand(params);

    try {
      const response = await this.docClient.send(command);
      return response.Items;
    } catch (error) {
      console.error(`Error querying ${tableName}:`, error);
      throw error;
    }
  }

  async scan(
    tableName,
    filterExpression = null,
    expressionAttributeValues = null
  ) {
    await this.initialize();

    const params = {
      TableName: tableName,
    };

    if (filterExpression) {
      params.FilterExpression = filterExpression;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const command = new ScanCommand(params);

    try {
      const response = await this.docClient.send(command);
      return response.Items;
    } catch (error) {
      console.error(`Error scanning ${tableName}:`, error);
      throw error;
    }
  }
}

export default new DynamoDBService();
