'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, 
  SkipForward, 
  Sparkles, 
  Check, 
  X, 
  Loader2, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  BarChart,
  BookOpen,
  Eye
} from 'lucide-react';
import { Flashcard, StudyMode, SessionType, MarkingResponse } from '../types';
import { cn } from '@/lib/utils';
import { streamMarkAnswer } from '../../actions';
import { Progress } from '@/components/ui/progress';

interface UnifiedStudyModeProps {
  currentCard: Flashcard;
  remainingCards: Flashcard[];
  completedCards: { card: Flashcard, correct: boolean }[];
  totalCards: number;
  score: number;
  studyMode: StudyMode;
  sessionType: SessionType;
  onAnswer: (isCorrect: boolean) => void;
  onNextCard: () => void;
  onSkip: () => void;
  onFlip?: () => void;
  onEndSession: () => void;
  isFlipped?: boolean;
  libraryName: string;
  onAdjustCardWeight?: (adjustment: -1 | 0 | 1) => void;
  sessionStats?: {
    totalCards: number;
    seenCards: number;
    masteredCards: number;
    unseenCards: number;
    completion: number;
  };
}

const UnifiedStudyMode: React.FC<UnifiedStudyModeProps> = ({
  currentCard,
  remainingCards,
  completedCards,
  totalCards,
  score,
  studyMode,
  sessionType,
  onAnswer,
  onNextCard,
  onSkip,
  onFlip,
  onEndSession,
  isFlipped = false,
  libraryName,
  onAdjustCardWeight,
  sessionStats,
}) => {
  // Use a ref to store the current card ID to detect changes
  const currentCardIdRef = useRef<string>(currentCard?.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [markingResult, setMarkingResult] = useState<MarkingResponse | null>(null);
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Memoize the current card to prevent unnecessary re-renders
  const stableCurrentCard = useMemo(() => currentCard, [currentCard.id]);

  // Reset when card changes
  useEffect(() => {
    // Only reset if the card actually changed
    if (currentCardIdRef.current !== currentCard.id) {
      currentCardIdRef.current = currentCard.id;
      setUserAnswer('');
      setMarkingResult(null);
      setIsStreamingComplete(false);
      setIsChecking(false);
      setIsAnimating(false);
    }
  }, [currentCard.id]);

  // Focus input for interactive mode when card changes
  useEffect(() => {
    if (studyMode === 'interactive' && !isFlipped && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentCard.id, isFlipped, studyMode]);

  // Handle keypress events
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (studyMode === 'interactive') {
          if (markingResult) {
            handleNextCard();
          } else if (!isChecking && userAnswer.trim()) {
            handleCheckAnswer();
          }
        } else if (studyMode === 'flip' && isFlipped) {
          handleNextCard();
        } else if (studyMode === 'flip' && !isFlipped) {
          onFlip?.();
        }
      } else if (e.key === ' ' && studyMode === 'flip') {
        // Space bar to flip in flip mode
        e.preventDefault();
        onFlip?.();
      } else if (e.key === 'ArrowRight') {
        if ((studyMode === 'flip' && isFlipped) || 
            (studyMode === 'interactive' && markingResult)) {
          handleNextCard();
        }
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [markingResult, isChecking, isFlipped, studyMode, userAnswer, onFlip]);

  // Check answer for interactive mode
  const handleCheckAnswer = useCallback(async () => {
    if (isChecking || !userAnswer.trim()) return;
    
    setIsChecking(true);
    setMarkingResult(null);
    setIsStreamingComplete(false);
    
    try {
      await streamMarkAnswer(
        userAnswer,
        stableCurrentCard.back,
        stableCurrentCard.front,
        (data) => {
          setMarkingResult(data);
          setIsAnimating(true);
          
          // Trigger the parent component's answer handler
          if (data.isCorrect !== undefined) {
            onAnswer(data.isCorrect);
          }
        }
      );
      setIsStreamingComplete(true);
    } catch (error) {
      console.error('Error marking answer:', error);
      // If AI marking fails, default to manual check
      setMarkingResult({
        isCorrect: false,
        score: 0,
        feedback: "Error checking answer. Please review the correct answer below.",
        explanation: ""
      });
      onAnswer(false);
    } finally {
      setIsChecking(false);
    }
  }, [userAnswer, stableCurrentCard, onAnswer, isChecking]);

  // In flip card mode, handle user marking their own answer
  const handleManualAnswer = useCallback((isCorrect: boolean) => {
    onAnswer(isCorrect);
  }, [onAnswer]);

  // Wrapper for next card to clear state first
  const handleNextCard = useCallback(() => {
    setMarkingResult(null);
    setIsStreamingComplete(false);
    setIsAnimating(false);
    onNextCard();
  }, [onNextCard]);

  // Calculate progress percentage
  const progressPercent = useMemo(() => 
    (completedCards.length / totalCards) * 100,
    [completedCards.length, totalCards]
  );

  // Calculate score color
  const getScoreColor = useCallback((score: number) => {
    if (score >= 90) return 'text-green-500 dark:text-green-400';
    if (score >= 70) return 'text-emerald-500 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  }, []);

  // Ensure we render based on stable data
  const frontContent = stableCurrentCard.front;
  const backContent = stableCurrentCard.back;

  // Handle card weight adjustment
  const handleSeeMore = useCallback(() => {
    onAdjustCardWeight?.(1);
  }, [onAdjustCardWeight]);

  const handleSeeLess = useCallback(() => {
    onAdjustCardWeight?.(-1);
  }, [onAdjustCardWeight]);

  // Calculate learning cards (total - unseen - mastered)
  const learningCards = sessionStats ? 
    sessionStats.totalCards - sessionStats.unseenCards - sessionStats.masteredCards : 0;

  return (
    <div className="w-full max-w-4xl mx-auto transition-all duration-300 relative">
      {/* Session Stats Badge (if available) */}
      {sessionStats && (
        <div className="absolute -top-14 right-0 text-sm text-muted-foreground flex items-center gap-3 bg-background/80 p-2 rounded-md border border-border/50 shadow-sm">
          <div className="flex items-center gap-1">
            <BarChart className="h-3.5 w-3.5" />
            <span>{sessionStats.completion}% completed</span>
          </div>
          <div className="h-3 w-px bg-border/50"></div>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-gray-500/80" />
            <span>{sessionStats.unseenCards} new</span>
          </div>
          <div className="h-3 w-px bg-border/50"></div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-blue-500/70" />
            <span>{learningCards} learning</span>
          </div>
          <div className="h-3 w-px bg-border/50"></div>
          <div className="flex items-center gap-1">
            <Check className="h-3.5 w-3.5 text-emerald-500/70" />
            <span>{sessionStats.masteredCards} mastered</span>
          </div>
        </div>
      )}

      <Card className="w-full shadow-lg hover:shadow-xl transition-all duration-300 border-0">
        <CardContent className="p-8 md:p-12 relative">
          {/* Progress indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5">
            <Progress value={progressPercent} className="rounded-none h-full" />
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Question {completedCards.length + 1} of {totalCards}
              {sessionType === 'infinite' && ' (Continuous)'}
            </div>
            <p className="learning-question text-xl font-medium">{frontContent}</p>
          </div>

          {/* Interactive Mode Answer UI */}
          {studyMode === 'interactive' && (
            markingResult ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="bg-muted/30 rounded-lg p-5 border border-muted">
                  <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Your Answer</div>
                  <p className="text-lg font-medium leading-relaxed learning-content">
                    {userAnswer || "(No answer provided)"}
                  </p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-5 border border-muted">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm uppercase tracking-wider text-muted-foreground">AI Evaluation</div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary pulse-attention" />
                      <span className="text-sm font-medium">AI Marked</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    {markingResult.isCorrect ? (
                      <Check className="h-6 w-6 text-green-500 dark:text-green-400" />
                    ) : (
                      <X className="h-6 w-6 text-red-500 dark:text-red-400" />
                    )}
                    <span className={cn(
                      "text-xl font-bold",
                      getScoreColor(markingResult.score)
                    )}>
                      {markingResult.score}%
                    </span>
                  </div>
                  
                  <div className="learning-feedback">
                    <p>{markingResult.feedback}</p>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-5 border border-muted">
                  <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Correct Answer</div>
                  <p className="learning-answer text-lg font-medium">
                    {backContent}
                  </p>
                  
                  {markingResult.explanation && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Explanation</div>
                      <p className="text-md leading-relaxed learning-content">{markingResult.explanation}</p>
                    </div>
                  )}
                </div>

                {/* Card frequency adjustment */}
                {onAdjustCardWeight && (
                  <div className="flex items-center justify-between mt-4 bg-muted/20 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Adjust this card&apos;s frequency:</div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSeeLess}
                        className="flex items-center gap-1 text-amber-500 hover:text-amber-600 hover:border-amber-200"
                      >
                        <TrendingDown className="h-3.5 w-3.5" />
                        See Less
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSeeMore}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:border-emerald-200"
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                        See More
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Button 
                    className="flashcard-button"
                    onClick={handleNextCard}
                  >
                    Continue
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Your Answer</div>
                  <div className="flex gap-3">
                    <Input
                      ref={inputRef}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="flashcard-input flex-1"
                      disabled={isChecking}
                    />
                    <Button 
                      onClick={handleCheckAnswer} 
                      className="flashcard-button bg-primary hover:bg-primary/90"
                      disabled={isChecking || !userAnswer.trim()}
                    >
                      {isChecking ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Check with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    variant="ghost" 
                    onClick={onSkip}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isChecking}
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip this card
                  </Button>
                </div>
              </div>
            )
          )}

          {/* Flip Card Mode UI */}
          {studyMode === 'flip' && (
            <div className="relative min-h-[300px]">
              <div className={cn(
                "absolute inset-0 transform transition-transform duration-500 ease-in-out backface-hidden",
                isFlipped && "rotate-y-180 opacity-0 pointer-events-none"
              )}>
                <div className="flex flex-col h-full justify-between">
                  <p className="text-lg mb-20">
                    {/* Front content already shown at the top */}
                  </p>
                  
                  <div className="flex justify-center mt-8">
                    <Button 
                      className="px-8 py-6 text-lg"
                      onClick={onFlip}
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Flip to see answer
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "absolute inset-0 transform transition-transform duration-500 ease-in-out backface-hidden",
                !isFlipped && "rotate-y-180 opacity-0 pointer-events-none"
              )}>
                <div className="h-full flex flex-col">
                  <div className="bg-muted/30 rounded-lg p-5 border border-muted mb-6">
                    <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Answer</div>
                    <p className="learning-answer text-xl font-medium">
                      {backContent}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-auto">
                    <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">How well did you know this?</div>
                    <div className="flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        onClick={() => handleManualAnswer(false)}
                      >
                        <ThumbsDown className="h-5 w-5 mr-2" />
                        Incorrect
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30"
                        onClick={() => handleManualAnswer(true)}
                      >
                        <ThumbsUp className="h-5 w-5 mr-2" />
                        Correct
                      </Button>
                    </div>
                    
                    {/* Card frequency adjustment */}
                    {onAdjustCardWeight && (
                      <div className="flex items-center justify-between mt-4 bg-muted/20 p-3 rounded-md">
                        <div className="text-sm text-muted-foreground">Adjust this card&apos;s frequency:</div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSeeLess}
                            className="flex items-center gap-1 text-amber-500 hover:text-amber-600"
                          >
                            <TrendingDown className="h-3.5 w-3.5" />
                            Less
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSeeMore}
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <TrendingUp className="h-3.5 w-3.5" />
                            More
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="ghost" 
                        onClick={onFlip}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Flip back
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card type indicator */}
          <div className="absolute top-4 right-4 text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            {studyMode === 'interactive' ? (
              <>
                <Sparkles className="h-3 w-3 pulse-attention" />
                AI-Powered Study
              </>
            ) : (
              <>
                <RotateCcw className="h-3 w-3" />
                Flip Cards
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer navigation for flip mode */}
      {studyMode === 'flip' && (
        <div className="mt-4 flex justify-between">
          <Button 
            variant="outline" 
            onClick={onSkip}
            className="flex items-center gap-2"
          >
            <SkipForward className="h-4 w-4" />
            Skip
          </Button>
          
          <Button 
            onClick={isFlipped ? handleNextCard : onFlip}
            className="flex items-center gap-2"
          >
            {isFlipped ? (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Flip
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UnifiedStudyMode;

// Add this CSS in your global styles
// .rotate-y-180 {
//   transform: rotateY(180deg);
// }
// .backface-hidden {
//   backface-visibility: hidden;
// }
// .pulse-attention {
//   animation: pulse 2s infinite;
// }
// @keyframes pulse {
//   0% { opacity: 0.6; }
//   50% { opacity: 1; }
//   100% { opacity: 0.6; }
// }
// .flowing-border-card {
//   position: relative;
//   z-index: 0;
// }
// .flowing-border-card::before {
//   content: '';
//   position: absolute;
//   z-index: -1;
//   inset: -2px;
//   border-radius: inherit;
//   background: linear-gradient(90deg, var(--primary), transparent, var(--primary));
//   background-size: 200% 100%;
//   animation: borderFlow 2s linear infinite;
// }
// .flowing-border-correct::before {
//   background: linear-gradient(90deg, rgb(22, 163, 74), transparent, rgb(22, 163, 74));
//   background-size: 200% 100%;
// }
// .flowing-border-incorrect::before {
//   background: linear-gradient(90deg, rgb(220, 38, 38), transparent, rgb(220, 38, 38));
//   background-size: 200% 100%;
// }
// @keyframes borderFlow {
//   0% { background-position: 0% 0; }
//   100% { background-position: 200% 0; }
// } 