import { useState } from 'react';
import { ModalProps } from '../base';
import { MultipleChoicePrompt, MultipleChoiceAnswer } from './index';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export function MultipleChoiceComponent({
  prompt,
  onAnswer,
  config
}: ModalProps<MultipleChoicePrompt, MultipleChoiceAnswer>) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const { allowMultipleCorrect = false } = config;

  const handleOptionSelect = (index: number) => {
    if (allowMultipleCorrect) {
      setSelectedAnswers(prev => 
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedAnswers([index]);
    }
  };

  const handleSubmit = () => {
    onAnswer({ selectedAnswers });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-lg font-medium">{prompt.question}</div>
        
        <div className="space-y-4">
          {allowMultipleCorrect ? (
            // Multiple selection with checkboxes
            <div className="space-y-3">
              {prompt.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox
                    id={`option-${index}`}
                    checked={selectedAnswers.includes(index)}
                    onCheckedChange={() => handleOptionSelect(index)}
                  />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          ) : (
            // Single selection with radio buttons
            <RadioGroup
              value={selectedAnswers[0]?.toString()}
              onValueChange={(value) => handleOptionSelect(parseInt(value))}
            >
              <div className="space-y-3">
                {prompt.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={selectedAnswers.length === 0}
          className="w-full"
        >
          Submit Answer
        </Button>
      </div>
    </Card>
  );
} 