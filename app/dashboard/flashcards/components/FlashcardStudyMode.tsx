'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard, FlashcardLibrary, StudyMode, SessionType } from './types';
import { useStudyCards } from '../utils/hooks';
import UnifiedStudyMode from './study/UnifiedStudyMode';
import { Button } from '@/components/ui/button';
import { X, Save, Sparkles, RotateCcw, Info } from 'lucide-react';
import { 
  initializeSession, 
  updateCardState, 
  adjustCardWeight, 
  pickNextCard, 
  getSessionStats,
  getCardInfo,
  getCardDistribution,
  SessionState,
  LearningStage,
  stageColors
} from '../utils/cardPickingAlgorithm';

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
    completedCards: [] as { card: Flashcard, correct: boolean }[],
    isLoading: true,
  });

  // State for the card picking algorithm
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [selectionReason, setSelectionReason] = useState<string>("");
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  
  // Initialize cards and session state once on mount
  useEffect(() => {
    const setupCards = () => {
      let allCards: Flashcard[] = [];
      
      // Create a stable set of cards based on session type
      if (sessionType === 'fixed') {
        // For fixed sessions, repeat cards based on reps
        for (let i = 0; i < reps; i++) {
          allCards = [...allCards, ...getShuffledCards()];
        }
      } else {
        // For infinite sessions, just shuffle once initially
        allCards = getShuffledCards();
      }
      
      // Initialize the session state with these cards
      const newSessionState = initializeSession(allCards);
      
      // Pick the first card
      const { card: firstCard, reason } = pickNextCard(newSessionState);
      
      setSessionState(newSessionState);
      setCurrentCard(firstCard);
      setSelectionReason(reason);
      setStudyState(prev => ({
        ...prev,
        totalCards: sessionType === 'fixed' ? allCards.length : library.cards.length,
        isLoading: false,
      }));
    };
    
    setupCards();
  }, [library.id]); // Only re-run if library changes completely

  // Memoized handlers to prevent unnecessary rerenders
  const handleFlip = useCallback(() => {
    setStudyState(prev => ({ ...prev, flipped: !prev.flipped }));
  }, []);

  // Toggle tooltip visibility
  const handleToggleTooltip = useCallback(() => {
    setShowTooltip(prev => !prev);
  }, []);

  // Process user answer
  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (!sessionState || !currentCard) return;
    
    // Update score in study state
    setStudyState(prev => ({
      ...prev,
      score: prev.score + (isCorrect ? 1 : 0),
      completedCards: [
        ...prev.completedCards,
        { card: currentCard, correct: isCorrect }
      ],
    }));
    
    // Update card state in session state based on user's answer
    setSessionState(prevSession => {
      if (!prevSession) return null;
      return updateCardState(prevSession, currentCard.id, isCorrect);
    });
  }, [sessionState, currentCard]);

  // Adjust the weight of the current card
  const handleAdjustCardWeight = useCallback((adjustment: -1 | 0 | 1) => {
    if (!sessionState || !currentCard) return;
    
    setSessionState(prevSession => {
      if (!prevSession) return null;
      return adjustCardWeight(prevSession, currentCard.id, adjustment);
    });
  }, [sessionState, currentCard]);

  // Move to next card
  const handleNextCard = useCallback(() => {
    if (!sessionState) return;
    
    // For fixed mode, check if we've completed all cards
    if (sessionType === 'fixed' && studyState.completedCards.length >= studyState.totalCards - 1) {
      const totalCards = studyState.completedCards.length + 1; // +1 for current card
      
      onFinish({
        correct: studyState.score,
        total: totalCards,
        score: totalCards > 0 ? Math.round((studyState.score / totalCards) * 100) : 0,
        studyMode,
        sessionType,
        reps,
      });
      return;
    }
    
    // Pick the next card based on the algorithm
    const { card: nextCard, reason } = pickNextCard(sessionState);
    
    // Update the current card and reset flipped state
    setCurrentCard(nextCard);
    setSelectionReason(reason);
    setStudyState(prev => ({
      ...prev,
      flipped: false,
    }));
  }, [sessionState, sessionType, studyState.completedCards.length, studyState.totalCards, studyState.score, onFinish, studyMode, reps]);

  // Skip current card
  const handleSkip = useCallback(() => {
    if (!sessionState || !currentCard) return;
    
    // For infinite mode, pick a new card without updating state
    const { card: nextCard, reason } = pickNextCard(sessionState);
    
    // Update the current card and reset flipped state
    setCurrentCard(nextCard);
    setSelectionReason(reason);
    setStudyState(prev => ({
      ...prev,
      flipped: false,
    }));
  }, [sessionState, currentCard]);

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
  if (studyState.isLoading || !sessionState || !currentCard) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h3 className="text-2xl font-bold">Loading cards...</h3>
      </div>
    );
  }

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

  // Get session stats
  const sessionStats = getSessionStats(sessionState);
  
  // Get card distribution for visualization
  const distribution = getCardDistribution(sessionState);
  
  // Get current card info for tooltip
  const cardInfo = currentCard ? getCardInfo(sessionState, currentCard.id) : null;

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
        {/* Card selection explanation */}
        <div className="mb-4 text-sm text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {cardInfo && (
                <div className={`w-2 h-2 rounded-full bg-${stageColors[cardInfo.stage]}-400/80`}></div>
              )}
              <span className="font-medium">Selection Logic:</span>
            </div>
            <span>{selectionReason}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleTooltip}
            className="h-7 w-7 p-0 rounded-full"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Learning stages statistics */}
        {showTooltip && (
          <div className="mb-4 p-3 bg-muted/30 border border-border rounded-md text-sm">
            <h4 className="font-medium mb-2">Card Distribution:</h4>
            <div className="flex gap-2 mb-2">
              {Object.entries(distribution.counts).map(([stage, count]) => (
                count > 0 && (
                  <div key={stage} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full bg-${stageColors[stage as LearningStage]}-400/80`}></div>
                    <span>{stage}: {count}</span>
                  </div>
                )
              ))}
            </div>
            <div className="flex items-center h-3 bg-muted rounded-full overflow-hidden">
              {Object.entries(distribution.percentages).map(([stage, percentage]) => (
                percentage > 0 && (
                  <div 
                    key={stage} 
                    className={`h-full bg-${stageColors[stage as LearningStage]}-400/80`}
                    style={{ width: `${percentage}%` }}
                    title={`${stage}: ${percentage}%`}
                  ></div>
                )
              ))}
            </div>
            
            {cardInfo && (
              <div className="mt-3 pt-2 border-t border-border">
                <h4 className="font-medium mb-1">Current Card:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>Stage: {cardInfo.stage}</div>
                  <div>Success Rate: {cardInfo.successRate}%</div>
                  <div>Seen: {cardInfo.seen}x</div>
                  <div>Streak: {cardInfo.streak}</div>
                </div>
              </div>
            )}
          </div>
        )}

        <UnifiedStudyMode 
          currentCard={currentCard}
          remainingCards={sessionState.cards
            .filter(c => c.stage === LearningStage.NEW)
            .map(c => c.card)}
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
          onAdjustCardWeight={handleAdjustCardWeight}
          sessionStats={sessionStats}
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