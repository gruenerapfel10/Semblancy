import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlashcardLibrary, StudyMode, SessionType } from './types';
import { FlipHorizontal, FileText, Brain } from 'lucide-react';

interface FlashcardStudyConfigProps {
  library: FlashcardLibrary;
  onStart: (mode: StudyMode, sessionType: SessionType, reps: number) => void;
  onCancel: () => void;
}

const FlashcardStudyConfig: React.FC<FlashcardStudyConfigProps> = ({
  library,
  onStart,
  onCancel,
}) => {
  const [studyMode, setStudyMode] = useState<StudyMode>('flip');
  const [sessionType, setSessionType] = useState<SessionType>('infinite');
  const [reps, setReps] = useState<number>(1);

  const handleStart = () => {
    onStart(studyMode, sessionType, sessionType === 'fixed' ? reps : 0);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Study Configuration</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Studying: {library.name}</h3>
            <p className="text-muted-foreground mb-2">
              Select your preferred study mode:
            </p>
          </div>

          <Tabs 
            defaultValue="flip" 
            className="w-full"
            onValueChange={(value) => setStudyMode(value as StudyMode)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="flip" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <div className="flex flex-col items-center gap-2 py-2">
                  <FlipHorizontal className="h-10 w-10" />
                  <span>Flip Cards</span>
                  <span className="text-xs text-muted-foreground">
                    Passively review cards by flipping them
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="interactive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <div className="flex flex-col items-center gap-2 py-2">
                  <FileText className="h-10 w-10" />
                  <span>Interactive</span>
                  <span className="text-xs text-muted-foreground">
                    Type your answers and get feedback
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-8 bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5" />
              Mode Details:
            </h4>
            {studyMode === 'flip' ? (
              <div>
                <p className="text-sm mb-2">
                  In Flip Cards mode, you&apos;ll see the front of each card and can flip it to reveal the answer.
                </p>
                <p className="text-sm text-muted-foreground">
                  After seeing the answer, you&apos;ll self-report whether you knew it or not.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-2">
                  In Interactive mode, you&apos;ll be asked to type your answer for each card.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your answer will be automatically checked against the correct answer.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-4">
            <div>
              <div className="font-medium mb-2">Session Type</div>
              <Tabs defaultValue={sessionType} onValueChange={v => setSessionType(v as SessionType)} className="w-48">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="infinite">Infinite</TabsTrigger>
                  <TabsTrigger value="fixed">Fixed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {sessionType === 'fixed' && (
              <div>
                <div className="font-medium mb-2">Reps</div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={reps}
                  onChange={e => setReps(Number(e.target.value))}
                  className="border rounded px-2 py-1 w-20"
                />
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleStart}>
            Start Studying
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FlashcardStudyConfig; 