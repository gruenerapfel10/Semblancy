import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Dices, BarChart3, Timer } from 'lucide-react';
import { StudySession } from './types';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => (
  <Card>
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
      {icon}
    </CardContent>
  </Card>
);

interface FlashcardStudyResultsProps {
  session: {
    correct: number;
    total: number;
    score: number;
  };
  libraryName: string;
  onRestart: () => void;
  onExit: () => void;
  previousSessions?: StudySession[];
}

const FlashcardStudyResults: React.FC<FlashcardStudyResultsProps> = ({
  session,
  libraryName,
  onRestart,
  onExit,
  previousSessions = [],
}) => {
  // Calculate best and average scores
  const bestScore = Math.max(
    ...previousSessions.map(s => s.score).concat(session.score)
  );
  
  const avgScore = previousSessions.length > 0
    ? Math.round(
        (previousSessions.reduce((sum, s) => sum + s.score, 0) + session.score) / 
        (previousSessions.length + 1)
      )
    : session.score;

  // Determine performance message
  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Excellent! You've mastered these cards!";
    if (score >= 70) return "Great job! You're getting really good!";
    if (score >= 50) return "Good progress! Keep practicing!";
    return "Keep studying! You'll improve with practice.";
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex flex-col items-center text-center mb-8">
        <h2 className="text-2xl font-bold">{libraryName} Study Results</h2>
        <p className="text-sm text-muted-foreground">
          Let&apos;s review your performance
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" /> 
            Your Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold mb-4">
              {session.score}%
            </div>
            <Progress value={session.score} className="w-full h-3 mb-2" />
            <div className="flex justify-between w-full text-sm text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="mt-6 text-center">
              {getPerformanceMessage(session.score)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard 
          title="Correct" 
          value={`${session.correct} / ${session.total}`}
          icon={<Badge variant="outline" className="text-xl p-2">
            {Math.round((session.correct / session.total) * 100)}%
          </Badge>}
        />
        <StatsCard 
          title="Best Score" 
          value={`${bestScore}%`}
          icon={<BarChart3 className="h-8 w-8 text-primary/60" />}
        />
        <StatsCard 
          title="Average Score" 
          value={`${avgScore}%`}
          icon={<Timer className="h-8 w-8 text-primary/60" />}
        />
      </div>

      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={onExit}>
          Exit
        </Button>
        <Button onClick={onRestart} className="gap-1">
          <Dices className="h-4 w-4" /> Study Again
        </Button>
      </div>
    </div>
  );
};

export default FlashcardStudyResults; 