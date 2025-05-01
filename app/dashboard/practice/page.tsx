"use client";

import { useState, useEffect, Suspense } from "react";
import { ConfigLayout } from "./components/config/config-layout";
import { useExamState } from "./hooks/use-exam-state";

function PracticePageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const examState = useExamState();

  useEffect(() => {
    // Set loading to false after the first render
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full">
        <div className="h-full animate-pulse bg-muted/50 rounded-lg" />
      </div>
    );
  }

  return (
    <ConfigLayout 
      selectedModule={examState.selectedModule}
      setSelectedModule={examState.setSelectedModule}
      selectedLevel={examState.selectedLevel}
      setSelectedLevel={examState.setSelectedLevel}
      moduleConfig={examState.moduleConfig}
      levelConfig={examState.levelConfig}
      examTypeConfig={examState.examTypeConfig}
      availableModules={examState.availableModules}
      availableLevels={examState.availableLevels}
      onStart={examState.startSession}
    />
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="h-full">
        <div className="h-full animate-pulse bg-muted/50 rounded-lg" />
      </div>
    }>
      <PracticePageContent />
    </Suspense>
  );
} 