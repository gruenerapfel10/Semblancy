// lib/gameEngine/ProgressTracker.js
"use client";

import { updateUserProgress } from "../api/progressAPI";

export default class ProgressTracker {
  constructor(skillId, sessionId) {
    this.skillId = skillId;
    this.sessionId = sessionId;
    this.sessionData = {
      startTime: null,
      endTime: null,
      answers: [],
      totalScore: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      masteryLevel: null, // Will be calculated at the end
      averageResponseTime: null,
    };
  }

  recordSessionStart() {
    this.sessionData.startTime = Date.now();

    // You can log session start to analytics here
    console.log(`Session ${this.sessionId} started for skill ${this.skillId}`);

    // Save to local storage for persistence in case of refresh
    this._saveToLocalStorage();

    return true;
  }

  recordAnswer(questionIndex, answer, isCorrect, points) {
    const timestamp = Date.now();
    const answerData = {
      questionIndex,
      answer,
      isCorrect,
      points,
      timestamp,
    };

    this.sessionData.answers.push(answerData);

    if (isCorrect) {
      this.sessionData.correctAnswers++;
      this.sessionData.totalScore += points;
    } else {
      this.sessionData.incorrectAnswers++;
    }

    // Calculate running average response time
    if (this.sessionData.answers.length > 1) {
      const lastTwo = this.sessionData.answers.slice(-2);
      const responseTime = lastTwo[1].timestamp - lastTwo[0].timestamp;

      if (!this.sessionData.averageResponseTime) {
        this.sessionData.averageResponseTime = responseTime;
      } else {
        const count = this.sessionData.answers.length;
        this.sessionData.averageResponseTime =
          (this.sessionData.averageResponseTime * (count - 2) + responseTime) /
          (count - 1);
      }
    }

    // Save latest state
    this._saveToLocalStorage();

    return answerData;
  }

  recordSessionEnd(finalScore) {
    this.sessionData.endTime = Date.now();
    this.sessionData.totalScore = finalScore;

    // Calculate final statistics
    this._calculateMasteryLevel();

    // Save finalized session data
    this._saveToLocalStorage();

    // Report progress to backend API
    this._reportProgress();

    return this.sessionData;
  }

  _calculateMasteryLevel() {
    // Calculate mastery based on correctness percentage and response time
    const totalQuestions =
      this.sessionData.correctAnswers + this.sessionData.incorrectAnswers;
    if (totalQuestions === 0) return;

    const correctPercentage =
      (this.sessionData.correctAnswers / totalQuestions) * 100;

    // Determine grade based on correctness
    if (correctPercentage >= 90) {
      this.sessionData.masteryLevel = "A*";
    } else if (correctPercentage >= 80) {
      this.sessionData.masteryLevel = "A";
    } else if (correctPercentage >= 70) {
      this.sessionData.masteryLevel = "B";
    } else if (correctPercentage >= 60) {
      this.sessionData.masteryLevel = "C";
    } else if (correctPercentage >= 50) {
      this.sessionData.masteryLevel = "D";
    } else if (correctPercentage >= 40) {
      this.sessionData.masteryLevel = "E";
    } else {
      this.sessionData.masteryLevel = "U";
    }
  }

  _saveToLocalStorage() {
    try {
      localStorage.setItem(
        `skill_session_${this.skillId}_${this.sessionId}`,
        JSON.stringify(this.sessionData)
      );
    } catch (error) {
      console.error("Failed to save session data to local storage:", error);
    }
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(
        `skill_session_${this.skillId}_${this.sessionId}`
      );
      if (saved) {
        this.sessionData = JSON.parse(saved);
        return true;
      }
    } catch (error) {
      console.error("Failed to load session data from local storage:", error);
    }
    return false;
  }

  _reportProgress() {
    // Send progress data to backend API
    // This should be replaced with your actual API call to AWS
    updateUserProgress(this.skillId, this.sessionData)
      .then((response) => {
        console.log("Progress updated successfully", response);
      })
      .catch((error) => {
        console.error("Failed to update progress:", error);
        // Store failed updates for retry
        this._queueFailedUpdate();
      });
  }

  _queueFailedUpdate() {
    // Store failed update attempts for later retry
    try {
      const failedUpdates = JSON.parse(
        localStorage.getItem("failed_progress_updates") || "[]"
      );
      failedUpdates.push({
        skillId: this.skillId,
        sessionId: this.sessionId,
        sessionData: this.sessionData,
        timestamp: Date.now(),
      });
      localStorage.setItem(
        "failed_progress_updates",
        JSON.stringify(failedUpdates)
      );
    } catch (error) {
      console.error("Failed to queue update for retry:", error);
    }
  }

  getSessionSummary() {
    return {
      skillId: this.skillId,
      sessionId: this.sessionId,
      startTime: this.sessionData.startTime,
      endTime: this.sessionData.endTime,
      duration: this.sessionData.endTime
        ? this.sessionData.endTime - this.sessionData.startTime
        : null,
      totalQuestions:
        this.sessionData.correctAnswers + this.sessionData.incorrectAnswers,
      correctAnswers: this.sessionData.correctAnswers,
      incorrectAnswers: this.sessionData.incorrectAnswers,
      accuracy: this._calculateAccuracy(),
      averageResponseTime: this.sessionData.averageResponseTime,
      masteryLevel: this.sessionData.masteryLevel,
    };
  }

  _calculateAccuracy() {
    const total =
      this.sessionData.correctAnswers + this.sessionData.incorrectAnswers;
    if (total === 0) return 0;
    return (this.sessionData.correctAnswers / total) * 100;
  }
}
