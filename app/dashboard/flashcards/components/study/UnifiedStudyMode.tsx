'use client';

import React, { useRef } from 'react';
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
  BarChart,
  BookOpen,
  Eye
} from 'lucide-react';
import { Flashcard, StudyMode, SessionType, MarkingResponse } from '../types';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { FlippedCard } from '../../utils/cardPickingAlgorithm';

interface UnifiedStudyModeProps {
  currentCard: FlippedCard;
  remainingCards: Flashcard[];
  completedCards: { card: Flashcard, correct: boolean }[];
  totalCards: number;
  score: number;
  studyMode: StudyMode;
  sessionType: SessionType;
  onAnswer: (grade: number) => void;
  onNextCard: () => void;
  onSkip: () => void;
  onFlip?: () => void;
  onEndSession: () => void;
  isFlipped?: boolean;
  libraryName: string;
  sessionStats?: {
    totalCards: number;
    seenCards: number;
    masteredCards: number;
    unseenCards: number;
    completion: number;
    stageCounts: {
      [key: string]: number;
      new: number;
      learning: number;
      mastered: number;
    };
    currentCycleProgress: number;
  };
  isChecking?: boolean;
  userAnswer?: string;
  setUserAnswer?: (value: string) => void;
  handleCheckAnswer?: () => void;
  markingResult?: MarkingResponse | null;
  selectedGrade?: number | null;
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
  sessionStats,
  isChecking = false,
  userAnswer = '',
  setUserAnswer = () => {},
  handleCheckAnswer = () => {},
  markingResult = null,
  selectedGrade = null,
}) => {
  // Input reference for focus management
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input (can still be done via a ref)
  React.useEffect(() => {
    if (studyMode === 'interactive' && !isFlipped && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentCard.id, isFlipped, studyMode]);

  // Handle manual answer in flip card mode
  const handleManualAnswer = (grade: number) => {
    // Call parent's onAnswer function to register the card as completed
    onAnswer(grade);
    
    // Move to next card after providing rating
    setTimeout(() => {
      onNextCard();
    }, 300); // Slightly longer delay to ensure the state is updated
  };

  // Handle user selecting a grade (used by both modes)
  const handleGradeSelection = (grade: number) => {
    // Call parent's onAnswer function to update completedCards state
    onAnswer(grade);
    
    // Wait a bit before continuing to the next card so the user sees their selection
    setTimeout(() => {
      onNextCard();
    }, 300); // Slightly longer delay to ensure the state is updated
  };

  // Calculate progress percentage
  const progressPercent = (completedCards.length / totalCards) * 100;

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500 dark:text-green-400';
    if (score >= 70) return 'text-emerald-500 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  // Ensure we render based on stable data
  const frontContent = currentCard.front;
  const backContent = currentCard.back;

  // Calculate learning cards (total - unseen - mastered)
  const learningCards = sessionStats ? 
    sessionStats.totalCards - sessionStats.unseenCards - sessionStats.masteredCards : 0;

  // Handle keypress events
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // --- Enter Key --- 
      if (e.key === 'Enter') {
        if (studyMode === 'interactive') {
          if (!markingResult && !isChecking && userAnswer.trim()) {
            handleCheckAnswer(); // Check answer if not already checked
          } else if (markingResult) {
            // If answer shown, Enter continues to next card
            onNextCard();
          }
        } else if (studyMode === 'flip') {
          if (!isFlipped) {
            onFlip?.(); // Flip if not flipped
          } else {
            // If card is flipped, Enter continues to next card
            onNextCard();
          }
        }
      // --- Space Key --- (Only in Flip mode)
      } else if (e.key === ' ' && studyMode === 'flip') {
        if (!isFlipped) {
          e.preventDefault(); // Prevent page scroll
          onFlip?.(); // Flip if not flipped
        }
      } else if (e.key === 'ArrowRight') {
        // Arrow right also continues
        if ((studyMode === 'interactive' && markingResult) || 
            (studyMode === 'flip' && isFlipped)) {
          onNextCard();
        }
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [studyMode, isFlipped, markingResult, isChecking, userAnswer, onFlip, handleCheckAnswer, onNextCard]);

  return (
    <div className="w-full max-w-4xl mx-auto transition-all duration-300 relative">
      {/* Session Stats Badge (if available) */}
      {sessionStats && (
        <div className="absolute -top-14 right-0 text-xs text-muted-foreground flex items-center gap-3 bg-background/80 p-2 rounded-md border border-border/50 shadow-sm">
          <div className="flex items-center gap-1">
            <BarChart className="h-3 w-3" /> 
            <span>{sessionStats.completion}% done</span> 
          </div>
          <div className="h-3 w-px bg-border/50"></div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-gray-500/80" /> 
            <span>{sessionStats.unseenCards} new</span>
          </div>
          <div className="h-3 w-px bg-border/50"></div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-blue-500/70" /> 
            <span>{sessionStats.stageCounts?.learning || 0} learn</span> 
          </div>
          <div className="h-3 w-px bg-border/50"></div>
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-500/70" /> 
            <span>{sessionStats.masteredCards} master</span> 
          </div>
          <div className="h-3 w-px bg-border/50"></div>
          <div className="flex items-center gap-1">
            <RotateCcw className="h-3 w-3 text-blue-500/70" /> 
            <span>{currentCard.isFlipped ? 'A→Q' : 'Q→A'}</span>
          </div>
        </div>
      )}

      <Card className="w-full shadow-lg hover:shadow-xl transition-all duration-300 border-0">
        <CardContent className="p-8 md:p-12 relative">
          {/* Progress indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5">
            <Progress value={progressPercent} className="rounded-none h-full" />
          </div>

          <div className="mb-8"> 
            <p className="learning-question text-2xl font-semibold">
              {frontContent}
              {/* {currentCard.isFlipped && (
                <span className="text-xs ml-2 text-muted-foreground">(Answer shown as question)</span>
              )} */}
            </p> 
          </div>

          {/* Interactive Mode Answer UI */}
          {studyMode === 'interactive' && (
            markingResult ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 mt-8"> 
                <div className="bg-muted/30 rounded-lg p-5 border border-muted">
                  <p className="text-lg font-medium leading-relaxed learning-content">
                    {userAnswer || "(No answer provided)"}
                  </p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-5 border border-muted">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">AI Evaluation</div> 
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary pulse-attention" />
                      <span className="text-sm font-medium">AI Marked</span>
                      {currentCard.isFlipped && (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                          Flipped Card Marking
                        </span>
                      )}
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
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    {currentCard.isFlipped ? 'Original Question' : 'Correct Answer'}
                  </div> 
                  <p className="learning-answer text-lg font-medium">
                    {backContent}
                  </p>
                  
                  {markingResult.explanation && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                        Explanation {currentCard.isFlipped && '(Adjusted for flipped card)'}
                      </div> 
                      <p className="text-md leading-relaxed learning-content">{markingResult.explanation}</p>
                    </div>
                  )}
                </div>

                {/* Continue Button (Primary Action) */}
                <div className="flex justify-end mt-4">
                  <Button 
                    className="flashcard-button bg-primary hover:bg-primary/90"
                    onClick={onNextCard}
                  >
                    Continue
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>

                {/* Optional Ratings - Simplified to 3 buttons */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 text-center">
                    Optional: Rate your recall
                  </div>
                  <div className="flex justify-center gap-3">
                    {[
                      { grade: 1, label: 'Poor', color: 'bg-red-500 hover:bg-red-600' },
                      { grade: 3, label: 'Good', color: 'bg-yellow-500 hover:bg-yellow-600' },
                      { grade: 5, label: 'Perfect', color: 'bg-emerald-600 hover:bg-emerald-700' },
                    ].map(({ grade, label, color }) => (
                      <Button
                        key={grade}
                        variant="default"
                        onClick={() => {
                          handleGradeSelection(grade);
                        }}
                        className={cn(
                          color, 
                          'text-white font-semibold px-6 py-2 transition-all duration-150 ease-in-out w-24',
                          selectedGrade === grade ? 'ring-2 ring-offset-2 ring-primary dark:ring-sky-400 scale-105' : 'hover:scale-105'
                        )}
                        style={{ opacity: selectedGrade !== null && selectedGrade !== grade ? 0.6 : 1 }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 mt-6"> 
                <div>
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
            <div className="relative min-h-[300px] flex flex-col justify-between"> 
              <div className="flex-grow">
                {currentCard.isFlipped && (
                  <div className="text-xs text-muted-foreground mb-4">
                    Note: This card is flipped - the answer is shown as the question
                  </div>
                )}
              </div>

              <div className={cn(
                "transition-opacity duration-500 ease-in-out",
                isFlipped ? "opacity-0 pointer-events-none h-0" : "opacity-100"
              )}>
                <div className="flex justify-center mt-8 mb-4"> 
                  <Button 
                    className="px-8 py-6 text-lg"
                    onClick={onFlip}
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Flip to see answer
                  </Button>
                </div>
              </div>
              
              <div className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-in-out",
                !isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
              )}>
                <div className="h-full flex flex-col">
                  <div className="bg-muted/30 rounded-lg p-5 border border-muted mb-6">
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Answer</div> 
                    <p className="learning-answer text-xl font-medium">
                      {backContent}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-auto pt-6 border-t border-border">
                    {/* Continue Button (Primary Action) */}
                    <div className="flex justify-end">
                      <Button 
                        className="flashcard-button bg-primary hover:bg-primary/90"
                        onClick={onNextCard}
                      >
                        Continue
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                    
                    {/* Optional Ratings - Simplified to 3 buttons */}
                    <div className="mt-4">
                      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 text-center">
                        Optional: Rate your recall
                      </div>
                      <div className="flex justify-center gap-3">
                        {[
                          { grade: 1, label: 'Poor', color: 'bg-red-500 hover:bg-red-600' },
                          { grade: 3, label: 'Good', color: 'bg-yellow-500 hover:bg-yellow-600' },
                          { grade: 5, label: 'Perfect', color: 'bg-emerald-600 hover:bg-emerald-700' },
                        ].map(({ grade, label, color }) => (
                          <Button
                            key={grade}
                            variant="default"
                            onClick={() => handleManualAnswer(grade)}
                            className={cn(
                              color, 
                              'text-white font-semibold px-6 py-2 transition-all duration-150 ease-in-out w-24',
                              selectedGrade === grade ? 'ring-2 ring-offset-2 ring-primary dark:ring-sky-400 scale-105' : 'hover:scale-105'
                            )}
                            style={{ opacity: selectedGrade !== null && selectedGrade !== grade ? 0.6 : 1 }}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
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
                AI-Powered Study {currentCard.isFlipped && '(Flipped Q/A)'}
              </>
            ) : (
              <>
                <RotateCcw className="h-3 w-3" />
                Flip Cards {currentCard.isFlipped && '(Flipped Q/A)'}
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
            onClick={isFlipped ? onNextCard : onFlip}
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