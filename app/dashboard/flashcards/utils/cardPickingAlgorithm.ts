/**
 * Anki-inspired Card Picking Algorithm
 * 
 * Based on cognitive science principles of learning and memory:
 * 1. Implements spaced repetition within a single session
 * 2. Uses the "testing effect" and "spacing effect" from cognitive psychology
 * 3. Balances between learning and reinforcement 
 */

import { Flashcard } from '../components/types';

// Learning stages for cards - simplified to match Anki's approach
export enum LearningStage {
  NEW = 'new',           // Never seen before
  LEARNING = 'learning', // In the process of learning
  MASTERED = 'mastered'  // Consistently answered correctly
}

// Color codes for stages (for UI visual cues)
export const stageColors = {
  [LearningStage.NEW]: 'gray',
  [LearningStage.LEARNING]: 'blue',
  [LearningStage.MASTERED]: 'green',
};

// Track performance and state for each card
export interface CardState {
  card: Flashcard;
  seen: number;                  // How many times this card has been seen
  correct: number;               // How many times answered correctly
  incorrect: number;             // How many times answered incorrectly
  streak: number;                // Current streak of correct/incorrect answers (positive/negative)
  lastSeen: number;              // Position in sequence when last shown
  stage: LearningStage;          // Current learning stage
  nextReviewInterval: number;    // Positions to wait before showing again
  userPriority: number;          // User adjustment (-1 = see less, 0 = neutral, 1 = see more)
  duePosition: number;           // Position when this card becomes due again
  selectionProbability: number;  // Calculated probability for selection (0-1)
  lastSelectionReason: string;   // Explanation for why card was selected (for transparency)
}

export interface SessionState {
  cards: CardState[];
  currentPosition: number;       // Current position in the session
  recentlyShown: string[];       // IDs of recently shown cards (to avoid immediate repetition)
  selectionHistory: Array<{
    position: number;
    cardId: string;
    stage: LearningStage;
    reason: string;
  }>;                            // History of card selections and reasons
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
    streak: 0,
    lastSeen: -1,              // -1 means never seen
    stage: LearningStage.NEW,
    nextReviewInterval: 0,     // Show immediately (it's new)
    userPriority: 0,           // No user adjustment initially
    duePosition: 0,            // Due immediately (it's new)
    selectionProbability: 0,   // Will be calculated before selection
    lastSelectionReason: "New card, not yet seen"
  }));

  return {
    cards: cardStates,
    currentPosition: 0,
    recentlyShown: [],
    selectionHistory: []
  };
}

/**
 * Update a card's learning stage based on its performance
 */
function determineCardStage(cardState: CardState): LearningStage {
  const { seen, correct, incorrect, streak } = cardState;
  
  // New cards
  if (seen === 0) {
    return LearningStage.NEW;
  }
  
  // Performance calculations
  const successRate = seen > 0 ? correct / seen : 0;
  
  // Simplified stage determination logic
  if (streak >= 3 && successRate >= 0.85) {
    return LearningStage.MASTERED;
  } else {
    return LearningStage.LEARNING;
  }
}

/**
 * Calculate the next review interval based on card performance
 * Implements a simplified version of the Anki algorithm
 */
function calculateNextInterval(cardState: CardState, isCorrect: boolean): number {
  const { stage, seen } = cardState;
  
  // Base intervals for different stages
  const baseIntervals = {
    [LearningStage.NEW]: 1,
    [LearningStage.LEARNING]: 3,
    [LearningStage.MASTERED]: 7
  };
  
  let interval = baseIntervals[stage];
  
  // Adjust for performance
  if (isCorrect) {
    // For correct answers, increase interval based on streak
    const streakFactor = Math.max(1, Math.min(2.5, (cardState.streak + 1) / 2));
    interval = Math.round(interval * streakFactor);
  } else {
    // For incorrect answers, reduce interval and reset to learning
    interval = 1;
  }
  
  // Add some randomness (±10%) to prevent cards from clustering
  const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
  interval = Math.max(1, Math.round(interval * randomFactor));
  
  return interval;
}

/**
 * Update card state based on user's answer
 */
export function updateCardState(
  sessionState: SessionState,
  cardId: string,
  isCorrect: boolean
): SessionState {
  const card = sessionState.cards.find(c => c.card.id === cardId);
  if (!card) return sessionState;
  
  const updatedCards = sessionState.cards.map(cardState => {
    if (cardState.card.id === cardId) {
      // Update performance metrics
      const seen = cardState.seen + 1;
      const correct = isCorrect ? cardState.correct + 1 : cardState.correct;
      const incorrect = isCorrect ? cardState.incorrect : cardState.incorrect + 1;
      
      // Update streak (positive for correct, negative for incorrect)
      let streak = cardState.streak;
      if (isCorrect) {
        streak = streak < 0 ? 1 : streak + 1;
      } else {
        streak = streak > 0 ? -1 : streak - 1;
      }
      
      // Determine new stage
      const updatedState = {
        ...cardState,
        seen,
        correct,
        incorrect,
        streak,
        lastSeen: sessionState.currentPosition
      };
      
      // If incorrect, always drop back to learning stage
      let newStage = determineCardStage(updatedState);
      if (!isCorrect && newStage === LearningStage.MASTERED) {
        newStage = LearningStage.LEARNING;
      }
      
      // Calculate next review interval
      const nextReviewInterval = calculateNextInterval(
        { ...updatedState, stage: newStage }, 
        isCorrect
      );
      
      // Calculate due position
      const duePosition = sessionState.currentPosition + nextReviewInterval;
      
      // Generate explanation
      let lastSelectionReason = `Card was answered ${isCorrect ? 'correctly' : 'incorrectly'}.`;
      if (newStage !== cardState.stage) {
        lastSelectionReason += ` Stage changed from ${cardState.stage} to ${newStage}.`;
      }
      lastSelectionReason += ` Next review in ${nextReviewInterval} cards.`;
      
      return {
        ...updatedState,
        stage: newStage,
        nextReviewInterval,
        duePosition,
        lastSelectionReason
      };
    }
    return cardState;
  });

  return {
    ...sessionState,
    cards: updatedCards,
    currentPosition: sessionState.currentPosition + 1,
    recentlyShown: [
      cardId,
      ...sessionState.recentlyShown.slice(0, Math.min(5, sessionState.cards.length / 3))
    ]
  };
}

/**
 * Adjust user priority for a card (see more/less)
 */
export function adjustCardWeight(
  sessionState: SessionState,
  cardId: string,
  adjustment: -1 | 0 | 1
): SessionState {
  const updatedCards = sessionState.cards.map(cardState => {
    if (cardState.card.id === cardId) {
      // Limit priority to range -1 to 1
      const newPriority = Math.max(-1, Math.min(1, cardState.userPriority + adjustment));
      
      // Adjust due position based on priority
      let duePosition = cardState.duePosition;
      
      if (adjustment > 0) {
        // See more: make card due sooner
        duePosition = Math.max(sessionState.currentPosition, duePosition - 2);
      } else if (adjustment < 0) {
        // See less: delay card
        duePosition = duePosition + 3;
      }
      
      const reason = adjustment > 0 
        ? "User requested to see this card more often" 
        : "User requested to see this card less often";
      
      return {
        ...cardState,
        userPriority: newPriority,
        duePosition,
        lastSelectionReason: reason
      };
    }
    return cardState;
  });

  return {
    ...sessionState,
    cards: updatedCards
  };
}

/**
 * Calculate selection probabilities for all cards
 */
function calculateSelectionProbabilities(
  sessionState: SessionState
): CardState[] {
  const { cards, currentPosition, recentlyShown } = sessionState;
  
  // Factors that influence card selection
  const STAGE_WEIGHTS = {
    [LearningStage.NEW]: 3.0,        // High priority for unseen cards
    [LearningStage.LEARNING]: 2.0,    // Medium-high priority
    [LearningStage.MASTERED]: 0.5     // Low priority but still shown occasionally
  };
  
  const DUE_IMPORTANCE = 2.0;         // Weight for cards that are due
  const USER_PRIORITY_FACTOR = 0.75;  // How much user preference influences selection
  
  return cards.map(card => {
    // Start with base weight based on learning stage
    let probability = STAGE_WEIGHTS[card.stage];
    
    // Adjust for due status
    if (currentPosition >= card.duePosition) {
      probability *= DUE_IMPORTANCE;
    } else {
      // Reduce probability for cards that are not due yet
      const dueDelta = card.duePosition - currentPosition;
      probability *= Math.max(0.1, 1 - (dueDelta * 0.1));
    }
    
    // Apply user priority adjustment
    probability *= (1 + (card.userPriority * USER_PRIORITY_FACTOR));
    
    // Reduce probability for recently shown cards
    if (recentlyShown.includes(card.card.id)) {
      probability *= 0.1;
    }
    
    // Cards not yet seen get highest priority
    if (card.stage === LearningStage.NEW) {
      probability = Math.max(probability, 3.0);
    }
    
    return {
      ...card,
      selectionProbability: probability
    };
  });
}

/**
 * Pick the next card to show based on current session state
 */
export function pickNextCard(sessionState: SessionState): { card: Flashcard, reason: string } {
  // Calculate probabilities for all cards
  const cardsWithProbabilities = calculateSelectionProbabilities(sessionState);
  
  // Get unseen cards first
  const unseenCards = cardsWithProbabilities.filter(c => c.stage === LearningStage.NEW);
  if (unseenCards.length > 0) {
    const card = unseenCards[Math.floor(Math.random() * unseenCards.length)];
    const reason = "New card, haven't been seen yet";
    
    // Update session history
    const updatedHistory = [
      ...sessionState.selectionHistory,
      { position: sessionState.currentPosition, cardId: card.card.id, stage: card.stage, reason }
    ];
    
    // Update session state
    sessionState.selectionHistory = updatedHistory;
    
    return { card: card.card, reason };
  }
  
  // Get due cards
  const dueCards = cardsWithProbabilities.filter(
    c => sessionState.currentPosition >= c.duePosition
  );
  
  // If we have due cards, prioritize them
  if (dueCards.length > 0 && Math.random() < 0.8) { // 80% chance to pick due cards
    // Sort by probability
    dueCards.sort((a, b) => b.selectionProbability - a.selectionProbability);
    
    // Pick from top 3 with some randomness
    const topN = Math.min(3, dueCards.length);
    const selectedIndex = Math.floor(Math.random() * topN);
    const card = dueCards[selectedIndex];
    
    let reason = `Card is due for review. Stage: ${card.stage}.`;
    if (card.userPriority !== 0) {
      reason += ` User priority: ${card.userPriority > 0 ? 'high' : 'low'}.`;
    }
    
    // Update session history
    const updatedHistory = [
      ...sessionState.selectionHistory,
      { position: sessionState.currentPosition, cardId: card.card.id, stage: card.stage, reason }
    ];
    
    // Update session state
    sessionState.selectionHistory = updatedHistory;
    
    return { card: card.card, reason };
  }
  
  // Weighted random selection based on calculated probabilities
  const totalProbability = cardsWithProbabilities.reduce(
    (sum, card) => sum + card.selectionProbability, 0
  );
  
  let randomValue = Math.random() * totalProbability;
  let cumulativeProbability = 0;
  
  for (const card of cardsWithProbabilities) {
    cumulativeProbability += card.selectionProbability;
    if (randomValue <= cumulativeProbability) {
      let reason = `Selected based on learning stage (${card.stage}) and timing.`;
      if (card.userPriority !== 0) {
        reason += ` User priority: ${card.userPriority > 0 ? 'high' : 'low'}.`;
      }
      
      // Update session history
      const updatedHistory = [
        ...sessionState.selectionHistory,
        { position: sessionState.currentPosition, cardId: card.card.id, stage: card.stage, reason }
      ];
      
      // Update session state
      sessionState.selectionHistory = updatedHistory;
      
      return { card: card.card, reason };
    }
  }
  
  // Fallback (should rarely happen)
  const randomCard = cardsWithProbabilities[
    Math.floor(Math.random() * cardsWithProbabilities.length)
  ];
  const reason = "Random selection (fallback logic)";
  
  // Update session history
  const updatedHistory = [
    ...sessionState.selectionHistory,
    { position: sessionState.currentPosition, cardId: randomCard.card.id, stage: randomCard.stage, reason }
  ];
  
  // Update session state
  sessionState.selectionHistory = updatedHistory;
  
  return { card: randomCard.card, reason };
}

/**
 * Get detailed statistics for the current session
 */
export function getSessionStats(sessionState: SessionState) {
  const { cards } = sessionState;
  
  // Count cards in each stage
  const stageCounts = {
    [LearningStage.NEW]: cards.filter(c => c.stage === LearningStage.NEW).length,
    [LearningStage.LEARNING]: cards.filter(c => c.stage === LearningStage.LEARNING).length,
    [LearningStage.MASTERED]: cards.filter(c => c.stage === LearningStage.MASTERED).length
  };
  
  // Performance stats
  const totalCards = cards.length;
  const seenCards = cards.filter(c => c.seen > 0).length;
  const unseenCards = totalCards - seenCards;
  const masteredCards = stageCounts[LearningStage.MASTERED];
  
  // Calculate completion percentage
  const completionPercentage = Math.round((seenCards / totalCards) * 100);
  
  return {
    totalCards,
    seenCards,
    unseenCards,
    masteredCards,
    stageCounts,
    completion: completionPercentage,
    selectionHistory: sessionState.selectionHistory.slice(-10) // Last 10 selections
  };
}

/**
 * Get the distribution of cards by learning stage
 * Used for visualization purposes
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
 * Get detailed information about a specific card
 * Used for tooltips and explanations
 */
export function getCardInfo(sessionState: SessionState, cardId: string) {
  const card = sessionState.cards.find(c => c.card.id === cardId);
  if (!card) return null;
  
  const { seen, correct, incorrect, streak, stage, nextReviewInterval, userPriority, duePosition } = card;
  const successRate = seen > 0 ? Math.round((correct / seen) * 100) : 0;
  
  return {
    id: cardId,
    seen,
    correct,
    incorrect,
    streak,
    stage,
    successRate,
    nextReviewInterval,
    userPriority,
    duePosition,
    timesUntilDue: Math.max(0, duePosition - sessionState.currentPosition),
    lastSelectionReason: card.lastSelectionReason
  };
} 