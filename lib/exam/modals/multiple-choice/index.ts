import { z } from 'zod';
import { BaseModal, ModalSchemas, ModalPrompts } from '../base';
import { MultipleChoiceComponent } from './component';

// Types for multiple choice
export interface MultipleChoicePrompt {
  question: string;
  options: string[];
  correctAnswers: number[];
}

export interface MultipleChoiceAnswer {
  selectedAnswers: number[];
}

// Schemas for validation
const schemas: ModalSchemas = {
  config: z.object({
    maxOptions: z.number().min(2).max(10).default(4),
    allowMultipleCorrect: z.boolean().default(false),
    shuffleOptions: z.boolean().default(true)
  }),
  
  prompt: z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswers: z.array(z.number())
  }),

  answer: z.object({
    selectedAnswers: z.array(z.number())
  })
};

// Prompts for AI generation
const prompts: ModalPrompts = {
  generateQuestion: `Generate a multiple choice question with the following structure:
    - A clear, concise question
    - {maxOptions} options where exactly {numCorrect} is correct
    - Options should be distinct and relevant to the question
    - Question should test understanding, not just memorization`,

  validateAnswer: `Validate if the selected answers match the correct answers.
    Consider:
    - Exact match required for single answer questions
    - All correct answers must be selected for multiple answer questions
    - No incorrect answers should be selected`,

  generateFeedback: `Generate feedback for the answer, including:
    - Whether the answer was correct
    - Explanation of why the correct answer is correct
    - Common misconceptions if an incorrect answer was chosen`
};

// Multiple choice modal implementation
export class MultipleChoiceModal extends BaseModal<MultipleChoicePrompt, MultipleChoiceAnswer> {
  readonly type = 'multiple-choice';
  readonly description = 'Select one or more correct answers from a list of options';
  readonly schemas = schemas;
  readonly prompts = prompts;
  readonly Component = MultipleChoiceComponent;
}

// Export singleton instance
export const multipleChoiceModal = new MultipleChoiceModal(); 