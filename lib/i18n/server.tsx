'use server';

import { cookies } from 'next/headers';
import { DEFAULT_LANGUAGE, UI_LANGUAGES, UILanguage } from '@/lib/context/language-context';
import { getMessages, getMessageByPath, formatMessage } from './utils';

/**
 * Gets the current UI language from cookies or falls back to default
 */
export async function getCurrentLanguage(): Promise<UILanguage> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  
  if (localeCookie?.value && Object.values(UI_LANGUAGES).includes(localeCookie.value as UILanguage)) {
    return localeCookie.value as UILanguage;
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Gets translations for server components
 */
export async function getTranslations(locale?: UILanguage) {
  const language = locale || await getCurrentLanguage();
  const messages = await getMessages(language);
  
  return {
    t: (key: string, variables?: Record<string, any>): string => {
      const message = getMessageByPath(messages, key);
      return variables ? formatMessage(message, variables) : message;
    },
    language
  };
} 