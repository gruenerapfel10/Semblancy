/**
 * Spaced Repetition System (SRS) - Based on the SuperMemo SM-2 algorithm and Ebbinghaus' Forgetting Curve
 * This implements advanced algorithmic approaches to optimizing memory retention
 */

// Constants for the SM-2 algorithm
const INITIAL_EASE = 2.5;
const MINIMUM_EASE = 1.3;
const EASE_MODIFIER_HARD = -0.15;
const EASE_MODIFIER_GOOD = 0;
const EASE_MODIFIER_EASY = 0.15;

// Constants for intervals (in days)
const INITIAL_INTERVAL = 1;
const FAIL_INTERVAL = 0.1; // Failing a card means reviewing it in a fraction of a day (a few hours)

/**
 * Calculate the next review date based on SM-2 algorithm
 * @param {Object} card - The flashcard
 * @param {number} performanceRating - Rating from 0 (complete blackout) to 5 (perfect recall)
 * @returns {Object} - Updated card with new SRS parameters
 */
export function calculateNextReview(card, performanceRating) {
  // Clone the card to avoid mutating the original
  const updatedCard = { ...card };
  
  // Initialize SRS data if this is the first review
  if (!updatedCard.srs) {
    updatedCard.srs = {
      interval: INITIAL_INTERVAL,
      ease: INITIAL_EASE,
      consecutiveCorrect: 0,
      lastReview: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      reviews: 0,
    };
  }
  
  const srs = { ...updatedCard.srs };
  srs.reviews++;
  
  // Update based on performance rating
  if (performanceRating < 3) {
    // Failed recall - reset consecutive correct streak and use shorter interval
    srs.consecutiveCorrect = 0;
    srs.interval = FAIL_INTERVAL;
    
    // Decrease ease factor but keep it above minimum
    if (performanceRating <= 1) {
      srs.ease += EASE_MODIFIER_HARD * 2; // Extremely poor recall reduces ease more
    } else {
      srs.ease += EASE_MODIFIER_HARD;
    }
    
    srs.ease = Math.max(srs.ease, MINIMUM_EASE);
  } else {
    // Successful recall
    srs.consecutiveCorrect++;
    
    // Calculate new interval based on current streak
    if (srs.consecutiveCorrect === 1) {
      srs.interval = 1; // First successful recall
    } else if (srs.consecutiveCorrect === 2) {
      srs.interval = 6; // Second successful recall (6 days)
    } else {
      // For subsequent successful recalls, multiply by ease factor
      srs.interval = Math.round(srs.interval * srs.ease);
    }
    
    // Adjust ease based on quality of recall
    if (performanceRating === 3) {
      srs.ease += EASE_MODIFIER_HARD; // Hard recall
    } else if (performanceRating === 4) {
      srs.ease += EASE_MODIFIER_GOOD; // Good recall
    } else {
      srs.ease += EASE_MODIFIER_EASY; // Easy recall
    }
    
    srs.ease = Math.max(srs.ease, MINIMUM_EASE);
  }
  
  // Update review dates
  srs.lastReview = new Date().toISOString();
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + srs.interval);
  srs.nextReview = nextReviewDate.toISOString();
  
  updatedCard.srs = srs;
  return updatedCard;
}

/**
 * Calculate forgetting index as per Ebbinghaus' forgetting curve
 * R = e^(-t/S) where:
 * - R is retention
 * - t is time since learning (in days)
 * - S is strength of memory (adjusted by repeated exposure)
 * @param {number} daysSinceLearning - Days since initially learning
 * @param {number} repetitions - Number of successful repetitions
 * @param {number} difficulty - Card difficulty factor (1-10)
 * @returns {number} - Retention percentage (0-100)
 */
export function calculateRetention(daysSinceLearning, repetitions, difficulty = 5) {
  // Base strength based on repetitions (more repetitions = stronger memory)
  const baseStrength = Math.pow(repetitions + 1, 1.5);
  
  // Adjust strength by difficulty (harder cards need more repetitions)
  const difficultyFactor = 1 - (difficulty - 1) / 18; // Maps 1-10 difficulty to 0.5-0.944
  const memoryStrength = baseStrength * difficultyFactor;
  
  // Calculate retention using forgetting curve formula
  const retention = Math.exp(-daysSinceLearning / memoryStrength) * 100;
  
  return Math.max(0, Math.min(100, retention));
}

/**
 * Choose optimal cards to review based on retention and priority
 * @param {Array} cards - List of all flashcards
 * @param {number} limit - Maximum number of cards to return
 * @returns {Array} - Sorted cards for review
 */
export function getOptimalReviewCards(cards, limit = 20) {
  // Only consider cards due for review
  const now = new Date();
  const dueCards = cards.filter(card => {
    if (!card.srs || !card.srs.nextReview) return true; // Cards without SRS data are due
    return new Date(card.srs.nextReview) <= now;
  });
  
  if (dueCards.length === 0) return [];
  
  // Calculate priority score for each card
  const scoredCards = dueCards.map(card => {
    // Default values for new cards
    let daysSinceReview = 0;
    let retention = 100;
    let overdueFactor = 1;
    
    if (card.srs && card.srs.lastReview) {
      // Calculate days since last review
      const lastReview = new Date(card.srs.lastReview);
      daysSinceReview = (now - lastReview) / (1000 * 60 * 60 * 24);
      
      // Calculate retention based on forgetting curve
      retention = calculateRetention(
        daysSinceReview,
        card.srs.consecutiveCorrect || 0,
        card.difficulty || 5
      );
      
      // Calculate how overdue a card is
      if (card.srs.nextReview) {
        const dueDate = new Date(card.srs.nextReview);
        const overdueByDays = Math.max(0, (now - dueDate) / (1000 * 60 * 60 * 24));
        overdueFactor = 1 + Math.min(1, overdueByDays / 7); // Max 2x priority for cards overdue by 7+ days
      }
    }
    
    // Priority is higher for lower retention and overdue cards
    const priority = (100 - retention) * overdueFactor;
    
    return {
      ...card,
      _calculatedRetention: retention,
      _priority: priority
    };
  });
  
  // Sort by priority (highest first)
  scoredCards.sort((a, b) => b._priority - a._priority);
  
  // Return limited number of cards
  return scoredCards.slice(0, limit);
}

/**
 * Calculate user's mastery level for a deck
 * @param {Array} cards - Cards in the deck
 * @returns {Object} - Mastery statistics
 */
export function calculateMastery(cards) {
  if (!cards || cards.length === 0) {
    return {
      masteryPercentage: 0,
      averageRetention: 0,
      retentionByDay: [],
      masteredCards: 0,
      learningCards: 0,
      newCards: 0,
    };
  }
  
  const now = new Date();
  let totalRetention = 0;
  let masteredCards = 0;
  let learningCards = 0;
  let newCards = 0;
  
  // Map for retention by day (for projection)
  const retentionByDay = {};
  for (let i = 0; i <= 30; i++) {
    retentionByDay[i] = 0;
  }
  
  cards.forEach(card => {
    if (!card.srs) {
      newCards++;
      return;
    }
    
    const daysSinceReview = card.srs.lastReview ? 
      (now - new Date(card.srs.lastReview)) / (1000 * 60 * 60 * 24) : 0;
    
    const retention = calculateRetention(
      daysSinceReview,
      card.srs.consecutiveCorrect || 0,
      card.difficulty || 5
    );
    
    totalRetention += retention;
    
    // Project retention for next 30 days
    for (let day = 0; day <= 30; day++) {
      const projectedRetention = calculateRetention(
        daysSinceReview + day,
        card.srs.consecutiveCorrect || 0,
        card.difficulty || 5
      );
      retentionByDay[day] += projectedRetention;
    }
    
    // Categorize cards based on retention
    if (retention >= 90 && (card.srs.consecutiveCorrect || 0) >= 2) {
      masteredCards++;
    } else if (card.srs.reviews > 0) {
      learningCards++;
    } else {
      newCards++;
    }
  });
  
  // Convert retention by day to average percentages
  for (let day = 0; day <= 30; day++) {
    retentionByDay[day] = retentionByDay[day] / cards.length;
  }
  
  // Format into array for charting
  const retentionByDayArray = Object.entries(retentionByDay).map(([day, value]) => ({
    day: parseInt(day),
    retention: value
  }));
  
  return {
    masteryPercentage: (masteredCards / cards.length) * 100,
    averageRetention: totalRetention / cards.length,
    retentionByDay: retentionByDayArray,
    masteredCards,
    learningCards,
    newCards,
  };
}

/**
 * Calculate the optimal study schedule based on card retention
 * @param {Array} cards - All flashcards
 * @param {number} daysAhead - Number of days to plan ahead
 * @returns {Object} - Study schedule by day
 */
export function generateStudySchedule(cards, daysAhead = 7) {
  const schedule = {};
  
  // Initialize days
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    schedule[dateString] = [];
  }
  
  // Sort cards into days
  cards.forEach(card => {
    if (!card.srs || !card.srs.nextReview) return;
    
    const nextReview = new Date(card.srs.nextReview);
    const dateString = nextReview.toISOString().split('T')[0];
    
    // If this date is within our range, add the card
    if (schedule[dateString]) {
      schedule[dateString].push(card.id);
    }
  });
  
  // Convert to array format with due counts
  const scheduleArray = Object.entries(schedule).map(([date, cardIds]) => ({
    date,
    dueCards: cardIds.length,
    cardIds,
  }));
  
  return scheduleArray;
}

/**
 * Calculate learning progress statistics over time
 * @param {Array} studyHistory - History of study sessions
 * @returns {Object} - Learning statistics for visualization
 */
export function calculateLearningProgress(studyHistory) {
  if (!studyHistory || studyHistory.length === 0) {
    return {
      totalCardsStudied: 0,
      totalStudyTime: 0,
      averageRetentionTrend: [],
      cardsLearnedPerDay: [],
      retentionByDifficulty: [],
    };
  }
  
  // Sort history by date
  studyHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Get unique dates
  const dates = [...new Set(studyHistory.map(item => item.date.split('T')[0]))];
  
  // Initialize return values
  let totalCardsStudied = 0;
  let totalStudyTime = 0;
  const averageRetentionTrend = [];
  const cardsLearnedPerDay = [];
  const retentionByDifficulty = Array(10).fill(0); // For difficulty levels 1-10
  const difficultyCount = Array(10).fill(0);
  
  // Process by date
  dates.forEach(date => {
    const sessionsOnDate = studyHistory.filter(item => item.date.startsWith(date));
    let dailyRetention = 0;
    let cardsOnDay = 0;
    
    sessionsOnDate.forEach(session => {
      totalCardsStudied += session.cardsStudied || 0;
      totalStudyTime += session.studyTimeMinutes || 0;
      cardsOnDay += session.cardsStudied || 0;
      
      // Calculate average retention
      if (session.reviewedCards && session.reviewedCards.length > 0) {
        session.reviewedCards.forEach(card => {
          dailyRetention += card.performanceRating / 5 * 100; // Convert rating to percentage
          
          // Track retention by difficulty
          if (card.difficulty && card.difficulty >= 1 && card.difficulty <= 10) {
            retentionByDifficulty[card.difficulty - 1] += card.performanceRating / 5 * 100;
            difficultyCount[card.difficulty - 1]++;
          }
        });
      }
    });
    
    // Add to trends
    if (cardsOnDay > 0) {
      averageRetentionTrend.push({
        date,
        retention: dailyRetention / cardsOnDay
      });
      
      cardsLearnedPerDay.push({
        date,
        count: cardsOnDay
      });
    }
  });
  
  // Calculate average retention by difficulty
  const formattedRetentionByDifficulty = retentionByDifficulty.map((total, index) => ({
    difficulty: index + 1,
    retention: difficultyCount[index] > 0 ? total / difficultyCount[index] : 0
  }));
  
  return {
    totalCardsStudied,
    totalStudyTime,
    averageRetentionTrend,
    cardsLearnedPerDay,
    retentionByDifficulty: formattedRetentionByDifficulty,
  };
} 