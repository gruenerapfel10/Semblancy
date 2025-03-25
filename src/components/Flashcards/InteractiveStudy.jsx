import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck, faTimes, faKeyboard, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import styles from './InteractiveStudy.module.css';
import { playSound } from '@/utils/soundManager';

const InteractiveStudy = ({ deck, onBack, onComplete }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    hintsUsed: 0,
    timeSpent: 0
  });
  const [startTime] = useState(Date.now());
  const inputRef = useRef(null);

  const currentCard = deck.cards[currentCardIndex];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentCardIndex]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !showFeedback) {
        checkAnswer();
      } else if (e.key === 'h' && !showFeedback) {
        toggleHint();
      } else if (e.key === 'm') {
        toggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFeedback]);

  const checkAnswer = () => {
    const isAnswerCorrect = userAnswer.toLowerCase().trim() === currentCard.answer.toLowerCase().trim();
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    if (soundEnabled) {
      playSound(isAnswerCorrect ? 'success' : 'error', soundEnabled);
    }

    setSessionStats(prev => ({
      ...prev,
      [isAnswerCorrect ? 'correct' : 'incorrect']: prev[isAnswerCorrect ? 'correct' : 'incorrect'] + 1,
      timeSpent: Math.floor((Date.now() - startTime) / 1000)
    }));
  };

  const nextCard = () => {
    if (currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setShowHint(false);
    } else {
      onComplete(sessionStats);
    }
  };

  const toggleHint = () => {
    if (!showHint) {
      setShowHint(true);
      setSessionStats(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className={styles.progress}>
          <span>Card {currentCardIndex + 1} of {deck.cards.length}</span>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${((currentCardIndex + 1) / deck.cards.length) * 100}%` }}
            />
          </div>
        </div>
        <div className={styles.controls}>
          <button 
            className={styles.controlButton} 
            onClick={toggleSound}
            title="Toggle sound (M)"
          >
            <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} />
          </button>
          <button 
            className={styles.controlButton} 
            onClick={toggleHint}
            disabled={showHint}
            title="Show hint (H)"
          >
            <FontAwesomeIcon icon={faKeyboard} />
          </button>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.question}>
          <h2>{currentCard.question}</h2>
          {showHint && (
            <div className={styles.hint}>
              <p>{currentCard.hint}</p>
            </div>
          )}
        </div>

        <div className={styles.answerSection}>
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer..."
            disabled={showFeedback}
            className={styles.answerInput}
          />
          {!showFeedback && (
            <button 
              className={styles.submitButton}
              onClick={checkAnswer}
            >
              Submit
            </button>
          )}
        </div>

        {showFeedback && (
          <div className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}>
            <div className={styles.feedbackContent}>
              <FontAwesomeIcon icon={isCorrect ? faCheck : faTimes} />
              <p>{isCorrect ? 'Correct!' : 'Incorrect'}</p>
              {!isCorrect && (
                <div className={styles.correctAnswer}>
                  <p>Correct answer: {currentCard.answer}</p>
                </div>
              )}
              <button 
                className={styles.nextButton}
                onClick={nextCard}
              >
                {currentCardIndex === deck.cards.length - 1 ? 'Finish' : 'Next Card'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{sessionStats.correct}</span>
          <span className={styles.statLabel}>Correct</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{sessionStats.incorrect}</span>
          <span className={styles.statLabel}>Incorrect</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{sessionStats.hintsUsed}</span>
          <span className={styles.statLabel}>Hints Used</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{Math.floor(sessionStats.timeSpent / 60)}m {sessionStats.timeSpent % 60}s</span>
          <span className={styles.statLabel}>Time</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveStudy; 