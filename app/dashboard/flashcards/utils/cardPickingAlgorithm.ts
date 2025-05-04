/**
 * SuperMemo SM-2 Algorithm Implementation
 * 
 * Based on the proven spaced repetition research by Piotr Wozniak:
 * 1. Implements a scientifically validated spaced repetition algorithm
 * 2. Uses the principles of memory stability and retrievability
 * 3. Optimizes learning by showing cards at optimal intervals
 */

import { Flashcard } from '../components/types';

// Learning stages for cards
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
  seen: number;             // How many times this card has been seen
  correct: number;          // How many times answered with grade >= 3
  incorrect: number;        // How many times answered with grade < 3
  lastSeen: number;         // Position in session when last shown
  stage: LearningStage;     // Current learning stage
  efactor: number;          // Easiness factor (from SuperMemo algorithm)
  interval: number;         // Current interval for the card (in positions)
  repetition: number;       // Number of successful repetitions (grade >= 3) in a row
  duePosition: number;      // Position when this card becomes due again
  selectionProbability: number; // Calculated probability for selection
  lastSelectionReason: string;  // Explanation for why card was selected
}

export interface SessionState {
  cards: CardState[];
  currentPosition: number;  // Current position in the session
  recentlyShown: string[];  // IDs of recently shown cards (avoid immediate repetition)
  selectionHistory: Array<{
    position: number;
    cardId: string;
    stage: LearningStage;
    reason: string;
    grade?: number; // Store the grade given
  }>;                       // History of card selections and reasons
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
    efactor: 2.5,           // Initial easiness factor (SuperMemo default)
    interval: 0,            // Will be set after first answer
    repetition: 0,          // Number of consecutive correct answers (grade >= 3)
    duePosition: 0,         // Due immediately (it's new)
    selectionProbability: 0, // Will be calculated before selection
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
 * Considers grade >= 3 as successful recall for stage progression
 */
function determineCardStage(cardState: CardState): LearningStage {
  const { repetition, efactor, seen } = cardState;
  
  // New cards
  if (seen === 0) {
    return LearningStage.NEW;
  }
  
  // Using SuperMemo's concepts:
  // - Cards with repetition >= 2 (meaning at least two consecutive grade >= 3) 
  //   and a good efactor are considered mastered
  // - Others are in the learning phase
  if (repetition >= 2 && efactor >= 2.0) {
    return LearningStage.MASTERED;
  } else {
    return LearningStage.LEARNING;
  }
}

/**
 * Apply the SM-2 algorithm to calculate the next interval based on user grade (0-5)
 * Reference: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 * Reference: https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 */
function calculateSM2Interval(
  cardState: CardState,
  grade: number // User self-assessment grade (0=lowest, 5=highest)
): { interval: number, efactor: number, repetition: number } {
  let { interval, efactor, repetition } = cardState;
  
  // Grade below 3 means the user failed to recall correctly
  if (grade < 3) {
    // Reset repetition count and schedule for review soon
    repetition = 0;
    interval = 1; // Show again in the next position
  } else {
    // Grade 3 or higher means correct recall
    repetition += 1;
    
    // Calculate interval based on repetition count
    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      // Original SM-2 uses 6 days, we adapt to 'positions'
      // Let's use a slightly larger interval than the first repetition
      interval = 3; 
    } else {
      // Subsequent repetitions use the easiness factor
      interval = Math.round(interval * efactor);
    }
  }
  
  // Update easiness factor (EF) based on the grade
  // Formula: EF' = EF + [0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)]
  // where q is the grade (0-5)
  const newEFactor = efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  
  // EF cannot go below 1.3 (minimum easiness)
  efactor = Math.max(1.3, newEFactor);
  
  // For a study session, let's cap the maximum interval to avoid cards disappearing for too long
  const MAX_INTERVAL_POSITIONS = 30; // Max interval in terms of card positions within a session
  interval = Math.min(interval, MAX_INTERVAL_POSITIONS);
  // Ensure interval is at least 1
  interval = Math.max(1, interval); 
  
  return { interval, efactor, repetition };
}

/**
 * Update card state based on user's grade (0-5)
 */
export function updateCardState(
  sessionState: SessionState,
  cardId: string,
  grade: number // User grade (0-5)
): SessionState {
  const cardIndex = sessionState.cards.findIndex(c => c.card.id === cardId);
  if (cardIndex === -1) return sessionState;

  const cardState = sessionState.cards[cardIndex];
  
  // Update performance metrics
  const seen = cardState.seen + 1;
  const correct = grade >= 3 ? cardState.correct + 1 : cardState.correct;
  const incorrect = grade < 3 ? cardState.incorrect + 1 : cardState.incorrect;
  
  // Apply SM-2 algorithm
  const { interval, efactor, repetition } = calculateSM2Interval(cardState, grade);
  
  // Calculate due position
  const duePosition = sessionState.currentPosition + interval;
  
  // Determine the new stage based on updated state
  const tempUpdatedState = { 
    ...cardState, 
    seen, 
    correct, 
    incorrect, 
    interval, 
    efactor, 
    repetition 
  };
  const newStage = determineCardStage(tempUpdatedState);
  
  // Generate explanation for selection history
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
  lastSelectionReason += ` Next review in ${interval} cards (SM-2). EF: ${efactor.toFixed(2)}.`;

  // Create the fully updated card state
  const updatedCardState: CardState = {
    ...cardState,
    seen,
    correct,
    incorrect,
    interval,
    efactor,
    repetition,
    stage: newStage,
    duePosition,
    lastSeen: sessionState.currentPosition,
    lastSelectionReason
  };

  // Update the card in the session state
  const updatedCards = [...sessionState.cards];
  updatedCards[cardIndex] = updatedCardState;

  // Add grade to selection history
  const updatedHistory = [
    ...sessionState.selectionHistory,
    {
      position: sessionState.currentPosition,
      cardId: cardId,
      stage: newStage,
      reason: lastSelectionReason,
      grade: grade // Record the grade given
    }
  ];

  return {
    ...sessionState,
    cards: updatedCards,
    currentPosition: sessionState.currentPosition + 1, // Increment position after processing
    recentlyShown: [
      cardId,
      ...sessionState.recentlyShown.slice(0, Math.min(5, sessionState.cards.length / 3))
    ],
    selectionHistory: updatedHistory
  };
}

/**
 * Calculate selection probabilities for all cards based on SM-2 principles
 * Prioritizes new cards, then due cards, then uses weighted probability
 */
function calculateSelectionProbabilities(
  sessionState: SessionState
): CardState[] {
  const { cards, currentPosition, recentlyShown } = sessionState;
  
  // Prioritization weights for the three stages
  const STAGE_WEIGHTS = {
    [LearningStage.NEW]: 5.0,      // New cards get highest priority
    [LearningStage.LEARNING]: 3.0,  // Learning cards get medium priority
    [LearningStage.MASTERED]: 1.0   // Mastered cards get lowest priority
  };
  
  // Calculate the selection probability for each card
  return cards.map(card => {
    // Base probability starts with the stage weight
    let probability = STAGE_WEIGHTS[card.stage];
    
    // Process new cards
    if (card.stage === LearningStage.NEW) {
      // Small randomization to avoid showing new cards in the exact same order
      probability *= (0.9 + Math.random() * 0.2);
      
      // Reduce probability significantly if recently shown (shouldn't happen often for NEW)
      if (recentlyShown.includes(card.card.id)) {
        probability *= 0.01; 
      }
      
      return {
        ...card,
        selectionProbability: probability,
        lastSelectionReason: card.lastSelectionReason || "New card, ready to be learned."
      };
    }
    
    // Calculate overdue factor for learning and mastered cards
    const dueStatus = currentPosition - card.duePosition;
    
    if (dueStatus >= 0) {
      // Card is due or overdue - higher probability
      // Use an exponential increase for overdue cards, capped
      probability *= (1 + Math.min(5, Math.pow(dueStatus / 5, 1.5))); 
    } else {
      // Card is not yet due - probability decreases exponentially
      const dueDelta = Math.abs(dueStatus);
      // Steeper decay for non-due cards
      probability *= Math.exp(-dueDelta / 5); 
    }
    
    // Reduce probability significantly for recently shown cards
    if (recentlyShown.includes(card.card.id)) {
      probability *= 0.01; // Drastically reduce probability if shown recently
    }
    
    // Ensure probability is not negative
    probability = Math.max(0, probability);

    return {
      ...card,
      selectionProbability: probability,
      lastSelectionReason: card.lastSelectionReason || `Card is in ${card.stage} stage.` // Default reason if none exists
    };
  });
}

/**
 * Pick the next card to show based on current session state
 * Uses SM-2 principles to prioritize cards
 */
export function pickNextCard(sessionState: SessionState): { card: Flashcard | null, reason: string } {
  // Calculate probabilities for all cards
  let cardsWithProbabilities = calculateSelectionProbabilities(sessionState);

  // Filter out cards with near-zero probability (e.g., recently shown)
  cardsWithProbabilities = cardsWithProbabilities.filter(c => c.selectionProbability > 0.001);

  if (cardsWithProbabilities.length === 0) {
    // This might happen if all cards were recently shown or have very low probability
    // Try recalculating without the recentlyShown constraint as a fallback
    const fallbackSessionState = { ...sessionState, recentlyShown: [] };
    cardsWithProbabilities = calculateSelectionProbabilities(fallbackSessionState)
                               .filter(c => c.selectionProbability > 0.001);
    
    if (cardsWithProbabilities.length === 0) {
      // If still no cards, maybe all cards are mastered and not due?
      // Or the deck is very small.
      return { card: null, reason: "No suitable card found. All cards might be recently seen or mastered and not due." };
    }
  }
  
  // Separate cards by priority: NEW > DUE > OTHERS
  const newCards = cardsWithProbabilities.filter(c => c.stage === LearningStage.NEW);
  const dueCards = cardsWithProbabilities.filter(
    c => c.stage !== LearningStage.NEW && sessionState.currentPosition >= c.duePosition
  );
  const otherCards = cardsWithProbabilities.filter(
    c => c.stage !== LearningStage.NEW && sessionState.currentPosition < c.duePosition
  );

  let chosenCard: CardState | null = null;
  let selectionMethod = "";

  // Strategy: 
  // 1. Prioritize NEW cards (highest probability ones)
  // 2. Prioritize DUE cards (highest probability ones)
  // 3. Use weighted random selection among ALL eligible cards if no NEW/DUE

  if (newCards.length > 0) {
    // Sort NEW cards by probability
    newCards.sort((a, b) => b.selectionProbability - a.selectionProbability);
    chosenCard = newCards[0];
    selectionMethod = "Prioritized NEW card.";
  } else if (dueCards.length > 0) {
    // Sort DUE cards by probability
    dueCards.sort((a, b) => b.selectionProbability - a.selectionProbability);
    chosenCard = dueCards[0];
    const overdueAmount = sessionState.currentPosition - chosenCard.duePosition;
    selectionMethod = `Prioritized DUE card (overdue by ${overdueAmount} positions). Stage: ${chosenCard.stage}.`;
  } else {
    // If no new or due cards, use weighted random selection from all available
    const totalProbability = cardsWithProbabilities.reduce((sum, card) => sum + card.selectionProbability, 0);
    
    if (totalProbability > 0) {
        let randomValue = Math.random() * totalProbability;
        let cumulativeProbability = 0;
        for (const card of cardsWithProbabilities) {
            cumulativeProbability += card.selectionProbability;
            if (randomValue <= cumulativeProbability) {
                chosenCard = card;
                break;
            }
        }
    }

    if (chosenCard) {
      const dueIn = chosenCard.duePosition - sessionState.currentPosition;
      selectionMethod = `Weighted random selection. Stage: ${chosenCard.stage}. Due in ${dueIn} positions.`;
    } else {
      // Fallback if weighted selection somehow fails
      chosenCard = cardsWithProbabilities[Math.floor(Math.random() * cardsWithProbabilities.length)];
      selectionMethod = "Random fallback selection.";
    }
  }

  if (!chosenCard) {
    // Should not happen if cardsWithProbabilities is not empty
     return { card: null, reason: "Failed to select a card." };
  }

  // Update the reason on the chosen card itself for potential display later
  // Note: This might be overwritten by updateCardState later, primarily for history
  chosenCard.lastSelectionReason = selectionMethod; 

  return { card: chosenCard.card, reason: selectionMethod };
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
  
  // Calculate completion percentage based on unique cards seen
  const completionPercentage = totalCards > 0 ? Math.round((seenCards / totalCards) * 100) : 0;
  
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
  
  const { seen, correct, incorrect, stage, interval, efactor, repetition, duePosition, lastSelectionReason } = card;
  const successRate = seen > 0 ? Math.round((correct / seen) * 100) : 0;
  
  return {
    id: cardId,
    seen,
    correct, // Note: based on grade >= 3
    incorrect, // Note: based on grade < 3
    stage,
    successRate, // Overall success rate (grade >= 3)
    interval, // Current interval in positions
    efactor: Math.round(efactor * 100) / 100, // Round to 2 decimal places
    repetition, // Consecutive successful recalls (grade >= 3)
    duePosition,
    timesUntilDue: Math.max(0, duePosition - sessionState.currentPosition),
    lastSelectionReason: lastSelectionReason || "N/A" // Reason for the last *update* or initial state
  };
} 