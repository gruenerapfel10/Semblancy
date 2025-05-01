import React from 'react';
import { useExamSession } from '@/lib/exam/hooks/useExamSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

/**
 * A component to display and control the current exam session
 * This serves as both a demonstration of the session API and a useful control panel
 */
export function SessionController() {
  const {
    sessionState,
    isActive,
    pauseSession,
    resumeSession,
    endSession,
    navigateToQuestion
  } = useExamSession();

  if (!isActive || !sessionState) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">No Active Session</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No exam session is currently active. Start an exercise to see session details.
        </CardContent>
      </Card>
    );
  }

  // Format the session start time
  const startTimeFormatted = formatDistanceToNow(new Date(sessionState.startedAt), { addSuffix: true });

  // Calculate progress percentage
  const questionProgress = sessionState.userProgress 
    ? Math.round((sessionState.userProgress.questionsAnswered / (sessionState.questionData?.length || 1)) * 100)
    : 0;

  // Format remaining time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Current Session</CardTitle>
          <Badge variant={sessionState.isPaused ? "outline" : "default"}>
            {sessionState.isPaused ? 'Paused' : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Session ID</div>
            <div className="font-medium">{sessionState.id.slice(0, 8)}...</div>
          </div>
          <div>
            <div className="text-muted-foreground">Started</div>
            <div className="font-medium">{startTimeFormatted}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Time Spent</div>
            <div className="font-medium">{Math.floor(sessionState.timeSpent / 60)}m {sessionState.timeSpent % 60}s</div>
          </div>
          <div>
            <div className="text-muted-foreground">Remaining</div>
            <div className="font-medium">{sessionState.userProgress ? formatTime(sessionState.userProgress.timeRemaining) : 'N/A'}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Progress</div>
            <div className="font-medium">{questionProgress}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Current Question</div>
            <div className="font-medium">{sessionState.currentQuestionIndex + 1}</div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {sessionState.isPaused ? (
            <Button size="sm" onClick={resumeSession}>Resume</Button>
          ) : (
            <Button size="sm" onClick={pauseSession}>Pause</Button>
          )}
          <Button size="sm" variant="outline" onClick={() => navigateToQuestion(Math.max(0, sessionState.currentQuestionIndex - 1))}>
            Previous
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigateToQuestion(sessionState.currentQuestionIndex + 1)}>
            Next
          </Button>
          <Button size="sm" variant="destructive" onClick={endSession}>
            End Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 