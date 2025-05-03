// lib/gameEngine/types/DragDropGame.js
"use client";

import React, { useState, useEffect } from "react";
import FeedbackDisplay from "@/components/ui/FeedbackDisplay";

/**
 * DragDropGame - Base component for drag-and-drop based games
 * Used for matching exercises, ordering sequences, etc.
 */
export default function DragDropGame({
  gameContext,
  questions,
  validateAnswer,
  renderQuestion,
  renderDraggableItems,
  renderDropZones,
  feedbackTimeout = 1500,
}) {
  const [dragState, setDragState] = useState({
    draggedItem: null,
    placedItems: {},
    currentMatches: {},
  });
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

  // Reset drag state when the question changes
  useEffect(() => {
    if (status === "playing") {
      setDragState({
        draggedItem: null,
        placedItems: {},
        currentMatches: {},
      });
    }
  }, [currentQuestion, status]);

  // Handle item drag start
  const handleDragStart = (item) => {
    setDragState({
      ...dragState,
      draggedItem: item,
    });
  };

  // Handle dropping an item in a zone
  const handleDrop = (zoneId) => {
    if (!dragState.draggedItem) return;

    const newPlacedItems = {
      ...dragState.placedItems,
      [zoneId]: dragState.draggedItem,
    };

    const newMatches = {
      ...dragState.currentMatches,
      [zoneId]: dragState.draggedItem.id,
    };

    setDragState({
      ...dragState,
      draggedItem: null,
      placedItems: newPlacedItems,
      currentMatches: newMatches,
    });
  };

  // Check if all required drops have been made
  const isSubmittable = () => {
    if (!currentQuestionObj) return false;

    // The check will depend on the specific game implementation
    // For example, checking if all drop zones have items
    const requiredZones = currentQuestionObj.dropZones || [];
    return requiredZones.every((zone) => dragState.placedItems[zone.id]);
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (status !== "playing" || isProcessing || !isSubmittable()) return;

    setIsProcessing(true);

    // Process the answer using current matches
    const result = validateAnswer(dragState.currentMatches, currentQuestionObj);

    // Show feedback
    setFeedback({
      isCorrect: result.isCorrect,
      message: result.feedback || (result.isCorrect ? "Correct!" : "Incorrect"),
      correctAnswer: result.correctAnswer,
    });

    // Record the answer
    submitAnswer(
      dragState.currentMatches,
      result.isCorrect,
      result.points || 1
    );

    // Clear state after brief delay
    setTimeout(() => {
      setFeedback(null);
      setIsProcessing(false);
    }, feedbackTimeout);
  };

  // Clear a placed item from a zone
  const clearPlacedItem = (zoneId) => {
    if (isProcessing) return;

    const newPlacedItems = { ...dragState.placedItems };
    const newMatches = { ...dragState.currentMatches };

    delete newPlacedItems[zoneId];
    delete newMatches[zoneId];

    setDragState({
      ...dragState,
      placedItems: newPlacedItems,
      currentMatches: newMatches,
    });
  };

  // Render game UI based on status
  const renderGameContent = () => {
    switch (status) {
      case "ready":
        return (
          <div className="game-ready text-center py-8">
            <h2 className="text-xl font-bold mb-4">Ready to Start</h2>
            <p className="mb-6">Drag and drop items to match them correctly.</p>
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

            <div className="game-interaction-area grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="draggable-items-container">
                {renderDraggableItems(
                  currentQuestionObj,
                  dragState,
                  handleDragStart,
                  isProcessing
                )}
              </div>

              <div className="drop-zones-container">
                {renderDropZones(
                  currentQuestionObj,
                  dragState,
                  handleDrop,
                  clearPlacedItem,
                  isProcessing
                )}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !isSubmittable()}
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

  return <div className="drag-drop-game">{renderGameContent()}</div>;
}
