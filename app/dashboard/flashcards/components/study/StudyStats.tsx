import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FlipHorizontal, FileText } from 'lucide-react';
import { StudyMode, SessionType } from '../types';

interface StudyStatsProps {
  libraryName: string;
  completedCards: number;
  totalCards: number;
  score: number;
  studyMode: StudyMode;
  sessionType: SessionType;
}

const StudyStats: React.FC<StudyStatsProps> = ({
  libraryName,
  completedCards,
  totalCards,
  score,
  studyMode,
  sessionType,
}) => {
  // Calculate progress percentage
  const progressPercentage = (completedCards / totalCards) * 100;
  
  // Calculate current score percentage (avoid division by zero)
  const scorePercentage = Math.max(0, Math.round((score / Math.max(1, completedCards)) * 100));
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold">{libraryName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">
              {sessionType === 'infinite' ? (
                <>
                  <span className="font-mono">∞</span> Infinite Runner
                </>
              ) : (
                <>{completedCards} / {totalCards} Cards</>
              )}
            </Badge>
            <Badge variant="outline" className="font-mono">
              Score: {score} ({scorePercentage}%)
            </Badge>
            <Badge variant={studyMode === 'flip' ? 'default' : 'secondary'} className="gap-1">
              {studyMode === 'flip' ? (
                <><FlipHorizontal className="h-3 w-3" /> Flip</>
              ) : (
                <><FileText className="h-3 w-3" /> Interactive</>
              )}
            </Badge>
          </div>
        </div>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default StudyStats; 