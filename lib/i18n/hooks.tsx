'use client';

import { useLanguage } from '@/lib/context/language-context';
import { useEffect, useState } from 'react';
import { getMessageByPath, formatMessage } from './utils';

// Client-side hook for translations
export function useTranslation() {
  const { language, isLanguageLoaded } = useLanguage();
  const [messages, setMessages] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLanguageLoaded) return;

    const loadMessages = async () => {
      try {
        const importedMessages = (await import(`@/messages/${language}.json`)).default;
        setMessages(importedMessages);
      } catch (error) {
        console.error(`Failed to load messages for locale ${language}:`, error);
        // Try to load English as fallback
        try {
          const fallbackMessages = (await import('@/messages/en.json')).default;
          setMessages(fallbackMessages);
        } catch (fallbackError) {
          console.error('Failed to load fallback messages:', fallbackError);
          setMessages({});
        }
      } finally {
        setIsLoaded(true);
      }
    };

    loadMessages();
  }, [language, isLanguageLoaded]);

  const t = (key: string, variables?: Record<string, any>): string => {
    if (!isLoaded) return key; // Return key if messages aren't loaded yet
    
    const message = getMessageByPath(messages, key);
    return variables ? formatMessage(message, variables) : message;
  };

  return {
    t,
    isLoaded,
    language
  };
}

// Re-export for server components (they will use the utils.ts functions directly) 