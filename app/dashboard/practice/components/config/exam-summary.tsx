import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, BookOpen, Target, FileQuestion, Brain } from "lucide-react";
import { useMediaQuery } from "@/app/hooks/use-media-query";
import { ModuleConfig, LevelConfig } from "@/lib/exam";
import { useExamSession } from "@/lib/exam/hooks/useExamSession";
import { useCallback } from "react";

interface ExamSummaryProps {
  moduleConfig: ModuleConfig;
  levelConfig: LevelConfig;
  examType: string;
  onStart: () => void;
}

export function ExamSummary({ 
  moduleConfig, 
  levelConfig, 
  examType,
  onStart 
}: ExamSummaryProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { startSession } = useExamSession();
  
  if (!moduleConfig || !levelConfig) return null;
  const { details } = levelConfig;

  // Handle starting the exercise
  const handleStartExercise = useCallback(() => {
    // Start a new session with the current configs
    startSession({
      examType,
      moduleId: moduleConfig.id,
      levelId: levelConfig.id
    });
    
    // Call the parent's onStart handler
    onStart();
  }, [examType, moduleConfig.id, levelConfig.id, onStart, startSession]);

  return (
    <Card className="h-full flex flex-col bg-muted/50">
      <CardHeader className="p-4 pb-2 shrink-0">
        <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Exercise Summary</span>
            <Badge variant="secondary" className="text-xs">
              {details.examStructure.totalQuestions} questions
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs">
            {details.examStructure.totalDuration} min
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm">Review your settings before starting</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-4">
        <div className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              <span>Module</span>
            </div>
            <p className="text-sm">{moduleConfig.label}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4" />
              <span>Level</span>
            </div>
            <p className="text-sm">{levelConfig.label}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Brain className="h-4 w-4" />
              <span>Difficulty</span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {details.examStructure.difficulty}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            <span>Time Structure</span>
          </div>
          <div className="space-y-1">
            {details.examStructure.parts.map((part, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{part.name}</span>
                <span className="font-medium">{part.duration} min</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <Button className="w-full" size="lg" onClick={handleStartExercise}>
          Start Exercise
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You can pause and resume the exercise at any time
        </p>
      </CardContent>
    </Card>
  );
} 