'use client';

import React, { useEffect } from 'react';
import { Flashcard, FlashcardLibrary, StudyMode, SessionType } from './types';
import { Button } from '@/components/ui/button';
import { X, Save, Sparkles, RotateCcw } from 'lucide-react';
import UnifiedStudyMode from './study/UnifiedStudyMode';
import { useFlashcards } from './FlashcardContext';
import { LearningStage } from '../utils/cardPickingAlgorithm';

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
  // Use the context for all state and logic
  const { 
    currentCard,
    sessionState,
    studyStateData,
    handleFlip,
    handleAnswer,
    handleNextCard,
    handleSkip,
    handleEndStudySession,
    initializeStudySession,
    sessionStats,
    // Additional interactive mode props
    userAnswer,
    setUserAnswer,
    isChecking,
    handleCheckAnswer,
    markingResult,
    selectedGrade
  } = useFlashcards();

  // Initialize the study session when the component mounts
  useEffect(() => {
    initializeStudySession(library, studyMode, sessionType, reps);
  }, [library, studyMode, sessionType, reps, initializeStudySession]);

  // Show loading state
  if (studyStateData.isLoading || !sessionState || !currentCard) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h3 className="text-2xl font-bold">Loading cards...</h3>
      </div>
    );
  }

  // Calculate score percentage for display
  const scorePercentage = studyStateData.completedCards.length > 0 
    ? Math.round((studyStateData.score / studyStateData.completedCards.length) * 100) 
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
      <div className="w-full py-2 px-4 bg-muted/30 border-b border-border mb-[12em]">
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
                  {studyStateData.score}/{studyStateData.completedCards.length} ({scorePercentage}%)
                </span>
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEndStudySession}
              className="gap-1"
            >
              <Save className="h-3.5 w-3.5" />
              End Session
            </Button>
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
          remainingCards={sessionState.cards
            .filter((c: any) => c.stage === LearningStage.NEW)
            .map((c: any) => c.card)}
          completedCards={studyStateData.completedCards}
          totalCards={studyStateData.totalCards}
          score={studyStateData.score}
          studyMode={studyMode}
          sessionType={sessionType}
          onAnswer={handleAnswer}
          onNextCard={handleNextCard}
          onSkip={handleSkip}
          onFlip={handleFlip}
          onEndSession={handleEndStudySession}
          isFlipped={studyStateData.flipped}
          libraryName={library.name}
          sessionStats={sessionStats}
          // Interactive mode props
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          isChecking={isChecking}
          handleCheckAnswer={handleCheckAnswer}
          markingResult={markingResult}
          selectedGrade={selectedGrade}
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