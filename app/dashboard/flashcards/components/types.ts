// Types for Flashcard application

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  lastReviewed?: Date;
  tags?: string[];
}

export interface FlashcardLibrary {
  id: string;
  name: string;
  description?: string;
  cards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  libraryId: string;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  correctAnswers: number;
  score: number;
  studyMode: 'flip' | 'interactive';
  sessionType: SessionType;
  reps?: number;
}

export interface MarkingResponse {
  isCorrect: boolean;
  score: number;
  feedback: string;
  explanation: string;
}

export type StudyMode = 'flip' | 'interactive';

export type SessionType = 'infinite' | 'fixed';

export interface StudyState {
  currentCardIndex: number;
  flipped: boolean;
  showAnswer: boolean;
  answerStatus: 'correct' | 'incorrect' | null;
  score: number;
  totalCards: number;
  remainingCards: Flashcard[];
  completedCards: Array<{
    card: Flashcard;
    correct: boolean;
  }>;
  studyMode: StudyMode;
  sessionType: SessionType;
  reps?: number;
  userAnswer?: string;
} 