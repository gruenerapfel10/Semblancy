/**
 * Simplified Flashcard Selection Algorithm
 * 
 * This implementation ensures:
 * 1. Every card is seen at least once before any card is repeated
 * 2. Card selection has randomness
 * 3. After all cards are seen, the process resets
 */

import { Flashcard } from '../components/types';

// Learning stages for cards (simplified but kept for compatibility)
export enum LearningStage {
  NEW = 'new',           // Never seen before
  LEARNING = 'learning', // In the process of learning
  MASTERED = 'mastered'  // Consistently answered correctly
}

// Color codes for stages (kept for UI compatibility)
export const stageColors = {
  [LearningStage.NEW]: 'gray',
  [LearningStage.LEARNING]: 'blue',
  [LearningStage.MASTERED]: 'green',
};

// Track state for each card
export interface CardState {
  card: Flashcard;
  seen: number;             // How many times this card has been seen
  correct: number;          // How many times answered correctly
  incorrect: number;        // How many times answered incorrectly
  lastSeen: number;         // Position in the current study cycle when last shown
  stage: LearningStage;     // Current learning stage (simplified)
  lastSelectionReason: string;  // Explanation for why card was selected
}

export interface SessionState {
  cards: CardState[];
  currentPosition: number;  // Current position in the session
  seenInCurrentCycle: string[]; // IDs of cards seen in current cycle
  selectionHistory: Array<{
    position: number;
    cardId: string;
    stage: LearningStage;
    reason: string;
    grade?: number; // Store the grade given
  }>;
}

/**
 * Initialize a new session state with cards
 */
export function initializeSession(cards: Flashcard[]): SessionState {
  const cardStates: CardState[] = cards.map(card => ({
    card,
    seen: 0,
    correct: 0,
    incorrect: 0,
    lastSeen: -1,           // -1 means never seen
    stage: LearningStage.NEW,
    lastSelectionReason: "New card, not yet seen"
  }));

  return {
    cards: cardStates,
    currentPosition: 0,
    seenInCurrentCycle: [],
    selectionHistory: []
  };
}

/**
 * Determine a card's learning stage based on simple metrics
 */
function determineCardStage(cardState: CardState): LearningStage {
  const { seen, correct, incorrect } = cardState;
  
  // New cards
  if (seen === 0) {
    return LearningStage.NEW;
  }
  
  // Simple mastery criteria: more correct than incorrect and seen multiple times
  if (seen >= 2 && correct > incorrect) {
    return LearningStage.MASTERED;
  } else {
    return LearningStage.LEARNING;
  }
}

/**
 * Update card state based on user's grade (0-5)
 * Grade >= 3 is considered correct, < 3 is incorrect
 */
export function updateCardState(
  sessionState: SessionState,
  cardId: string,
  grade: number // User grade (0-5)
): SessionState {
  const cardIndex = sessionState.cards.findIndex(c => c.card.id === cardId);
  if (cardIndex === -1) return sessionState;

  const cardState = sessionState.cards[cardIndex];
  
  // Update simple performance metrics
  const seen = cardState.seen + 1;
  const correct = grade >= 3 ? cardState.correct + 1 : cardState.correct;
  const incorrect = grade < 3 ? cardState.incorrect + 1 : cardState.incorrect;
  
  // Determine the new stage based on updated state
  const tempUpdatedState = { 
    ...cardState, 
    seen, 
    correct, 
    incorrect
  };
  const newStage = determineCardStage(tempUpdatedState);
  
  // Generate explanation
  const gradeDescriptions: { [key: number]: string } = {
    0: 'Total blackout',
    1: 'Incorrect response',
    2: 'Incorrect, seemed easy',
    3: 'Correct, difficult',
    4: 'Correct, hesitation',
    5: 'Perfect recall'
  };
  let lastSelectionReason = `Card graded ${grade} (${gradeDescriptions[grade] || 'Unknown'}).`;
  if (newStage !== cardState.stage) {
    lastSelectionReason += ` Stage changed from ${cardState.stage} to ${newStage}.`;
  }

  // Create the updated card state
  const updatedCardState: CardState = {
    ...cardState,
    seen,
    correct,
    incorrect,
    stage: newStage,
    lastSeen: sessionState.currentPosition,
    lastSelectionReason
  };

  // Update the card in the session state
  const updatedCards = [...sessionState.cards];
  updatedCards[cardIndex] = updatedCardState;

  // Record in selection history
  const updatedHistory = [
    ...sessionState.selectionHistory,
    {
      position: sessionState.currentPosition,
      cardId: cardId,
      stage: newStage,
      reason: lastSelectionReason,
      grade: grade
    }
  ];

  return {
    ...sessionState,
    cards: updatedCards,
    currentPosition: sessionState.currentPosition + 1,
    seenInCurrentCycle: [...sessionState.seenInCurrentCycle], // Don't modify here, only in pickNextCard
    selectionHistory: updatedHistory
  };
}

/**
 * Pick the next card based on the simplified algorithm
 * 1. If not all cards have been seen in current cycle, pick randomly from unseen
 * 2. If all cards seen, reset cycle and pick randomly from all cards
 * 
 * UPDATED: Now returns a new state object instead of mutating the input state
 */
export function pickNextCard(sessionState: SessionState): { 
  card: Flashcard | null, 
  reason: string,
  newState: SessionState // Added return value for the new state
} {
  const { cards } = sessionState;
  let newSeenInCurrentCycle = [...sessionState.seenInCurrentCycle]; // Create a copy to avoid mutation
  
  // If all cards have been seen in this cycle, reset
  if (newSeenInCurrentCycle.length >= cards.length) {
    // Reset seen cards for the new cycle
    newSeenInCurrentCycle = []; 
    
    // Pick a random card from all cards
    const randomIndex = Math.floor(Math.random() * cards.length);
    const selectedCard = cards[randomIndex];
    
    // Add to seen cards for this cycle
    newSeenInCurrentCycle.push(selectedCard.card.id);
    
    // Return both the card and the new state
    return { 
      card: selectedCard.card, 
      reason: "Starting a new cycle. Random selection from all cards.",
      newState: {
        ...sessionState,
        seenInCurrentCycle: newSeenInCurrentCycle
      }
    };
  }
  
  // Get cards not yet seen in the current cycle
  const unseenCards = cards.filter(card => !newSeenInCurrentCycle.includes(card.card.id));
  
  // If there are unseen cards, pick one randomly
  if (unseenCards.length > 0) {
    const randomIndex = Math.floor(Math.random() * unseenCards.length);
    const selectedCard = unseenCards[randomIndex];
    
    // Add to seen cards for this cycle
    newSeenInCurrentCycle.push(selectedCard.card.id);
    
    // Return both the card and the new state
    return { 
      card: selectedCard.card, 
      reason: `Randomly selected from ${unseenCards.length} unseen cards in current cycle.`,
      newState: {
        ...sessionState,
        seenInCurrentCycle: newSeenInCurrentCycle
      }
    };
  }
  
  // Should not reach here, but just in case
  return { 
    card: null, 
    reason: "Error: No cards available to select.",
    newState: sessionState // Return original state if there's an error
  };
}

/**
 * Get statistics for the current session (simplified)
 */
export function getSessionStats(sessionState: SessionState) {
  const { cards, seenInCurrentCycle } = sessionState;
  
  // Count cards in each stage
  const stageCounts = {
    [LearningStage.NEW]: cards.filter(c => c.stage === LearningStage.NEW).length,
    [LearningStage.LEARNING]: cards.filter(c => c.stage === LearningStage.LEARNING).length,
    [LearningStage.MASTERED]: cards.filter(c => c.stage === LearningStage.MASTERED).length
  };
  
  // Basic stats
  const totalCards = cards.length;
  const seenCards = cards.filter(c => c.seen > 0).length;
  const unseenCards = totalCards - seenCards;
  const masteredCards = stageCounts[LearningStage.MASTERED];
  
  // Calculate completion percentage
  const completionPercentage = totalCards > 0 ? Math.round((seenCards / totalCards) * 100) : 0;
  
  // Current cycle progress
  const currentCycleProgress = totalCards > 0 
    ? Math.round((seenInCurrentCycle.length / totalCards) * 100) 
    : 0;
  
  return {
    totalCards,
    seenCards,
    unseenCards,
    masteredCards,
    stageCounts,
    completion: completionPercentage,
    currentCycleProgress,
    selectionHistory: sessionState.selectionHistory.slice(-10) // Last 10 selections
  };
}

/**
 * Get the distribution of cards by learning stage (simplified)
 */
export function getCardDistribution(sessionState: SessionState) {
  const { cards } = sessionState;
  const totalCards = cards.length;
  
  const distribution = {
    [LearningStage.NEW]: cards.filter(c => c.stage === LearningStage.NEW).length,
    [LearningStage.LEARNING]: cards.filter(c => c.stage === LearningStage.LEARNING).length,
    [LearningStage.MASTERED]: cards.filter(c => c.stage === LearningStage.MASTERED).length
  };
  
  // Convert to percentages
  const percentages = Object.entries(distribution).reduce((acc, [stage, count]) => {
    acc[stage as LearningStage] = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
    return acc;
  }, {} as Record<LearningStage, number>);
  
  return {
    counts: distribution,
    percentages
  };
}

/**
 * Get information about a specific card (simplified)
 */
export function getCardInfo(sessionState: SessionState, cardId: string) {
  const card = sessionState.cards.find(c => c.card.id === cardId);
  if (!card) return null;
  
  const { seen, correct, incorrect, stage, lastSelectionReason } = card;
  const successRate = seen > 0 ? Math.round((correct / seen) * 100) : 0;
  
  return {
    id: cardId,
    seen,
    correct,
    incorrect,
    stage,
    successRate,
    lastSelectionReason: lastSelectionReason || "N/A"
  };
} 