'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EXAM_TYPES, ExamType, DEFAULT_EXAM } from '../exam/config';

// Define types for user preferences
interface UserPreferences {
  examType: ExamType;
  difficulty: string;
  // Add other preferences here (language, theme, etc.)
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  examType: DEFAULT_EXAM,
  difficulty: "",
  // Add other defaults here
};

interface UserPreferencesContextValue {
  preferences: UserPreferences;
  isLoaded: boolean;
  setExamType: (type: ExamType) => void;
  setDifficulty: (difficulty: string) => void;
  // Add other setter methods for preferences here
}

// Storage key
const STORAGE_KEY = 'leapexams_user_preferences';

// Create context
const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined);

/**
 * Loads preferences from localStorage with proper error handling
 */
function loadPreferencesFromStorage(): UserPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    if (!savedPreferences) {
      return DEFAULT_PREFERENCES;
    }

    const parsedPreferences = JSON.parse(savedPreferences) as Partial<UserPreferences>;
    
    // Validate exam type
    const examType = parsedPreferences.examType && 
      Object.values(EXAM_TYPES).includes(parsedPreferences.examType) ? 
      parsedPreferences.examType : DEFAULT_EXAM;
    
    // Merge with defaults to ensure all properties exist
    return {
      ...DEFAULT_PREFERENCES,
      ...parsedPreferences,
      examType, // Use validated exam type
    };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Provider component for user preferences
 */
export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  // Use state initializer function to avoid unnecessary recalculations on re-renders
  const [preferences, setPreferences] = useState<UserPreferences>(() => DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences once on mount
  useEffect(() => {
    const loadedPreferences = loadPreferencesFromStorage();
    setPreferences(loadedPreferences);
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }
  }, [preferences, isLoaded]);

  // Setter functions for specific preferences
  const setExamType = (type: ExamType) => {
    if (!Object.values(EXAM_TYPES).includes(type)) {
      console.error(`Invalid exam type: ${type}`);
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      examType: type
    }));
  };

  const setDifficulty = (difficulty: string) => {
    setPreferences(prev => ({
      ...prev,
      difficulty
    }));
  };

  // Context value
  const contextValue: UserPreferencesContextValue = {
    preferences,
    isLoaded,
    setExamType,
    setDifficulty,
    // Add other setters here
  };

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

/**
 * Hook to use user preferences
 */
export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}

/**
 * Convenience hook to access exam type and difficulty
 */
export function useExam() {
  const { preferences, isLoaded, setExamType, setDifficulty } = useUserPreferences();
  return {
    examType: preferences.examType,
    difficulty: preferences.difficulty,
    isExamTypeLoaded: isLoaded,
    setExamType,
    setDifficulty
  };
} 