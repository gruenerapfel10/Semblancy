import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, SkipForward, Sparkles, Check, X, Loader2 } from 'lucide-react';
import { Flashcard, MarkingResponse } from '../types';
import { cn } from '@/lib/utils';
import { streamMarkAnswer } from '../../actions';
import { Progress } from '@/components/ui/progress';

interface InteractiveModeProps {
  currentCard: Flashcard;
  userAnswer: string;
  showAnswer: boolean;
  onAnswerChange: (answer: string) => void;
  onNextCard: () => void;
  onSkip: () => void;
  progressPercent: number;
}

const InteractiveMode: React.FC<InteractiveModeProps> = ({
  currentCard,
  userAnswer,
  showAnswer,
  onAnswerChange,
  onNextCard,
  onSkip,
  progressPercent,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [markingResult, setMarkingResult] = useState<MarkingResponse | null>(null);
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset marking results when card changes
  useEffect(() => {
    setMarkingResult(null);
    setIsStreamingComplete(false);
    setIsChecking(false);
    setIsAnimating(false);
  }, [currentCard]);

  // Focus input when card changes
  useEffect(() => {
    if (!showAnswer && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentCard, showAnswer]);

  // Global Enter key for check/next card
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (markingResult) {
          handleNextCard();
        } else if (!isChecking) {
          handleCheckAnswer();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [markingResult, isChecking]);

  const handleCheckAnswer = async () => {
    if (isChecking || !userAnswer.trim()) return;
    
    setIsChecking(true);
    setMarkingResult(null);
    setIsStreamingComplete(false);
    
    try {
      await streamMarkAnswer(
        userAnswer,
        currentCard.back,
        currentCard.front,
        (data) => {
          setMarkingResult(data);
          setIsAnimating(true);
        }
      );
      setIsStreamingComplete(true);
    } catch (error) {
      console.error('Error marking answer:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Wrapper for next card to clear state first
  const handleNextCard = useCallback(() => {
    setMarkingResult(null);
    setIsStreamingComplete(false);
    setIsAnimating(false);
    onNextCard();
  }, [onNextCard]);

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500 dark:text-green-400';
    if (score >= 70) return 'text-emerald-500 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto transition-all duration-300 relative",
      isAnimating && "p-1"
    )}>
      <Card className={cn(
        "w-full shadow-lg hover:shadow-xl transition-all duration-300 border-0",
        isAnimating && "overflow-hidden flowing-border-card",
        markingResult?.isCorrect ? "flowing-border-correct" : (markingResult && "flowing-border-incorrect")
      )}>
        <CardContent className="p-8 md:p-12 relative">
          {/* Progress indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5">
            <Progress value={progressPercent} className="rounded-none h-full" />
          </div>

          {/* Question Area - Increased prominence and spacing */}
          <div className="mb-8"> 
            <p className="learning-question text-2xl font-semibold">{currentCard.front}</p> 
          </div>

          {/* Conditional Rendering: Answer Input or Results */}
          {markingResult ? (
            // --- Results Display --- 
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 mt-8"> 
              {/* User's Answer Box */}
              <div className="bg-muted/30 rounded-lg p-5 border border-muted">
                {/* Title removed - context is clear */}
                <p className="text-lg font-medium leading-relaxed learning-content">
                  {userAnswer || "(No answer provided)"}
                </p>
              </div>
              
              {/* AI Evaluation Box */}
              <div className="bg-muted/30 rounded-lg p-5 border border-muted">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">AI Evaluation</div> 
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
              
              {/* Correct Answer Box */}
              <div className="bg-muted/30 rounded-lg p-5 border border-muted">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Correct Answer</div> 
                <p className="learning-answer text-lg font-medium">
                  {currentCard.back}
                </p>
                
                {/* Optional Explanation */}
                {markingResult.explanation && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Explanation</div> 
                    <p className="text-md leading-relaxed learning-content">{markingResult.explanation}</p>
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <div className="flex justify-end mt-6"> 
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
            // --- Answer Input Area --- 
            <div className="space-y-6 mt-6"> 
              <div>
                {/* Title removed - input context is clear */}
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={userAnswer}
                    onChange={(e) => onAnswerChange(e.target.value)}
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

              {/* Skip Button - Adjusted spacing */}
              <div className="flex justify-end pt-2"> 
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={onSkip}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isChecking}
                >
                  <SkipForward className="h-4 w-4" />
                  Skip this card
                </Button>
              </div>
            </div>
          )}

          {/* Card type indicator */}
          <div className="absolute top-4 right-4 text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 pulse-attention" />
            AI-Powered Study
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveMode; 