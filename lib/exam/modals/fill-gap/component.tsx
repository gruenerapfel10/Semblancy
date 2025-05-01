import { useState, useEffect } from 'react';
import { ModalProps } from '../base';
import { FillGapPrompt, FillGapAnswer } from './index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export function FillGapComponent({
  prompt,
  onAnswer,
  config
}: ModalProps<FillGapPrompt, FillGapAnswer>) {
  const [answers, setAnswers] = useState<Array<{ id: number; value: string }>>([]);
  const { showHints = true, minAnswerLength = 1, maxAnswerLength = 50 } = config;

  // Initialize answers array
  useEffect(() => {
    setAnswers(prompt.gaps.map(gap => ({ id: gap.id, value: '' })));
  }, [prompt.gaps]);

  const handleAnswerChange = (id: number, value: string) => {
    setAnswers(prev => 
      prev.map(answer => 
        answer.id === id ? { ...answer, value } : answer
      )
    );
  };

  const handleSubmit = () => {
    onAnswer({ answers });
  };

  // Split text into segments with gaps
  const textSegments = prompt.text.split(/\{(\d+)\}/);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="prose dark:prose-invert">
          {textSegments.map((segment, index) => {
            // Even indices are text, odd indices are gap numbers
            if (index % 2 === 0) {
              return <span key={index}>{segment}</span>;
            }

            const gapId = parseInt(segment);
            const gap = prompt.gaps.find(g => g.id === gapId);
            const answer = answers.find(a => a.id === gapId);

            if (!gap || !answer) return null;

            return (
              <span key={index} className="inline-flex items-center gap-2">
                <Input
                  value={answer.value}
                  onChange={(e) => handleAnswerChange(gapId, e.target.value)}
                  className="w-32 inline-block"
                  placeholder="Type answer"
                  minLength={minAnswerLength}
                  maxLength={maxAnswerLength}
                />
                {showHints && gap.hint && (
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>{gap.hint}</TooltipContent>
                  </Tooltip>
                )}
              </span>
            );
          })}
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={answers.some(a => !a.value.trim())}
          className="w-full"
        >
          Submit Answers
        </Button>
      </div>
    </Card>
  );
} 