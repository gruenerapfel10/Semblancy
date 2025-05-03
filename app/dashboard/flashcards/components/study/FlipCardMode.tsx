import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, CheckCircle } from 'lucide-react';
import { Flashcard } from '../types';

interface FlipCardModeProps {
  currentCard: Flashcard;
  flipped: boolean;
  onFlip: () => void;
  onAnswer: (correct: boolean) => void;
  answerStatus: 'correct' | 'incorrect' | null;
}

const FlipCardMode: React.FC<FlipCardModeProps> = ({
  currentCard,
  flipped,
  onFlip,
  onAnswer,
  answerStatus,
}) => {
  return (
    <>
      <Card 
        className={`w-full h-80 cursor-pointer transition-all duration-500 transform 
          ${flipped ? 'rotate-y-180' : ''} 
          ${answerStatus ? 'opacity-75' : ''}`} 
        onClick={onFlip}
      >
        {/* Front of Card */}
        <div className={`absolute inset-0 backface-hidden transition-all duration-500 ${flipped ? 'opacity-0' : 'opacity-100'}`}>
          <CardContent className="flex items-center justify-center h-full p-6">
            <div className="text-xl text-center">{currentCard.front}</div>
          </CardContent>
          <CardFooter className="absolute bottom-0 w-full justify-center">
            <p className="text-sm text-muted-foreground">Click to flip</p>
          </CardFooter>
        </div>

        {/* Back of Card */}
        <div className={`absolute inset-0 backface-hidden transition-all duration-500 ${flipped ? 'opacity-100' : 'opacity-0'}`}>
          <CardContent className="flex items-center justify-center h-full p-6">
            <div className="text-xl text-center">{currentCard.back}</div>
          </CardContent>
          <CardFooter className="absolute bottom-0 w-full justify-center">
            <p className="text-sm text-muted-foreground">Click to flip back</p>
          </CardFooter>
        </div>
      </Card>

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline"
          className="flex gap-1 items-center" 
          onClick={() => onAnswer(false)}
          disabled={!flipped}
        >
          <XCircle className="h-5 w-5" />
          Didn&apos;t Know
        </Button>
        
        <Button
          className="flex gap-1 items-center"
          onClick={() => onAnswer(true)}
          disabled={!flipped}
        >
          <CheckCircle className="h-5 w-5" />
          Got It Right
        </Button>
      </div>
    </>
  );
};

export default FlipCardMode; 