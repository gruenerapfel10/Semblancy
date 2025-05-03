/**
 * Forgetting Curve Utility
 * 
 * Based on Hermann Ebbinghaus' research on memory retention
 * R = e^(-t/S)
 * Where:
 * - R is retention (as a percentage)
 * - t is time since learning (in days)
 * - S is the "strength" of the memory (which increases with repetition)
 */

import { StudySession } from "../components/types";
import { type StudySessionResult } from "../components/FlashcardContext";

// Forgetting curve implementation based on simplified Ebbinghaus model
// Allows for memory decay visualization and time acceleration for testing

/**
 * DEBUG_CONFIG allows for time acceleration to test spaced repetition
 * without waiting for real time to pass
 */
export const DEBUG_CONFIG = {
  isEnabled: true, // Enable for testing
  timeAcceleration: 24, // 10 days per hour for faster testing
};

// Days thresholds for different urgency levels
export enum UrgencyLevel {
  CRITICAL = 0,  // Red - Urgent review needed (retention below 40%)
  HIGH = 1,      // Red-Purple - High priority (retention 40-60%)
  MEDIUM = 2,    // Purple - Medium priority (retention 60-80%)
  LOW = 3,       // Faded Purple - Low priority (retention 80-90%)
  NONE = 4       // Normal - No review needed yet (retention above 90%)
}

interface ForgettingCurveResult {
  retention: number;          // Memory retention percentage (0-100)
  urgencyLevel: UrgencyLevel; // How urgent it is to review
  daysSinceLastStudy: number; // Days since last review
  strengthFactor: number;     // Current memory strength factor
}

/**
 * Calculate base memory strength based on study history
 * More study sessions and better performance increase strength
 */
const calculateStrengthFactor = (sessions: StudySessionResult[]): number => {
  if (sessions.length === 0) return 1;
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  // Base strength grows with number of sessions (diminishing returns)
  const sessionsBonus = Math.min(Math.log(sessions.length + 1) / Math.log(2), 3);
  
  // Recent performance boost
  const recentPerformance = sortedSessions.slice(0, 3).reduce(
    (sum, session) => sum + (session.score / 100), 0
  ) / Math.min(sortedSessions.length, 3);
  
  // Calculate strength (1-5 range)
  return 1 + sessionsBonus + recentPerformance;
}

/**
 * Calculate retention based on Ebbinghaus' forgetting curve
 * Modeled after: R = e^(-t/S)
 */
export const calculateRetention = (
  lastStudyDate: Date | null, 
  studySessions: StudySessionResult[]
): ForgettingCurveResult => {
  // If never studied, retention is 0
  if (!lastStudyDate) {
    return {
      retention: 0,
      urgencyLevel: UrgencyLevel.CRITICAL,
      daysSinceLastStudy: Infinity,
      strengthFactor: 1
    };
  }
  
  // Calculate days since last study
  const now = new Date();
  const diffTime = now.getTime() - lastStudyDate.getTime();
  let daysSinceLastStudy = diffTime / (1000 * 60 * 60 * 24);
  
  // Apply time acceleration in debug mode
  if (DEBUG_CONFIG.isEnabled) {
    daysSinceLastStudy *= DEBUG_CONFIG.timeAcceleration;
  }
  
  // Calculate memory strength based on study history
  const strengthFactor = calculateStrengthFactor(studySessions);
  
  // Apply Ebbinghaus formula: R = e^(-t/S)
  const retention = Math.exp(-daysSinceLastStudy / strengthFactor) * 100;
  const clampedRetention = Math.max(0, Math.min(100, retention));
  
  // Determine urgency level
  let urgencyLevel: UrgencyLevel;
  if (clampedRetention < 40) {
    urgencyLevel = UrgencyLevel.CRITICAL;
  } else if (clampedRetention < 60) {
    urgencyLevel = UrgencyLevel.HIGH;
  } else if (clampedRetention < 80) {
    urgencyLevel = UrgencyLevel.MEDIUM;
  } else if (clampedRetention < 90) {
    urgencyLevel = UrgencyLevel.LOW;
  } else {
    urgencyLevel = UrgencyLevel.NONE;
  }
  
  return {
    retention: clampedRetention,
    urgencyLevel,
    daysSinceLastStudy,
    strengthFactor
  };
};

/**
 * Get color for library item based on urgency level
 * Returns classes for a subtle left border indicator
 */
export const getUrgencyColor = (urgencyLevel: UrgencyLevel): string => {
  switch (urgencyLevel) {
    case UrgencyLevel.CRITICAL:
      return "border-l-2 border-amber-500/50 pl-[2px]"; // Subtle amber border
    case UrgencyLevel.HIGH:
      return "border-l-2 border-blue-500/40 pl-[2px]"; // Soft blue border
    case UrgencyLevel.MEDIUM:
      return "border-l-2 border-emerald-500/30 pl-[2px]"; // Gentle emerald border
    case UrgencyLevel.LOW:
      return "border-l-2 border-slate-400/25 pl-[2px]"; // Very subtle slate border
    case UrgencyLevel.NONE:
    default:
      return ""; // No border
  }
};

/**
 * Get the last study date for a library
 */
export const getLastStudyDate = (
  libraryId: string, 
  studySessions: StudySessionResult[]
): Date | null => {
  const librarySessions = studySessions.filter(
    session => session.libraryId === libraryId
  );
  
  if (librarySessions.length === 0) return null;
  
  // Find the most recent session
  const sortedSessions = [...librarySessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  return new Date(sortedSessions[0].startTime);
};

/**
 * Get retention data for a library
 */
export const getLibraryRetention = (
  libraryId: string,
  studySessions: StudySessionResult[]
): ForgettingCurveResult => {
  const lastStudyDate = getLastStudyDate(libraryId, studySessions);
  const librarySessions = studySessions.filter(
    session => session.libraryId === libraryId
  );
  
  return calculateRetention(lastStudyDate, librarySessions);
};

/**
 * Calculate memory strength based on time elapsed since last review
 * @param lastReviewTime Date when the card was last reviewed
 * @param difficulty Difficulty rating of the card (1-5, 5 being most difficult)
 * @returns Memory strength as a percentage (0-100%)
 */
export function calculateMemoryStrength(
  lastReviewTime: Date,
  difficulty: number = 3
): number {
  // Calculate real time elapsed
  const now = new Date();
  let elapsedHours = (now.getTime() - lastReviewTime.getTime()) / (1000 * 60 * 60);
  
  // Apply time acceleration if debug mode is enabled
  if (DEBUG_CONFIG.isEnabled) {
    elapsedHours *= DEBUG_CONFIG.timeAcceleration;
  }
  
  // Convert difficulty to decay rate (1 = slow decay, 5 = fast decay)
  // Range between 0.05 (easy cards) to 0.25 (hard cards)
  const decayRate = 0.05 + (difficulty - 1) * 0.05;
  
  // Calculate memory strength using exponential decay formula: e^(-decayRate * time)
  const memoryStrength = Math.exp(-decayRate * elapsedHours) * 100;
  
  // Clamp between 0-100
  return Math.max(0, Math.min(100, memoryStrength));
}

/**
 * Calculate the optimal time for next review based on current memory strength
 * @param currentStrength Current memory strength (0-100%)
 * @param targetStrength Target memory strength before review (typically 70-80%)
 * @param difficulty Difficulty rating of the card (1-5)
 * @returns Date object for optimal next review time
 */
export function calculateNextReviewTime(
  currentStrength: number = 100,
  targetStrength: number = 70,
  difficulty: number = 3
): Date {
  // Don't schedule review if already below target
  if (currentStrength <= targetStrength) {
    return new Date();
  }
  
  // Convert difficulty to decay rate
  const decayRate = 0.05 + (difficulty - 1) * 0.05;
  
  // Calculate hours until memory decays to target strength
  // Solve for t in: targetStrength = currentStrength * e^(-decayRate * t)
  const hoursUntilReview = Math.log(targetStrength / currentStrength) / -decayRate;
  
  // Apply time acceleration if debug mode is enabled
  const adjustedHours = DEBUG_CONFIG.isEnabled
    ? hoursUntilReview / DEBUG_CONFIG.timeAcceleration
    : hoursUntilReview;
  
  // Calculate next review date
  const nextReview = new Date();
  nextReview.setTime(nextReview.getTime() + adjustedHours * 60 * 60 * 1000);
  
  return nextReview;
} 