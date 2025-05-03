import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faTimes,
  faCheck,
  faThumbsUp,
  faThumbsDown,
  faPause,
  faPlay,
  faCog,
  faKeyboard,
  faVolumeUp,
  faVolumeMute,
  faSync,
  faQuestion,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import { calculateNextReview } from '@/utils/spacedRepetition';
import styles from './StudyMode.module.css';
import Confetti from 'react-confetti';
import { playSound } from '@/utils/soundManager';

// Performance rating labels (based on SuperMemo algorithm)
const performanceLabels = [
  { rating: 0, label: "Blackout", description: "Complete memory blank", icon: faQuestion, color: "#EA4335" },
  { rating: 1, label: "Incorrect", description: "Wrong answer, but recognized when shown", icon: faThumbsDown, color: "#EA4335" },
  { rating: 2, label: "Almost", description: "Difficult recollection", icon: faThumbsDown, color: "#FBBC05" },
  { rating: 3, label: "Hard", description: "Correct after significant effort", icon: faCheck, color: "#FBBC05" },
  { rating: 4, label: "Good", description: "Correct after some hesitation", icon: faCheck, color: "#34A853" },
  { rating: 5, label: "Perfect", description: "Perfect and effortless recall", icon: faThumbsUp, color: "#4285F4" },
];

export default function StudyMode({ 
  deck, 
  onClose, 
  onUpdateCard, 
  onSaveSession,
  autoAdvance = false
}) {
  // State for flashcard animation and control
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(null);
  
  // Settings and modes
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(5); // seconds
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [keyboardShortcutsVisible, setKeyboardShortcutsVisible] = useState(false);
  
  // Session metrics
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    cardsStudied: 0,
    correctAnswers: 0,
    averageRating: 0,
    totalRatings: 0,
    studyTimeSeconds: 0,
  });
  
  // Confetti celebration for completed deck
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Auto play timer ref
  const autoPlayTimerRef = useRef(null);
  const cardContainerRef = useRef(null);
  
  // Initialize with optimized card sequence
  useEffect(() => {
    if (deck && deck.cards) {
      // In a real app, we'd use the getOptimalReviewCards function from the spaced repetition utility
      // For now, we'll just use the cards from the deck
      setCards(deck.cards);
      setSessionStartTime(new Date());
    }
  }, [deck]);
  
  // Auto-play timer
  useEffect(() => {
    if (autoPlayEnabled && !isFlipped && cards.length > 0) {
      autoPlayTimerRef.current = setTimeout(() => {
        handleFlip();
      }, autoPlaySpeed * 1000);
    }
    
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [autoPlayEnabled, isFlipped, currentCardIndex, cards, autoPlaySpeed]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (keyboardShortcutsVisible) return;
      
      switch (e.key) {
        case ' ':
          handleFlip();
          break;
        case 'ArrowRight':
          if (isFlipped) handleNextCard();
          break;
        case 'ArrowLeft':
          if (isFlipped) handlePrevCard();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (isFlipped) handleRate(parseInt(e.key) - 1);
          break;
        case 'h':
          setShowHints(!showHints);
          break;
        case 'k':
          setKeyboardShortcutsVisible(!keyboardShortcutsVisible);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, showHints, keyboardShortcutsVisible]);
  
  // Handle card flip
  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsFlipped(!isFlipped);
    setIsRevealing(true);
    
    // Play sound using the soundManager
    playSound('card-flip', soundEnabled);
    
    // Stop auto-play when card is flipped
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    
    // If flipping to back and auto-advance is enabled, start timer to go to next card
    if (!isFlipped && autoPlayEnabled) {
      autoPlayTimerRef.current = setTimeout(() => {
        handleNextCard();
      }, 5000); // Wait 5 seconds after showing answer before advancing
    }
  };
  
  // Handle moving to next card
  const handleNextCard = () => {
    if (isAnimating || currentCardIndex >= cards.length - 1) return;
    
    setDirection('right');
    setIsAnimating(true);
    setIsFlipped(false);
    
    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
    }));
    
    setTimeout(() => {
      setCurrentCardIndex(i => i + 1);
      setIsAnimating(false);
    }, 300);
  };
  
  // Handle moving to previous card
  const handlePrevCard = () => {
    if (isAnimating || currentCardIndex <= 0) return;
    
    setDirection('left');
    setIsAnimating(true);
    setIsFlipped(false);
    
    setTimeout(() => {
      setCurrentCardIndex(i => i - 1);
      setIsAnimating(false);
    }, 300);
  };
  
  // Handle rating card (0-5 scale)
  const handleRate = (rating) => {
    // Play sound based on rating using the soundManager
    if (soundEnabled) {
      if (rating >= 3) {
        playSound('success', soundEnabled);
      } else {
        playSound('error', soundEnabled);
      }
    }
    
    // Calculate next review based on spaced repetition algorithm
    const currentCard = cards[currentCardIndex];
    const updatedCard = calculateNextReview(currentCard, rating);
    
    // Update card in state
    const updatedCards = [...cards];
    updatedCards[currentCardIndex] = updatedCard;
    setCards(updatedCards);
    
    // Update session stats
    setSessionStats(prev => {
      const totalRatings = prev.totalRatings + 1;
      const totalScore = prev.averageRating * prev.totalRatings + rating;
      const newAverage = totalScore / totalRatings;
      
      return {
        ...prev,
        totalRatings,
        averageRating: newAverage,
        correctAnswers: rating >= 3 ? prev.correctAnswers + 1 : prev.correctAnswers,
        studyTimeSeconds: Math.floor((new Date() - sessionStartTime) / 1000),
      };
    });
    
    // Send update to parent component
    onUpdateCard(updatedCard);
    
    // Auto advance to next card if enabled
    if (autoAdvance) {
      setTimeout(() => {
        handleNextCard();
      }, 500);
    }
    
    // If we've reached the end of the deck, show confetti
    if (currentCardIndex === cards.length - 1) {
      setShowConfetti(true);
      
      // Save session data
      const sessionData = {
        deckId: deck.id,
        date: new Date().toISOString(),
        cardsStudied: sessionStats.cardsStudied + 1,
        correctAnswers: sessionStats.correctAnswers + (rating >= 3 ? 1 : 0),
        averageRating: (sessionStats.averageRating * sessionStats.totalRatings + rating) / (sessionStats.totalRatings + 1),
        studyTimeSeconds: Math.floor((new Date() - sessionStartTime) / 1000),
        reviewedCards: cards.map(card => ({
          id: card.id,
          performanceRating: card.performanceRating || rating,
          nextReview: card.srs?.nextReview,
        })),
      };
      
      onSaveSession(sessionData);
      
      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  };
  
  // Close the study session
  const handleClose = () => {
    // Calculate study time
    const studyTime = Math.floor((new Date() - sessionStartTime) / 1000);
    
    // Update session stats
    const finalStats = {
      ...sessionStats,
      studyTimeSeconds: studyTime,
    };
    
    // Save session data
    const sessionData = {
      deckId: deck.id,
      date: new Date().toISOString(),
      cardsStudied: finalStats.cardsStudied,
      correctAnswers: finalStats.correctAnswers,
      averageRating: finalStats.averageRating,
      studyTimeSeconds: finalStats.studyTimeSeconds,
      reviewedCards: cards.map(card => ({
        id: card.id,
        performanceRating: card.performanceRating || 0,
        nextReview: card.srs?.nextReview,
      })),
    };
    
    onSaveSession(sessionData);
    onClose();
  };
  
  // Get current card
  const currentCard = cards[currentCardIndex];
  
  // Calculate progress percentage
  const progressPercent = cards.length > 0 
    ? ((currentCardIndex + 1) / cards.length) * 100 
    : 0;
  
  if (!currentCard) {
    return (
      <div className={styles.emptyContainer}>
        <h3>No cards available for study</h3>
        <button className={styles.backButton} onClick={handleClose}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Decks</span>
        </button>
      </div>
    );
  }
  
  return (
    <div className={styles.studyContainer}>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div className={styles.studyHeader}>
        <button className={styles.backButton} onClick={handleClose}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Exit Study Session</span>
        </button>
        
        <div className={styles.studyControls}>
          <button 
            className={styles.controlButton} 
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} />
          </button>
          
          <button 
            className={styles.controlButton} 
            onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
            title={autoPlayEnabled ? "Disable auto-play" : "Enable auto-play"}
          >
            <FontAwesomeIcon icon={autoPlayEnabled ? faPause : faPlay} />
          </button>
          
          <button 
            className={styles.controlButton} 
            onClick={() => setShowSettingsModal(true)}
            title="Settings"
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
          
          <button 
            className={styles.controlButton} 
            onClick={() => setKeyboardShortcutsVisible(true)}
            title="Keyboard shortcuts"
          >
            <FontAwesomeIcon icon={faKeyboard} />
          </button>
        </div>
      </div>
      
      <div className={styles.studyProgress}>
        <div className={styles.progressText}>
          Card {currentCardIndex + 1} of {cards.length}
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      <div 
        ref={cardContainerRef}
        className={styles.cardContainer}
      >
        <div 
          className={`
            ${styles.flashcard} 
            ${isFlipped ? styles.flipped : ''} 
            ${isRevealing ? styles.revealing : ''}
            ${isAnimating ? styles[`slide-${direction}`] : ''}
          `}
          onClick={handleFlip}
        >
          <div className={styles.flashcardInner}>
            <div className={styles.flashcardFront}>
              <div className={styles.cardContent}>
                <h3 className={styles.cardSubject}>{deck.subject}</h3>
                <p className={styles.cardQuestion}>{currentCard.question}</p>
                
                {showHints && currentCard.hint && (
                  <div className={styles.hintContainer}>
                    <p className={styles.hintText}>{currentCard.hint}</p>
                  </div>
                )}
                
                <div className={styles.tapPrompt}>
                  <span>Tap to reveal answer</span>
                </div>
              </div>
              
              {showHints && !currentCard.hint && (
                <button 
                  className={styles.hintButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHints(false);
                  }}
                >
                  No hint available
                </button>
              )}
              
              {!showHints && (
                <button 
                  className={styles.hintButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHints(true);
                  }}
                >
                  Show hint
                </button>
              )}
            </div>
            
            <div className={styles.flashcardBack}>
              <div className={styles.cardContent}>
                <h3 className={styles.cardSubject}>{deck.subject}</h3>
                <p className={styles.cardQuestion}>{currentCard.question}</p>
                <div className={styles.answerDivider} />
                <p className={styles.cardAnswer}>{currentCard.answer}</p>
                
                {currentCard.explanation && (
                  <div className={styles.explanationContainer}>
                    <h4 className={styles.explanationTitle}>Explanation:</h4>
                    <p className={styles.explanationText}>{currentCard.explanation}</p>
                  </div>
                )}
              </div>
              
              <div className={styles.ratingContainer}>
                <p className={styles.ratingPrompt}>How well did you know this?</p>
                <div className={styles.ratingButtons}>
                  {performanceLabels.map(({ rating, label, icon, color }) => (
                    <button
                      key={rating}
                      className={styles.ratingButton}
                      onClick={() => handleRate(rating)}
                      style={{ '--rating-color': color }}
                      title={label}
                    >
                      <FontAwesomeIcon icon={icon} />
                      <span>{rating}</span>
                    </button>
                  ))}
                </div>
                <div className={styles.ratingLabels}>
                  <span>Forgot</span>
                  <span>Perfect</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.navigationControls}>
        <button 
          className={`${styles.navButton} ${currentCardIndex === 0 ? styles.disabled : ''}`}
          onClick={handlePrevCard}
          disabled={currentCardIndex === 0 || isAnimating}
        >
          Previous
        </button>
        
        <button
          className={styles.flipButton}
          onClick={handleFlip}
        >
          <FontAwesomeIcon icon={faSync} />
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        
        <button 
          className={`${styles.navButton} ${styles.nextButton} ${currentCardIndex === cards.length - 1 ? styles.disabled : ''}`}
          onClick={handleNextCard}
          disabled={currentCardIndex === cards.length - 1 || isAnimating}
        >
          Next
        </button>
      </div>
      
      {showSettingsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSettingsModal(false)}>
          <div className={styles.settingsModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Study Settings</h3>
            
            <div className={styles.settingItem}>
              <label htmlFor="autoplay">Auto-play cards</label>
              <div className={styles.toggleSwitch}>
                <input 
                  type="checkbox" 
                  id="autoplay" 
                  checked={autoPlayEnabled}
                  onChange={() => setAutoPlayEnabled(!autoPlayEnabled)}
                />
                <span className={styles.slider}></span>
              </div>
            </div>
            
            {autoPlayEnabled && (
              <div className={styles.settingItem}>
                <label htmlFor="autoplay-speed">Autoplay speed (seconds)</label>
                <input
                  type="range"
                  id="autoplay-speed"
                  min="1"
                  max="10"
                  value={autoPlaySpeed}
                  onChange={(e) => setAutoPlaySpeed(parseInt(e.target.value))}
                  className={styles.slider}
                />
                <span>{autoPlaySpeed}s</span>
              </div>
            )}
            
            <div className={styles.settingItem}>
              <label htmlFor="sound">Sound effects</label>
              <div className={styles.toggleSwitch}>
                <input 
                  type="checkbox" 
                  id="sound" 
                  checked={soundEnabled}
                  onChange={() => setSoundEnabled(!soundEnabled)}
                />
                <span className={styles.slider}></span>
              </div>
            </div>
            
            <div className={styles.settingItem}>
              <label htmlFor="hints">Show hints automatically</label>
              <div className={styles.toggleSwitch}>
                <input 
                  type="checkbox" 
                  id="hints" 
                  checked={showHints}
                  onChange={() => setShowHints(!showHints)}
                />
                <span className={styles.slider}></span>
              </div>
            </div>
            
            <div className={styles.settingItem}>
              <label htmlFor="autoadvance">Auto-advance after rating</label>
              <div className={styles.toggleSwitch}>
                <input 
                  type="checkbox" 
                  id="autoadvance" 
                  checked={autoAdvance}
                  onChange={() => onUpdateSettings({ autoAdvance: !autoAdvance })}
                />
                <span className={styles.slider}></span>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.modalButton}
                onClick={() => setShowSettingsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {keyboardShortcutsVisible && (
        <div className={styles.modalOverlay} onClick={() => setKeyboardShortcutsVisible(false)}>
          <div className={styles.shortcutsModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Keyboard Shortcuts</h3>
            
            <div className={styles.shortcutsList}>
              <div className={styles.shortcutItem}>
                <span className={styles.shortcutKey}>Space</span>
                <span className={styles.shortcutDesc}>Flip card</span>
              </div>
              <div className={styles.shortcutItem}>
                <span className={styles.shortcutKey}>→</span>
                <span className={styles.shortcutDesc}>Next card</span>
              </div>
              <div className={styles.shortcutItem}>
                <span className={styles.shortcutKey}>←</span>
                <span className={styles.shortcutDesc}>Previous card</span>
              </div>
              <div className={styles.shortcutItem}>
                <span className={styles.shortcutKey}>1-5</span>
                <span className={styles.shortcutDesc}>Rate card</span>
              </div>
              <div className={styles.shortcutItem}>
                <span className={styles.shortcutKey}>H</span>
                <span className={styles.shortcutDesc}>Toggle hints</span>
              </div>
              <div className={styles.shortcutItem}>
                <span className={styles.shortcutKey}>K</span>
                <span className={styles.shortcutDesc}>Show keyboard shortcuts</span>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.modalButton}
                onClick={() => setKeyboardShortcutsVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showConfetti && (
        <div className={styles.completionMessage}>
          <h2>Deck Completed! 🎉</h2>
          <p>You've studied all cards in this deck.</p>
          <div className={styles.sessionStats}>
            <div className={styles.sessionStat}>
              <span className={styles.statNumber}>{sessionStats.cardsStudied}</span>
              <span className={styles.statLabel}>Cards Studied</span>
            </div>
            <div className={styles.sessionStat}>
              <span className={styles.statNumber}>{Math.round(sessionStats.averageRating * 100) / 100}</span>
              <span className={styles.statLabel}>Avg. Rating</span>
            </div>
            <div className={styles.sessionStat}>
              <span className={styles.statNumber}>{Math.floor(sessionStats.studyTimeSeconds / 60)}m {sessionStats.studyTimeSeconds % 60}s</span>
              <span className={styles.statLabel}>Study Time</span>
            </div>
          </div>
          <div className={styles.completionActions}>
            <button onClick={handleClose} className={styles.completionButton}>
              Return to Decks
            </button>
            <button onClick={() => {
              setCurrentCardIndex(0);
              setIsFlipped(false);
              setShowConfetti(false);
            }} className={styles.completionButton}>
              <FontAwesomeIcon icon={faRedo} />
              Restart Deck
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 