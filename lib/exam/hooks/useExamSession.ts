import { useState, useEffect, useCallback } from 'react';
import { sessionManager, ExamSessionState, ExamSessionOptions } from '../session';

/**
 * Hook for interacting with the exam session manager
 * Provides methods to start, pause, resume, and manage exam sessions
 */
export function useExamSession() {
  const [sessionState, setSessionState] = useState<ExamSessionState | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Effect to initialize state from active session if it exists
  useEffect(() => {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      setSessionState(activeSession.getState());
      setIsActive(true);
      
      // Subscribe to session state changes
      const unsubscribe = activeSession.subscribe(newState => {
        setSessionState(newState);
      });
      
      // Cleanup subscription
      return () => unsubscribe();
    }
  }, []);

  // Start a new exam session
  const startSession = useCallback((options: ExamSessionOptions) => {
    const session = sessionManager.startSession(options);
    setSessionState(session.getState());
    setIsActive(true);
    
    // Subscribe to state changes
    const unsubscribe = session.subscribe(newState => {
      setSessionState(newState);
    });
    
    return () => unsubscribe();
  }, []);

  // End the current session
  const endSession = useCallback(() => {
    sessionManager.endSession();
    setSessionState(null);
    setIsActive(false);
  }, []);

  // Pause the current session
  const pauseSession = useCallback(() => {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      activeSession.pause();
    }
  }, []);

  // Resume the current session
  const resumeSession = useCallback(() => {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      activeSession.resume();
    }
  }, []);

  // Record an answer
  const recordAnswer = useCallback((questionId: string, answer: any) => {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      activeSession.recordAnswer(questionId, answer);
    }
  }, []);

  // Navigate to a specific question
  const navigateToQuestion = useCallback((index: number) => {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      activeSession.navigateToQuestion(index);
    }
  }, []);

  // Set question data
  const setQuestionData = useCallback((questions: any[]) => {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      activeSession.setQuestionData(questions);
    }
  }, []);

  // Mark a part as completed
  const completeExamPart = useCallback((partName: string) => {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      activeSession.completeExamPart(partName);
    }
  }, []);

  // Complete the session with final score
  const completeSession = useCallback((finalScore?: number) => {
    const activeSession = sessionManager.getActiveSession();
    if (activeSession) {
      activeSession.complete(finalScore);
      setIsActive(false);
    }
  }, []);

  return {
    // State
    sessionState,
    isActive,
    
    // Session management
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    completeSession,
    
    // Question interaction
    recordAnswer,
    navigateToQuestion,
    setQuestionData,
    completeExamPart,
  };
} 