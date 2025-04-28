import { GoogleGenerativeAI } from '@google/generative-ai';
import { StreamingTextResponse, GoogleGenerativeAIStream } from 'ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Store API key in memory (for development/testing)
let apiKey: string | null = null;

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const hasApiKey = () => {
  return !!apiKey;
};

export const clearApiKey = () => {
  apiKey = null;
};

export const sendMessage = async (messages: { role: 'user' | 'assistant'; content: string }[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Convert messages to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await model.generateContentStream({
      contents: geminiMessages,
    });

    const stream = GoogleGenerativeAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};

// For testing/development purposes
export const generateTestResponse = async (message: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        role: 'assistant',
        content: `This is a test response to: ${message}`,
      });
    }, 1000);
  });
}; 