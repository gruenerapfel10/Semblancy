// lib/gameEngine/types/MultipleChoiceGame.js
"use client";

import React, { useState, useEffect } from "react";
import FeedbackDisplay from "@/components/ui/FeedbackDisplay";

/**
 * MultipleChoiceGame - Base component for multiple choice games
 * Used for games with predefined answer choices
 */
export default function MultipleChoiceGame({
  gameContext,
  questions,
  validateAnswer,
  renderQuestion,
  renderOptions,
  feedbackTimeout = 1500,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Current question object
  const currentQuestionObj = status === "playing" && questions[currentQuestion];

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (status !== "playing" || isProcessing) return;
    setSelectedOption(option);
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (status !== "playing" || isProcessing || selectedOption === null) return;

    setIsProcessing(true);

    // Process the answer
    const result = validateAnswer(selectedOption, currentQuestionObj);

    // Show feedback
    setFeedback({
      isCorrect: result.isCorrect,
      message: result.feedback || (result.isCorrect ? "Correct!" : "Incorrect"),
      correctAnswer: result.correctAnswer,
    });

    // Record the answer
    submitAnswer(selectedOption, result.isCorrect, result.points || 1);

    // Clear selection after brief delay
    setTimeout(() => {
      setSelectedOption(null);
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
              You'll be given {questionsPerSession} questions. Select the
              correct answer for each.
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

            <div className="options-container mb-4">
              {renderOptions(
                currentQuestionObj,
                selectedOption,
                handleOptionSelect,
                isProcessing
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isProcessing || selectedOption === null}
                className="px-6 py-2 bg-brand-color text-white rounded-md
                          disabled:opacity-50 disabled:cursor-not-allowed
                          hover:bg-brand-color-dark transition-all"
              >
                Submit Answer
              </button>
            </div>

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

  return <div className="multiple-choice-game">{renderGameContent()}</div>;
}
