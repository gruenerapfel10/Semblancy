// components/ui/FeedbackDisplay.js
"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

export default function FeedbackDisplay({
  isCorrect,
  message,
  correctAnswer = null,
  animationDuration = 400,
}) {
  return (
    <div
      className={`feedback-container mt-4 p-4 rounded-md flex items-center
                  ${
                    isCorrect
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }
                  animate-fade-in`}
      style={{ "--animation-duration": `${animationDuration}ms` }}
    >
      <div className="flex-shrink-0 mr-3">
        <FontAwesomeIcon
          icon={isCorrect ? faCheckCircle : faTimesCircle}
          className={`text-xl ${isCorrect ? "text-green-600" : "text-red-600"}`}
        />
      </div>

      <div className="flex-grow">
        <p
          className={`font-medium ${
            isCorrect ? "text-green-700" : "text-red-700"
          }`}
        >
          {message}
        </p>

        {!isCorrect && correctAnswer && (
          <p className="text-sm mt-1 text-gray-600">
            Correct answer: <span className="font-medium">{correctAnswer}</span>
          </p>
        )}
      </div>
    </div>
  );
}
