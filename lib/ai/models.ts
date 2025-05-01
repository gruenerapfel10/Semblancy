import {
    customProvider,
    extractReasoningMiddleware,
    wrapLanguageModel,
  } from 'ai';
  import { customMiddleware } from './custom-middleware';
  import { anthropic } from '@ai-sdk/anthropic';
  import { openai } from '@ai-sdk/openai';
  import { google } from '@ai-sdk/google';
  
  export const customModel = (
    apiIdentifier: string,
    forReasoning: boolean = false,
  ) => {
    // Select the appropriate provider based on the API identifier prefix
    if (apiIdentifier.startsWith('gemini.')) {
      return wrapLanguageModel({
        model: google(apiIdentifier.replace('gemini.', '')),
        middleware: customMiddleware,
      });
    } else if (apiIdentifier.startsWith('anthropic.')) {
      return wrapLanguageModel({
        model: anthropic(apiIdentifier.replace('anthropic.', '')),
        middleware: customMiddleware,
      });
    } else if (apiIdentifier.startsWith('openai.')) {
      return wrapLanguageModel({
        model: openai(apiIdentifier.replace('openai.', '')),
        middleware: customMiddleware,
      });
    } else {
      // Default to anthropic for other identifiers (legacy support)
      // You might want to add error handling here in the future
      return wrapLanguageModel({
        model: anthropic(apiIdentifier),
        middleware: customMiddleware,
      });
    }
  };
  
  // Ensure the Google API key is available
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn('GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables');
  }
  
  export const myProvider = customProvider({
    languageModels: {
        'gpt-4o-mini': customModel('openai.gpt-4o-mini'),
        flash: customModel('gemini.gemini-2.0-flash-exp'),
      haiku: customModel('anthropic.claude-3-haiku-20240307-v1:0'),
      'general-bedrock-agent': customModel('anthropic.claude-3-sonnet-20240229-v1:0'),
      'sharepoint-agent': customModel('anthropic.claude-3-sonnet-20240229-v1:0'),
      'chat-model-reasonifng': customModel('deepseek-ai/DeepSeek-R1', true),
      'deepresearch-model-reasoning': customModel(
        'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
        true,
      ),
      'crawler-agent': customModel('anthropic.claude-3-5-sonnet-20240620-v1:0'),
      'artifact-model': customModel('anthropic.claude-3-sonnet-20240229-v1:0'),
      'deepresearch-agent': customModel(
        'anthropic.claude-3-sonnet-20240229-v1:0',
      ),
      'document-agent': customModel('anthropic.claude-3-sonnet-20240229-v1:0'),
      'csv-agent': customModel('anthropic.claude-3-sonnet-20240229-v1:0'),   
    },
    imageModels: {
      'dall-e-3': openai.image('dall-e-3'),
    },
  });
  
  export const chatModels = [
      {
        id: 'general-bedrock-agent',
        name: 'General Assistant',
        description: 'Standard AI assistant for general tasks',
      },
      {
        id: 'sharepoint-agent',
        name: 'Sharepoint Assistant',
        description: 'Specialized for Sharepoint integration',
      },
      {
        id: 'crawler-agent',
        name: 'Web search assistant',
        description: 'Finds market insights and online data',
      },
      {
        id: 'deepresearch-agent',
        name: 'Deep Research Assistant',
        description: 'Advanced research capabilities',
      },
      {
        id: 'chat-model-reasoning',
        name: 'Reasoning Assistant',
        description: 'Shows step-by-step reasoning',
      },
      {
        id: 'document-agent',
        name: 'Document Assistant',
        description: 'Provides info about documents',
      },
      {
        id: 'csv-agent',
        name: 'CSV Data Assistant',
        description: 'Helps analyze and process CSV data',
      },
  ];
  
  export const DEFAULT_MODEL_NAME: string = 'flash';
  