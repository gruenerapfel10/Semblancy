import { UILanguage } from '@/lib/context/language-context';
import { cache } from 'react';

// Cache the loaded messages for each language to avoid unnecessary re-fetching
const messagesCache = new Map<UILanguage, any>();

// Use React's cache to deduplicate and memoize the loading of messages
export const getMessages = cache(async (locale: UILanguage): Promise<Record<string, any>> => {
  // Return from cache if available
  if (messagesCache.has(locale)) {
    return messagesCache.get(locale);
  }

  try {
    // Dynamic import of the messages file
    const messages = (await import(`@/messages/${locale}.json`)).default;
    // Store in cache
    messagesCache.set(locale, messages);
    return messages;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // If loading messages for the specified language fails, 
    // let's try to load English as a fallback
    if (locale !== 'en') {
      return getMessages('en' as UILanguage);
    }
    // If even loading English fails, return an empty object
    return {};
  }
});

// Helper to get a nested message by key path (e.g., "reading.title")
export function getMessageByPath(messages: any, path: string): string {
  const parts = path.split('.');
  let current = messages;
  
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      console.warn(`Missing translation for path: ${path}`);
      return path; // Return the path as a fallback
    }
    current = current[part];
  }
  
  if (typeof current !== 'string') {
    console.warn(`Missing translation for path: ${path}`);
    return path; // Return the path as a fallback
  }
  
  return current;
}

// Format a message with variables
export function formatMessage(message: string, variables?: Record<string, any>): string {
  if (!variables) return message;
  
  return message.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
} 