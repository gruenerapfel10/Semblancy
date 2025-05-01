"use client"

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MultipleChoiceQuestionProps {
  id: number;
  text: string;
  context?: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  selectedAnswer: number;
  onAnswerSelect: (questionId: number, answerIndex: number) => void;
  showFeedback?: boolean;
}

export default function MultipleChoiceQuestion({
  id,
  text,
  context,
  options,
  correctAnswer,
  explanation,
  difficulty,
  selectedAnswer,
  onAnswerSelect,
  showFeedback = true
}: MultipleChoiceQuestionProps) {
  const isAnswered = selectedAnswer !== -1;
  const isCorrect = selectedAnswer === correctAnswer;

  useEffect(() => {
    console.log(`Question ${id} - selectedAnswer: ${selectedAnswer}, isAnswered: ${isAnswered}`);
  }, [id, selectedAnswer, isAnswered]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isAnswered && showFeedback && (
            <span className={isCorrect ? "text-green-500" : "text-red-500"}>
              {isCorrect ? <Check size={18} /> : <AlertCircle size={18} />}
            </span>
          )}
          Question {id + 1}
        </CardTitle>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {context && (
          <div className="bg-muted p-3 rounded text-sm mb-4">
            {context}
          </div>
        )}
        
        <RadioGroup
          value={selectedAnswer > -1 ? selectedAnswer.toString() : undefined}
          onValueChange={(value) => onAnswerSelect(id, parseInt(value))}
          disabled={showFeedback && isAnswered}
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={index.toString()}
                id={`q${id}-option${index}`}
                className={isAnswered && showFeedback ? (
                  index === correctAnswer ? "border-green-500" :
                  index === selectedAnswer ? "border-red-500" : ""
                ) : ""}
              />
              <Label
                htmlFor={`q${id}-option${index}`}
                className={isAnswered && showFeedback ? (
                  index === correctAnswer ? "text-green-500" :
                  index === selectedAnswer ? "text-red-500" : ""
                ) : ""}
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {isAnswered && showFeedback && explanation && (
          <Alert className={isCorrect ? "bg-green-50" : "bg-red-50"}>
            <AlertCircle className={isCorrect ? "text-green-500" : "text-red-500"} />
            <AlertTitle>
              {isCorrect ? "Correct!" : "Incorrect!"}
            </AlertTitle>
            <AlertDescription>
              {explanation}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 