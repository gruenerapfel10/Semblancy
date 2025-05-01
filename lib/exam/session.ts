/**
 * Exam Session Management System
 * Tracks user progress, state, and data through an exam session
 */

import { v4 as uuidv4 } from 'uuid';
import { ExamModuleRegistry } from './modules/base';

// Types for session state
export interface ExamSessionState {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  examType: string;
  moduleId: string;
  levelId: string;
  currentQuestionIndex: number;
  answers: Record<string, any>;
  score?: number;
  timeSpent: number; // in seconds
  isPaused: boolean;
  pausedAt?: Date;
  questionData?: any[];
  userProgress?: {
    partsCompleted: string[];
    questionsAnswered: number;
    questionsCorrect: number;
    timeRemaining: number;
  };
  // Extensible - can add more properties as needed
  [key: string]: any;
}

export interface ExamSessionOptions {
  examType: string;
  moduleId: string;
  levelId: string;
}

// Main session class that manages session state
export class ExamSession {
  private state: ExamSessionState;
  private listeners: Array<(state: ExamSessionState) => void> = [];
  private timerInterval?: NodeJS.Timeout;

  constructor(options: ExamSessionOptions) {
    // First initialize base state with the passed options
    const { examType, moduleId, levelId } = options;
    
    // Initialize session with default values
    this.state = {
      id: uuidv4(),
      startedAt: new Date(),
      examType,
      moduleId,
      levelId,
      currentQuestionIndex: 0,
      answers: {},
      timeSpent: 0,
      isPaused: false,
      userProgress: {
        partsCompleted: [],
        questionsAnswered: 0,
        questionsCorrect: 0,
        timeRemaining: 0, // Will be set correctly below
      },
    };
    
    // Now that basic state is initialized, we can calculate the total duration
    const totalDuration = this.getTotalDuration();
    
    // Update the timeRemaining with the calculated duration
    if (this.state.userProgress) {
      this.state.userProgress.timeRemaining = totalDuration * 60;
    }

    // Start the timer
    this.startTimer();
    
    // Log session start
    console.log('Session started:', this.state);
  }

  // Get module details for current session
  private getExamModule() {
    return ExamModuleRegistry.getModule(this.state.examType);
  }

  // Get total duration from exam module
  private getTotalDuration(): number {
    const module = this.getExamModule();
    if (!module) return 60; // default 60 min if module not found
    
    const levelConfig = module.getLevelConfig(this.state.levelId, this.state.moduleId);
    if (!levelConfig) return 60;
    
    return levelConfig.details.examStructure.totalDuration;
  }

  // Start timer to track time spent
  private startTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      if (!this.state.isPaused) {
        this.updateState({
          timeSpent: this.state.timeSpent + 1,
          userProgress: {
            ...this.state.userProgress!,
            timeRemaining: Math.max(0, (this.getTotalDuration() * 60) - (this.state.timeSpent + 1))
          }
        });
      }
    }, 1000);
  }

  // Pause the session
  public pause(): void {
    this.updateState({
      isPaused: true,
      pausedAt: new Date()
    });
    console.log('Session paused:', this.state);
  }

  // Resume the session
  public resume(): void {
    this.updateState({
      isPaused: false,
      pausedAt: undefined
    });
    console.log('Session resumed:', this.state);
  }

  // Complete the session
  public complete(finalScore?: number): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.updateState({
      completedAt: new Date(),
      isPaused: true,
      score: finalScore
    });
    
    console.log('Session completed:', this.state);
  }

  // Record an answer
  public recordAnswer(questionId: string, answer: any): void {
    const answers = { ...this.state.answers };
    answers[questionId] = answer;
    
    // Calculate answers count
    const questionsAnswered = Object.keys(answers).length;
    
    this.updateState({
      answers,
      userProgress: {
        ...this.state.userProgress!,
        questionsAnswered,
      }
    });
  }

  // Navigate to a specific question
  public navigateToQuestion(index: number): void {
    if (index >= 0) {
      this.updateState({
        currentQuestionIndex: index
      });
    }
  }

  // Set question data
  public setQuestionData(questions: any[]): void {
    this.updateState({
      questionData: questions
    });
  }

  // Mark a part as completed
  public completeExamPart(partName: string): void {
    if (!this.state.userProgress?.partsCompleted.includes(partName)) {
      this.updateState({
        userProgress: {
          ...this.state.userProgress!,
          partsCompleted: [...this.state.userProgress!.partsCompleted, partName]
        }
      });
    }
  }

  // Update correct questions count
  public updateCorrectCount(count: number): void {
    this.updateState({
      userProgress: {
        ...this.state.userProgress!,
        questionsCorrect: count
      }
    });
  }

  // Get current session state
  public getState(): ExamSessionState {
    return { ...this.state };
  }

  // Update state and notify listeners
  private updateState(updates: Partial<ExamSessionState>): void {
    this.state = {
      ...this.state,
      ...updates
    };
    
    this.notifyListeners();
  }

  // Add a state change listener
  public subscribe(listener: (state: ExamSessionState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state change
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }
}

// Singleton manager to track active sessions
export class SessionManager {
  private static instance: SessionManager;
  private activeSession?: ExamSession;

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Start a new session
  public startSession(options: ExamSessionOptions): ExamSession {
    if (this.activeSession) {
      console.warn('Ending previous session to start a new one');
      this.endSession();
    }
    
    this.activeSession = new ExamSession(options);
    return this.activeSession;
  }

  // Get the active session
  public getActiveSession(): ExamSession | undefined {
    return this.activeSession;
  }

  // End the active session
  public endSession(): void {
    if (this.activeSession) {
      this.activeSession.complete();
      this.activeSession = undefined;
    }
  }
}

// Export the singleton instance
export const sessionManager = SessionManager.getInstance(); 