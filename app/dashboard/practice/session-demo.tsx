'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SessionController } from './components/session/session-controller';
import { useExamSession } from '@/lib/exam/hooks/useExamSession';
import { ExamModuleRegistry } from '@/lib/exam';
import { generateMockQuestions, MockQuestion } from '@/lib/exam/utils/mock-data';
import { Separator } from '@/components/ui/separator';

export default function SessionDemo() {
  const { startSession, endSession, sessionState, setQuestionData, recordAnswer } = useExamSession();
  const [examType, setExamType] = useState('goethe');
  const [moduleId, setModuleId] = useState('reading');
  const [levelId, setLevelId] = useState('b1');
  const [questionCount, setQuestionCount] = useState(10);
  const [mockQuestions, setMockQuestions] = useState<MockQuestion[]>([]);

  // Get all available exam types
  const examTypes = ExamModuleRegistry.getAllExamTypes();
  
  // Get modules for selected exam type
  const modules = React.useMemo(() => {
    const module = ExamModuleRegistry.getModule(examType);
    return module ? module.getModules() : [];
  }, [examType]);

  // Get levels for selected exam type
  const levels = React.useMemo(() => {
    const module = ExamModuleRegistry.getModule(examType);
    return module ? module.getLevels() : [];
  }, [examType]);

  // Handle starting a new session
  const handleStartSession = () => {
    // Generate mock questions
    const questions = generateMockQuestions(examType, moduleId, levelId, questionCount);
    setMockQuestions(questions);
    
    // Start the session
    startSession({
      examType,
      moduleId,
      levelId
    });
    
    // Set the question data in the session
    setQuestionData(questions);
  };

  // Get the current question
  const currentQuestion = sessionState && mockQuestions.length > 0 
    ? mockQuestions[sessionState.currentQuestionIndex] 
    : null;

  // Handle answering a question
  const handleAnswerQuestion = (answer: string) => {
    if (currentQuestion) {
      recordAnswer(currentQuestion.id, answer);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Session Management Demo</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create New Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Exam Type</label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exam Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Module</label>
                <Select value={moduleId} onValueChange={setModuleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map(module => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Level</label>
                <Select value={levelId} onValueChange={setLevelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Number of Questions</label>
                <Select value={questionCount.toString()} onValueChange={v => setQuestionCount(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Question Count" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20].map(count => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} questions
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleStartSession} className="w-full">
                Start New Session
              </Button>
              
              <Button onClick={endSession} variant="outline" className="w-full">
                End Current Session
              </Button>
            </CardContent>
          </Card>
          
          <div className="mt-4 p-4 border rounded bg-muted/10">
            <h3 className="font-medium mb-2">How to use:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Select an exam type, module, and level</li>
              <li>Choose the number of questions</li>
              <li>Click "Start New Session" to create a session</li>
              <li>Use the session controller to interact with the session</li>
              <li>Answer the questions to see progress tracking</li>
              <li>End the session when finished</li>
            </ol>
            <p className="mt-2 text-sm text-muted-foreground">
              This demo shows how the session management system tracks user progress during an exam.
            </p>
          </div>
        </div>
        
        <div>
          <SessionController />
          
          {currentQuestion && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Current Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded">
                  <p className="font-medium">{currentQuestion.text}</p>
                  <div className="text-sm text-muted-foreground mt-1">
                    {currentQuestion.partName} • {currentQuestion.type} • {currentQuestion.points} points
                  </div>
                </div>
                
                {currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => handleAnswerQuestion(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
                
                {currentQuestion.type === 'fill-in' && (
                  <div>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded" 
                      placeholder="Enter your answer"
                      onChange={e => handleAnswerQuestion(e.target.value)}
                    />
                  </div>
                )}
                
                {currentQuestion.type === 'essay' && (
                  <div>
                    <textarea 
                      className="w-full p-2 border rounded min-h-[100px]" 
                      placeholder="Write your answer here"
                      onChange={e => handleAnswerQuestion(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Session Management Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                <li>Track time spent and remaining</li>
                <li>Monitor question progress</li>
                <li>Pause and resume sessions</li>
                <li>Navigate between questions</li>
                <li>Record answers</li>
                <li>Complete exam parts</li>
                <li>Calculate and record scores</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                The session management system is designed to be modular and extensible.
                It can be used to track any type of user progress through an exam or assessment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 