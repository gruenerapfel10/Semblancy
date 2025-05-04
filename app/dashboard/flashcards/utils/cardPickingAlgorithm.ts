/**
 * Simple Shuffle-Based Card Picker
 * 
 * A basic random card picker that ensures all cards are seen equally:
 * 1. Shuffle cards
 * 2. Show cards one by one
 * 3. After all cards are shown, shuffle and repeat
 */

import { Flashcard } from '../components/types';

// Learning stages are simplified but kept for compatibility
export enum LearningStage {
  NEW = 'new',
  SEEN = 'seen'
}

// Color codes for stages (for UI visual cues)
export const stageColors = {
  [LearningStage.NEW]: 'gray',
  [LearningStage.SEEN]: 'blue',
};

// Simplified card state
export interface CardState {
  card: Flashcard;
  seen: number;          // How many times this card has been seen
  stage: LearningStage;  // Current learning stage
  positionInDeck: number; // Position in the current shuffled deck
}

export interface SessionState {
  cards: CardState[];
  currentPosition: number;  // Current position in the session
  cardsInCurrentRound: number; // Number of cards seen in the current round
  selectionHistory: Array<{
    position: number;
    cardId: string;
    stage: LearningStage;
    reason: string;
  }>;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Initialize a new session state with cards
 */
export function initializeSession(cards: Flashcard[]): SessionState {
  // Create card states
  let cardStates: CardState[] = cards.map(card => ({
    card,
    seen: 0,
    stage: LearningStage.NEW,
    positionInDeck: 0 // Will be set during shuffle
  }));

  // Shuffle and assign positions
  cardStates = shuffleArray(cardStates).map((card, index) => ({
    ...card,
    positionInDeck: index
  }));

  return {
    cards: cardStates,
    currentPosition: 0,
    cardsInCurrentRound: 0,
    selectionHistory: []
  };
}

/**
 * Update card state based on viewing
 * Note: This no longer uses grades, but we keep the parameter for compatibility
 */
export function updateCardState(
  sessionState: SessionState,
  cardId: string,
  grade: number // Not used but kept for compatibility
): SessionState {
  const cardIndex = sessionState.cards.findIndex(c => c.card.id === cardId);
  if (cardIndex === -1) return sessionState;

  const cardState = sessionState.cards[cardIndex];
  
  // Update the card state
  const updatedCardState: CardState = {
    ...cardState,
    seen: cardState.seen + 1,
    stage: LearningStage.SEEN
  };

  // Update the card in the session state
  const updatedCards = [...sessionState.cards];
  updatedCards[cardIndex] = updatedCardState;

  // Update selection history
  const updatedHistory = [
    ...sessionState.selectionHistory,
    {
      position: sessionState.currentPosition,
      cardId: cardId,
      stage: LearningStage.SEEN,
      reason: "Card shown in shuffle order"
    }
  ];

  // Increment cards seen in current round
  const cardsInCurrentRound = sessionState.cardsInCurrentRound + 1;
  
  // Check if we've seen all cards in this round
  const needsShuffle = cardsInCurrentRound >= sessionState.cards.length;
  
  // If all cards have been seen, reshuffle
  let finalCards = updatedCards;
  if (needsShuffle) {
    // Shuffle and reset positions
    finalCards = shuffleArray(updatedCards).map((card, index) => ({
      ...card,
      positionInDeck: index
    }));
  }

  return {
    ...sessionState,
    cards: finalCards,
    currentPosition: sessionState.currentPosition + 1,
    cardsInCurrentRound: needsShuffle ? 0 : cardsInCurrentRound,
    selectionHistory: updatedHistory
  };
}

/**
 * Pick the next card to show based on current session state
 * Simply returns the next card in the shuffled order
 */
export function pickNextCard(sessionState: SessionState): { card: Flashcard | null, reason: string } {
  const { cards, cardsInCurrentRound } = sessionState;
  
  // Find the card with the matching position in the current round
  const nextCard = cards.find(c => c.positionInDeck === cardsInCurrentRound);

  if (!nextCard) {
    return { 
      card: null, 
      reason: "No card found at the current position. The deck might be empty." 
    };
  }

  return { 
    card: nextCard.card, 
    reason: `Card selected at position ${cardsInCurrentRound} in the current shuffled round.` 
  };
}

/**
 * Get detailed statistics for the current session (simplified)
 */
export function getSessionStats(sessionState: SessionState) {
  const { cards, cardsInCurrentRound } = sessionState;
  
  // Count cards in each stage
  const stageCounts = {
    [LearningStage.NEW]: cards.filter(c => c.stage === LearningStage.NEW).length,
    [LearningStage.SEEN]: cards.filter(c => c.stage === LearningStage.SEEN).length
  };
  
  // Performance stats
  const totalCards = cards.length;
  const seenCards = cards.filter(c => c.seen > 0).length;
  const unseenCards = totalCards - seenCards;
  
  // Progress in current round
  const roundProgress = totalCards > 0 ? Math.round((cardsInCurrentRound / totalCards) * 100) : 0;
  
  // Overall progress
  const completionPercentage = totalCards > 0 ? Math.round((seenCards / totalCards) * 100) : 0;
  
  return {
    totalCards,
    seenCards,
    unseenCards,
    stageCounts,
    currentRound: Math.floor(sessionState.currentPosition / totalCards) + 1,
    roundProgress,
    completion: completionPercentage,
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
    [LearningStage.SEEN]: cards.filter(c => c.stage === LearningStage.SEEN).length
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
 * Get detailed information about a specific card (simplified)
 */
export function getCardInfo(sessionState: SessionState, cardId: string) {
  const card = sessionState.cards.find(c => c.card.id === cardId);
  if (!card) return null;
  
  const { seen, stage, positionInDeck } = card;
  
  return {
    id: cardId,
    seen,
    stage,
    positionInDeck,
    roundNumber: Math.floor(seen / sessionState.cards.length) + 1
  };
} 