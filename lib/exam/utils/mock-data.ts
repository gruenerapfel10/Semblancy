/**
 * Mock data generation utilities for testing the session system
 */

// Sample question types
export type QuestionType = 'multiple-choice' | 'true-false' | 'matching' | 'fill-in' | 'essay';

// Sample question structure
export interface MockQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  partName: string;
}

/**
 * Generates a set of mock questions for a given exam configuration
 */
export function generateMockQuestions(
  examType: string,
  moduleId: string,
  levelId: string,
  count: number = 20
): MockQuestion[] {
  const questions: MockQuestion[] = [];
  const parts = ['Part 1', 'Part 2', 'Part 3'];
  const questionTypes: QuestionType[] = ['multiple-choice', 'true-false', 'matching', 'fill-in', 'essay'];
  
  // Generate questions based on exam type and module
  for (let i = 0; i < count; i++) {
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const partName = parts[Math.floor(Math.random() * parts.length)];
    
    // Create the base question
    const question: MockQuestion = {
      id: `q-${examType}-${moduleId}-${i + 1}`,
      text: generateQuestionText(examType, moduleId, i + 1),
      type: questionType,
      points: Math.floor(Math.random() * 5) + 1,
      partName
    };
    
    // Add type-specific properties
    switch (questionType) {
      case 'multiple-choice':
        question.options = generateOptions(4);
        question.correctAnswer = question.options[Math.floor(Math.random() * question.options.length)];
        break;
      case 'true-false':
        question.options = ['True', 'False'];
        question.correctAnswer = Math.random() > 0.5 ? 'True' : 'False';
        break;
      case 'matching':
        question.options = generateOptions(4);
        question.correctAnswer = [...question.options].sort(() => Math.random() - 0.5);
        break;
      case 'fill-in':
        question.correctAnswer = generateWord();
        break;
      case 'essay':
        // No correct answer for essays
        break;
    }
    
    // Add explanation for some questions
    if (Math.random() > 0.3) {
      question.explanation = `Explanation for question ${i + 1}. This explains why the answer is correct.`;
    }
    
    questions.push(question);
  }
  
  return questions;
}

/**
 * Generate a question text based on exam type and module
 */
function generateQuestionText(examType: string, moduleId: string, index: number): string {
  const moduleText = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
  
  const questionStarters = [
    `${moduleText} question ${index}: `,
    `Question ${index}: `,
    `${examType.toUpperCase()} ${moduleText} Task ${index}: `
  ];
  
  const questionContents = {
    reading: [
      'What is the main idea of the passage?',
      'According to the text, what is the author\'s opinion about...?',
      'Which of the following best summarizes the third paragraph?',
      'What can be inferred from the passage about...?'
    ],
    writing: [
      'Write a paragraph explaining your view on...',
      'Compose an essay discussing the advantages and disadvantages of...',
      'Describe a situation where you had to...',
      'Compare and contrast the following ideas:'
    ],
    listening: [
      'What is the main topic of the conversation?',
      'What does the speaker imply about...?',
      'What will the man probably do next?',
      'What is the woman\'s attitude toward...?'
    ],
    speaking: [
      'Describe a place you have visited that made an impression on you.',
      'Talk about a person who has influenced you significantly.',
      'Explain your opinion on the following statement:',
      'Discuss the advantages and disadvantages of...'
    ]
  };
  
  const starter = questionStarters[Math.floor(Math.random() * questionStarters.length)];
  const content = moduleId in questionContents 
    ? questionContents[moduleId as keyof typeof questionContents][Math.floor(Math.random() * questionContents[moduleId as keyof typeof questionContents].length)]
    : 'Sample question content';
  
  return starter + content;
}

/**
 * Generate a set of random options
 */
function generateOptions(count: number): string[] {
  const options = [];
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  for (let i = 0; i < count; i++) {
    options.push(`Option ${letters[i]}: ${generatePhrase()}`);
  }
  
  return options;
}

/**
 * Generate a random word
 */
function generateWord(): string {
  const words = [
    'language', 'communication', 'fluency', 'vocabulary', 'grammar',
    'syntax', 'pronunciation', 'idiom', 'phrase', 'expression',
    'meaning', 'context', 'understanding', 'speaking', 'listening',
    'reading', 'writing', 'translation', 'interpretation', 'comprehension'
  ];
  
  return words[Math.floor(Math.random() * words.length)];
}

/**
 * Generate a random phrase
 */
function generatePhrase(): string {
  const phrases = [
    'The importance of language learning',
    'Communication across cultures',
    'Understanding different viewpoints',
    'Developing critical thinking skills',
    'Expressing ideas clearly and concisely',
    'Building vocabulary through reading',
    'Improving grammar through practice',
    'Learning idiomatic expressions',
    'Mastering pronunciation patterns',
    'Enhancing writing skills'
  ];
  
  return phrases[Math.floor(Math.random() * phrases.length)];
} 