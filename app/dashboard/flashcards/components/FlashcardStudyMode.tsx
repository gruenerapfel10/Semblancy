'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard, FlashcardLibrary, StudyMode, SessionType } from './types';
import { useStudyCards } from '../utils/hooks';
import UnifiedStudyMode from './study/UnifiedStudyMode';
import { Button } from '@/components/ui/button';
import { X, Save, Sparkles, RotateCcw } from 'lucide-react';

interface FlashcardStudyModeProps {
  library: FlashcardLibrary;
  studyMode: StudyMode;
  sessionType: SessionType;
  reps?: number;
  onFinish: (session: { correct: number; total: number; score: number; studyMode: StudyMode; sessionType: SessionType; reps?: number }) => void;
  onExit: () => void;
}

const FlashcardStudyMode: React.FC<FlashcardStudyModeProps> = ({
  library,
  studyMode,
  sessionType,
  reps = 1,
  onFinish,
  onExit,
}) => {
  const { getShuffledCards } = useStudyCards(library.cards);
  
  // State for study session
  const [studyState, setStudyState] = useState({
    flipped: false,
    score: 0,
    totalCards: 0,
    remainingCards: [] as Flashcard[],
    completedCards: [] as { card: Flashcard, correct: boolean }[],
    isLoading: true,
  });

  // Initialize cards only once on mount
  useEffect(() => {
    const setupCards = () => {
      let cards: Flashcard[] = [];
      
      // Create a stable set of cards based on session type
      if (sessionType === 'fixed') {
        // For fixed sessions, repeat cards based on reps
        for (let i = 0; i < reps; i++) {
          cards = [...cards, ...getShuffledCards()];
        }
      } else {
        // For infinite sessions, just shuffle once initially
        cards = getShuffledCards();
      }
      
      setStudyState(prev => ({
        ...prev,
        remainingCards: cards,
        totalCards: sessionType === 'fixed' ? cards.length : library.cards.length,
        isLoading: false,
      }));
    };
    
    setupCards();
  }, [library.id]); // Only re-run if library changes completely

  // Memoized handlers to prevent unnecessary rerenders
  const handleFlip = useCallback(() => {
    setStudyState(prev => ({ ...prev, flipped: !prev.flipped }));
  }, []);

  // Process user answer
  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (studyState.remainingCards.length === 0) return;
    
    const currentCard = studyState.remainingCards[0];
    
    setStudyState(prev => ({
      ...prev,
      score: prev.score + (isCorrect ? 1 : 0),
      completedCards: [
        ...prev.completedCards,
        { card: currentCard, correct: isCorrect }
      ],
    }));
  }, [studyState.remainingCards]);

  // Move to next card
  const handleNextCard = useCallback(() => {
    if (studyState.remainingCards.length <= 1) {
      if (sessionType === 'infinite') {
        // For infinite mode, get a fresh shuffle but preserve current card state
        const newCards = getShuffledCards();
        
        setStudyState(prev => ({
          ...prev,
          flipped: false,
          // Filter out the current card to prevent immediate repetition
          remainingCards: newCards.filter(card => 
            card.id !== prev.remainingCards[0]?.id
          ),
        }));
      } else {
        // For fixed mode, end the session
        const totalCards = studyState.completedCards.length + 
                          (studyState.remainingCards.length > 0 ? 1 : 0);
        
        onFinish({
          correct: studyState.score,
          total: totalCards,
          score: totalCards > 0 ? Math.round((studyState.score / totalCards) * 100) : 0,
          studyMode,
          sessionType,
          reps,
        });
      }
    } else {
      // Move to next card
      setStudyState(prev => ({
        ...prev,
        flipped: false,
        remainingCards: prev.remainingCards.slice(1),
      }));
    }
  }, [studyState.remainingCards, studyState.completedCards, sessionType, studyMode, reps, onFinish, getShuffledCards]);

  // Skip current card
  const handleSkip = useCallback(() => {
    if (studyState.remainingCards.length <= 1) {
      if (sessionType === 'infinite') {
        // For infinite mode, reshuffle but skip current card
        const currentCardId = studyState.remainingCards[0]?.id;
        const newCards = getShuffledCards().filter(card => card.id !== currentCardId);
        
        setStudyState(prev => ({
          ...prev,
          flipped: false,
          remainingCards: newCards,
        }));
      } else {
        // For fixed mode, add as incorrect and move to next
        handleAnswer(false);
        handleNextCard();
      }
    } else {
      // Move the current card to the end of the deck
      setStudyState(prev => ({
        ...prev,
        flipped: false,
        remainingCards: [
          ...prev.remainingCards.slice(1),
          prev.remainingCards[0]
        ],
      }));
    }
  }, [studyState.remainingCards, sessionType, handleAnswer, handleNextCard, getShuffledCards]);

  // End the current session and save progress
  const handleEndSession = useCallback(() => {
    // Calculate total based on completed cards
    const totalCards = studyState.completedCards.length;
    
    // Calculate score
    const score = totalCards > 0
      ? Math.round((studyState.score / totalCards) * 100)
      : 0;

    // Finish the session
    onFinish({
      correct: studyState.score,
      total: totalCards,
      score: score,
      studyMode,
      sessionType,
      reps: sessionType === 'fixed' ? reps : undefined
    });
  }, [studyState.completedCards, studyState.score, onFinish, studyMode, sessionType, reps]);
  
  // Show loading state
  if (studyState.isLoading || studyState.remainingCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h3 className="text-2xl font-bold">Loading cards...</h3>
      </div>
    );
  }

  // Current card to display
  const currentCard = studyState.remainingCards[0];

  // Calculate score percentage for display
  const scorePercentage = studyState.completedCards.length > 0 
    ? Math.round((studyState.score / studyState.completedCards.length) * 100) 
    : 0;

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500 dark:text-green-400';
    if (score >= 70) return 'text-emerald-500 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">
      {/* Full-width banner header */}
      <div className="w-full py-2 px-4 bg-muted/30 border-b border-border mb-6">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">{library.name}</div>
            <div className="h-4 w-px bg-border/50"></div>
            <div className="flex gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center">
                {studyMode === 'flip' ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Flip Cards
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Interactive
                  </>
                )}
              </span>
              <span>{sessionType === 'fixed' ? 'Fixed Session' : 'Continuous'}</span>
              <span>
                Score: <span className={getScoreColor(scorePercentage)}>
                  {studyState.score}/{studyState.completedCards.length} ({scorePercentage}%)
                </span>
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {sessionType === 'infinite' && studyState.completedCards.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEndSession}
                className="gap-1"
              >
                <Save className="h-3.5 w-3.5" />
                End Session
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExit} 
              className="gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Exit
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto p-4 max-w-4xl w-full">
        <UnifiedStudyMode 
          currentCard={currentCard}
          remainingCards={studyState.remainingCards.slice(1)}
          completedCards={studyState.completedCards}
          totalCards={studyState.totalCards}
          score={studyState.score}
          studyMode={studyMode}
          sessionType={sessionType}
          onAnswer={handleAnswer}
          onNextCard={handleNextCard}
          onSkip={handleSkip}
          onFlip={handleFlip}
          onEndSession={handleEndSession}
          isFlipped={studyState.flipped}
          libraryName={library.name}
        />
      </div>
    </div>
  );
};

export default FlashcardStudyMode;

// Add this CSS somewhere in your global styles to enable card flipping
// .rotate-y-180 {
//   transform: rotateY(180deg);
// }
// .backface-hidden {
//   backface-visibility: hidden;
// } 