import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Flashcard, FlashcardLibrary, StudySession, StudyMode } from '../components/types';

// Local storage keys
const LIBRARIES_STORAGE_KEY = "flashcard-libraries";
const SESSIONS_STORAGE_KEY = "flashcard-study-sessions";

// Demo data for initial state
export const getDemoData = (): FlashcardLibrary[] => [
  {
    id: "lib-1",
    name: "JavaScript Fundamentals",
    description: "Basic concepts in JavaScript",
    cards: [
      { id: "card-1", front: "What is a closure?", back: "A function that has access to its outer function's variables." },
      { id: "card-2", front: "What is hoisting?", back: "JavaScript's behavior of moving declarations to the top of the current scope." },
      { id: "card-3", front: "Difference between let and var?", back: "let is block-scoped, var is function-scoped." },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "lib-2",
    name: "React Hooks",
    description: "Common React hooks and their usage",
    cards: [
      { id: "card-4", front: "What is useState?", back: "A hook that lets you add state to functional components." },
      { id: "card-5", front: "What is useEffect?", back: "A hook for side effects in functional components." },
      { id: "card-6", front: "What is useContext?", back: "A hook that lets you subscribe to a context without nesting." },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Hook for managing libraries
export const useLibraries = () => {
  const [libraries, setLibraries] = useState<FlashcardLibrary[]>([]);
  
  // Load libraries from localStorage
  useEffect(() => {
    try {
      const savedLibraries = localStorage.getItem(LIBRARIES_STORAGE_KEY);
      
      if (savedLibraries) {
        setLibraries(JSON.parse(savedLibraries));
      } else {
        // Use demo data if no saved libraries
        setLibraries(getDemoData());
      }
    } catch (error) {
      console.error("Error loading libraries from localStorage:", error);
      setLibraries(getDemoData());
    }
  }, []);

  // Save libraries to localStorage
  useEffect(() => {
    if (libraries.length > 0) {
      localStorage.setItem(LIBRARIES_STORAGE_KEY, JSON.stringify(libraries));
    }
  }, [libraries]);

  // CRUD functions
  const addLibrary = (libraryData: Partial<FlashcardLibrary>) => {
    const newLibrary: FlashcardLibrary = {
      id: uuidv4(),
      name: libraryData.name || "Untitled Library",
      description: libraryData.description,
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setLibraries(prevLibraries => [...prevLibraries, newLibrary]);
    return newLibrary.id;
  };

  const updateLibrary = (libraryData: Partial<FlashcardLibrary>) => {
    if (!libraryData.id) return null;
    
    setLibraries(prevLibraries => 
      prevLibraries.map(lib => 
        lib.id === libraryData.id 
          ? { ...lib, ...libraryData, updatedAt: new Date() } 
          : lib
      )
    );
    return libraryData.id;
  };

  const deleteLibrary = (id: string) => {
    setLibraries(prevLibraries => prevLibraries.filter(lib => lib.id !== id));
  };

  return { 
    libraries, 
    addLibrary, 
    updateLibrary, 
    deleteLibrary,
    setLibraries
  };
};

// Hook for managing cards within a library
export const useCards = (libraries: FlashcardLibrary[], setLibraries: React.Dispatch<React.SetStateAction<FlashcardLibrary[]>>) => {
  const addCard = (libraryId: string, cardData: Partial<Flashcard>) => {
    const newCard: Flashcard = {
      id: uuidv4(),
      front: cardData.front || "",
      back: cardData.back || "",
    };
    
    setLibraries(prevLibraries => 
      prevLibraries.map(lib => 
        lib.id === libraryId 
          ? {
              ...lib,
              cards: [...lib.cards, newCard],
              updatedAt: new Date()
            } 
          : lib
      )
    );
    return newCard.id;
  };

  const updateCard = (libraryId: string, cardData: Partial<Flashcard>) => {
    if (!cardData.id) return null;
    
    setLibraries(prevLibraries => 
      prevLibraries.map(lib => 
        lib.id === libraryId 
          ? {
              ...lib,
              cards: lib.cards.map(card => 
                card.id === cardData.id 
                  ? { ...card, ...cardData } 
                  : card
              ),
              updatedAt: new Date()
            } 
          : lib
      )
    );
    return cardData.id;
  };

  const deleteCard = (libraryId: string, cardId: string) => {
    setLibraries(prevLibraries => 
      prevLibraries.map(lib => 
        lib.id === libraryId 
          ? {
              ...lib,
              cards: lib.cards.filter(card => card.id !== cardId),
              updatedAt: new Date()
            } 
          : lib
      )
    );
  };

  return { addCard, updateCard, deleteCard };
};

// Hook for managing study sessions
export const useStudySessions = () => {
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  
  // Load study sessions from localStorage
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      
      if (savedSessions) {
        setStudySessions(JSON.parse(savedSessions));
      }
    } catch (error) {
      console.error("Error loading sessions from localStorage:", error);
      setStudySessions([]);
    }
  }, []);

  // Save study sessions to localStorage
  useEffect(() => {
    if (studySessions.length > 0) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(studySessions));
    }
  }, [studySessions]);

  const addStudySession = (libraryId: string, results: { correct: number; total: number; score: number; studyMode: StudyMode }) => {
    const newSession: StudySession = {
      id: uuidv4(),
      libraryId,
      startTime: new Date(),
      endTime: new Date(),
      cardsReviewed: results.total,
      correctAnswers: results.correct,
      score: results.score,
      studyMode: results.studyMode,
      sessionType: results.sessionType,
    };
    
    setStudySessions(prev => [...prev, newSession]);
    return newSession;
  };

  return { studySessions, addStudySession };
};

// Hook for handling flashcard shuffling and studying
export const useStudyCards = (cards: Flashcard[]) => {
  // Shuffle array helper
  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Returns shuffled cards
  const getShuffledCards = () => shuffleArray([...cards]);
  
  return { getShuffledCards };
}; 