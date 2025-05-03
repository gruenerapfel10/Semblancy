// lib/gameEngine/types/TextInputGame.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import FeedbackDisplay from "@/components/ui/FeedbackDisplay";

/**
 * TextInputGame - Base component for text-input based games
 * Used for games where the user types an answer (e.g., chemical nomenclature)
 */
export default function TextInputGame({
  gameContext,
  questions,
  validateAnswer,
  renderQuestion,
  caseSensitive = false,
  feedbackTimeout = 1500,
  autoFocus = true,
}) {
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);

  const {
    status,
    currentQuestion,
    score,
    startGame,
    submitAnswer,
    completeGame,
    restartGame,
    questionsPerSession,
  } = gameContext;

  // Set up auto-focus when the question changes
  useEffect(() => {
    if (status === "playing" && autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion, status, autoFocus]);

  // Current question object
  const currentQuestionObj = status === "playing" && questions[currentQuestion];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (status !== "playing" || isProcessing || !userInput.trim()) return;

    setIsProcessing(true);

    // Process the answer
    const normalizedInput = caseSensitive
      ? userInput
      : userInput.toLowerCase().trim();
    const result = validateAnswer(normalizedInput, currentQuestionObj);

    // Show feedback
    setFeedback({
      isCorrect: result.isCorrect,
      message: result.feedback || (result.isCorrect ? "Correct!" : "Incorrect"),
      correctAnswer: result.correctAnswer,
    });

    // Record the answer
    submitAnswer(userInput, result.isCorrect, result.points || 1);

    // Clear input after brief delay
    setTimeout(() => {
      setUserInput("");
      setFeedback(null);
      setIsProcessing(false);
    }, feedbackTimeout);
  };

  // Render game UI based on status
  const renderGameContent = () => {
    switch (status) {
      case "ready":
        return (
          <div className="game-ready text-center py-8">
            <h2 className="text-xl font-bold mb-4">Ready to Start</h2>
            <p className="mb-6">
              You'll be given {questionsPerSession} questions. Try to answer
              them correctly!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2 bg-brand-color text-white rounded-md 
                        hover:bg-brand-color-dark transition-all"
            >
              Start Game
            </button>
          </div>
        );

      case "playing":
        return (
          <div className="game-active">
            <div className="game-progress mb-4">
              <div className="flex justify-between items-center">
                <span>
                  Question {currentQuestion + 1} of {questionsPerSession}
                </span>
                <span className="font-semibold">Score: {score.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                <div
                  className="bg-brand-color h-2 rounded-full transition-all"
                  style={{
                    width: `${(currentQuestion / questionsPerSession) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="question-container mb-6">
              {renderQuestion(currentQuestionObj)}
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isProcessing}
                placeholder="Type your answer..."
                className="w-full p-3 border border-gray-300 rounded-md"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isProcessing || !userInput.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 
                          px-4 py-1 bg-brand-color text-white rounded-md
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </form>

            {feedback && (
              <FeedbackDisplay
                isCorrect={feedback.isCorrect}
                message={feedback.message}
                correctAnswer={feedback.correctAnswer}
              />
            )}
          </div>
        );

      case "completed":
        return (
          <div className="game-completed text-center py-8">
            <h2 className="text-2xl font-bold mb-2">Game Completed!</h2>
            <p className="text-xl mb-6">Your final score: {score.toFixed(1)}</p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={restartGame}
                className="px-6 py-2 bg-brand-color text-white rounded-md 
                          hover:bg-brand-color-dark transition-all"
              >
                Play Again
              </button>
              <button
                onClick={() => (window.location.href = "/skills")}
                className="px-6 py-2 border border-gray-300 rounded-md 
                          hover:bg-gray-100 transition-all"
              >
                Back to Skills
              </button>
            </div>
          </div>
        );

      default:
        return <div>Something went wrong.</div>;
    }
  };

  return <div className="text-input-game">{renderGameContent()}</div>;
}
