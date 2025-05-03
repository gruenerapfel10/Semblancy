// scripts/init-forums.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// Configure client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-west-2",
  // Add credentials here or use AWS CLI configured credentials
});
const docClient = DynamoDBDocumentClient.from(client);

// Initial forum categories
const initialForums = [
  {
    id: "forum_general",
    name: "General Discussion",
    description: "General topics and discussions",
    category: "general",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "forum_mathematics",
    name: "Mathematics",
    description: "Mathematics discussions and questions",
    category: "mathematics",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "forum_physics",
    name: "Physics",
    description: "Physics topics and questions",
    category: "physics",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "forum_chemistry",
    name: "Chemistry",
    description: "Chemistry discussions and experiments",
    category: "chemistry",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "forum_english",
    name: "English",
    description: "English literature and language",
    category: "english",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "forum_history",
    name: "History",
    description: "Historical discussions and questions",
    category: "history",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initialize forums
async function initializeForums() {
  console.log("Starting forum initialization...");

  for (const forum of initialForums) {
    try {
      console.log(`Adding forum: ${forum.name}`);
      await docClient.send(
        new PutCommand({
          TableName: "Forums",
          Item: forum,
        })
      );
    } catch (error) {
      console.error(`Error adding forum ${forum.name}:`, error);
    }
  }

  console.log("Forum initialization complete");
}

initializeForums();
