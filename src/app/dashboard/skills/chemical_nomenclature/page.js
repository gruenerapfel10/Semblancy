"use client"

import React, { useState, useEffect, useRef } from "react";
import styles from "./chemical_nomenclature.module.css";

// Sample database of compounds
const compounds = [
  {
    id: 1,
    skeletalFormula: "CH3-CH2-CH3",
    name: "propane",
    difficulty: "easy",
  },
  {
    id: 2,
    skeletalFormula: "CH3-CH2-OH",
    name: "ethanol",
    difficulty: "easy",
  },
  {
    id: 3,
    skeletalFormula: "CH3-COOH",
    name: "acetic acid",
    difficulty: "medium",
  },
  {
    id: 4,
    skeletalFormula: "C6H6",
    name: "benzene",
    difficulty: "medium",
  },
  {
    id: 5,
    skeletalFormula: "CH3-CO-CH3",
    name: "acetone",
    difficulty: "medium",
  },
  {
    id: 6,
    skeletalFormula: "CH3-CH2-CHO",
    name: "propanal",
    difficulty: "hard",
  },
  {
    id: 7,
    skeletalFormula: "CH3-CH=CH2",
    name: "propene",
    difficulty: "medium",
  },
  {
    id: 8,
    skeletalFormula: "CH3-CH2-CH2-OH",
    name: "1-propanol",
    difficulty: "hard",
  },
  {
    id: 9,
    skeletalFormula: "CH3-CH(OH)-CH3",
    name: "2-propanol",
    difficulty: "hard",
  },
  {
    id: 10,
    skeletalFormula: "CH3-O-CH3",
    name: "dimethyl ether",
    difficulty: "hard",
  },
];

const ChemicalNomenclatureGame = () => {
  // State variables
  const [currentCompound, setCurrentCompound] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState({
    isCorrect: null,
    message: "",
    showCorrectAnswer: false,
  });
  const [stats, setStats] = useState({
    totalAnswered: 0,
    totalCorrect: 0,
    totalWrong: 0,
    averageTime: 0,
    totalTime: 0,
  });
  const [timer, setTimer] = useState(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const timerRef = useRef(null);
  const [usedCompounds, setUsedCompounds] = useState([]);

  // Initialize game
  useEffect(() => {
    if (!currentCompound) {
      getNewCompound();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (currentCompound && !isAnswerSubmitted) {
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentCompound, isAnswerSubmitted]);

  // Get a new compound
  const getNewCompound = () => {
    // Reset states for new question
    setUserAnswer("");
    setFeedback({
      isCorrect: null,
      message: "",
      showCorrectAnswer: false,
    });
    setIsAnswerSubmitted(false);
    setTimer(0);

    // Get available compounds that haven't been used yet
    const availableCompounds = compounds.filter(
      (compound) => !usedCompounds.includes(compound.id)
    );

    // If all compounds have been used, reset the used compounds list
    if (availableCompounds.length === 0) {
      setUsedCompounds([]);
      setCurrentCompound(
        compounds[Math.floor(Math.random() * compounds.length)]
      );
    } else {
      // Select a random compound from available ones
      const randomIndex = Math.floor(Math.random() * availableCompounds.length);
      setCurrentCompound(availableCompounds[randomIndex]);
      setUsedCompounds((prev) => [...prev, availableCompounds[randomIndex].id]);
    }
  };

  // Handle user input change
  const handleInputChange = (e) => {
    setUserAnswer(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isAnswerSubmitted) {
      getNewCompound();
      return;
    }

    // Stop the timer
    clearInterval(timerRef.current);
    setIsAnswerSubmitted(true);

    // Check if answer is correct (case insensitive)
    const isCorrect =
      userAnswer.trim().toLowerCase() === currentCompound.name.toLowerCase();

    // Update feedback
    setFeedback({
      isCorrect,
      message: isCorrect ? "Correct!" : "Incorrect!",
      showCorrectAnswer: !isCorrect,
    });

    // Update stats
    setStats((prevStats) => {
      const newTotalTime = prevStats.totalTime + timer;
      const newTotalAnswered = prevStats.totalAnswered + 1;

      return {
        totalAnswered: newTotalAnswered,
        totalCorrect: prevStats.totalCorrect + (isCorrect ? 1 : 0),
        totalWrong: prevStats.totalWrong + (isCorrect ? 0 : 1),
        averageTime: newTotalTime / newTotalAnswered,
        totalTime: newTotalTime,
      };
    });
  };

  // Format time (seconds) to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  if (!currentCompound) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chemical Nomenclature Game</h1>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total:</span>
            <span className={styles.statValue}>{stats.totalAnswered}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Correct:</span>
            <span className={styles.statValue}>{stats.totalCorrect}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Wrong:</span>
            <span className={styles.statValue}>{stats.totalWrong}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Avg Time:</span>
            <span className={styles.statValue}>
              {formatTime(Math.floor(stats.averageTime))}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.gameContent}>
        <div className={styles.compoundContainer}>
          <div className={styles.formulaDisplay}>
            <h2>Name this compound:</h2>
            <div className={styles.skeletalFormula}>
              {currentCompound.skeletalFormula}
            </div>
          </div>
          <div className={styles.timerContainer}>
            <div className={styles.timer}>{formatTime(timer)}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.answerForm}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={userAnswer}
              onChange={handleInputChange}
              placeholder="Enter compound name..."
              className={styles.answerInput}
              disabled={isAnswerSubmitted}
              autoFocus
            />
            <button type="submit" className={styles.submitButton}>
              {isAnswerSubmitted ? "Next Question" : "Submit"}
            </button>
          </div>
        </form>

        {isAnswerSubmitted && (
          <div
            className={`${styles.feedbackContainer} ${
              feedback.isCorrect
                ? styles.correctFeedback
                : styles.incorrectFeedback
            }`}
          >
            <p className={styles.feedbackMessage}>{feedback.message}</p>
            {feedback.showCorrectAnswer && (
              <p className={styles.correctAnswer}>
                Correct answer: <span>{currentCompound.name}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChemicalNomenclatureGame;
