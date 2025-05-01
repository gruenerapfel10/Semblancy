'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Define the supported UI languages
export const UI_LANGUAGES = {
  ENGLISH: 'en',
  GERMAN: 'de',
  FRENCH: 'fr',
} as const;

export type UILanguage = typeof UI_LANGUAGES[keyof typeof UI_LANGUAGES];

// Make English the default
export const DEFAULT_LANGUAGE = UI_LANGUAGES.ENGLISH;

// Define the context type
interface LanguageContextType {
  language: UILanguage;
  setLanguage: (language: UILanguage) => void;
  isLanguageLoaded: boolean;
}

const LOCAL_STORAGE_KEY = 'leapexams_ui_language';
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<UILanguage>(DEFAULT_LANGUAGE);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  // Load language from localStorage on initial mount
  useEffect(() => {
    try {
      // Only run this on the client side
      if (typeof window !== 'undefined') {
        const savedLanguage = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (savedLanguage && Object.values(UI_LANGUAGES).includes(savedLanguage as UILanguage)) {
          setLanguageState(savedLanguage as UILanguage);
        } else {
          // If no saved language, try to detect from browser
          const browserLanguage = navigator.language.split('-')[0];
          const matchedLanguage = Object.values(UI_LANGUAGES).find(lang => lang === browserLanguage);
          
          if (matchedLanguage) {
            setLanguageState(matchedLanguage);
            localStorage.setItem(LOCAL_STORAGE_KEY, matchedLanguage);
          }
        }
        
        // Mark as loaded
        setIsLanguageLoaded(true);
      }
    } catch (error) {
      console.error('Error loading UI language from localStorage:', error);
      setIsLanguageLoaded(true); // Still mark as loaded so the app can function
    }
  }, []);

  // Memoized function to set language
  const setLanguage = useCallback((lang: UILanguage) => {
    if (!Object.values(UI_LANGUAGES).includes(lang)) {
      console.error(`Invalid UI language: ${lang}`);
      return;
    }
    
    try {
      setLanguageState(lang);
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
      
      // Set the cookie for Next.js to use for routing if we implement that later
      document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000`;
    } catch (error) {
      console.error('Error saving UI language to localStorage:', error);
    }
  }, []);

  // Provide context value
  const contextValue = {
    language,
    setLanguage,
    isLanguageLoaded
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 