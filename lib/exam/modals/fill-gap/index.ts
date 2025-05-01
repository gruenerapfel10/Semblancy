import { z } from 'zod';
import { BaseModal, ModalSchemas, ModalPrompts } from '../base';
import { FillGapComponent } from './component';

// Types for fill-in-the-gap
export interface FillGapPrompt {
  text: string;
  gaps: Array<{
    id: number;
    correctAnswers: string[];
    hint?: string;
  }>;
}

export interface FillGapAnswer {
  answers: Array<{
    id: number;
    value: string;
  }>;
}

// Schemas for validation
const schemas: ModalSchemas = {
  config: z.object({
    caseSensitive: z.boolean().default(false),
    allowSynonyms: z.boolean().default(true),
    showHints: z.boolean().default(true),
    maxGaps: z.number().min(1).max(10).default(5),
    minAnswerLength: z.number().min(1).default(1),
    maxAnswerLength: z.number().min(1).default(50)
  }),
  
  prompt: z.object({
    text: z.string(),
    gaps: z.array(z.object({
      id: z.number(),
      correctAnswers: z.array(z.string()),
      hint: z.string().optional()
    }))
  }),

  answer: z.object({
    answers: z.array(z.object({
      id: z.number(),
      value: z.string()
    }))
  })
};

// Prompts for AI generation
const prompts: ModalPrompts = {
  generateQuestion: `Generate a fill-in-the-gap question with the following structure:
    - A coherent text with {maxGaps} gaps
    - Each gap should have clear context
    - Include alternative correct answers where appropriate
    - Optional hints for complex gaps
    - Gaps should test understanding of:
      * Grammar
      * Vocabulary
      * Context
      * Language usage`,

  validateAnswer: `Validate the provided answers considering:
    - Exact matches (case sensitive: {caseSensitive})
    - Acceptable synonyms (if allowSynonyms: true)
    - Common spelling variations
    - Context appropriateness`,

  generateFeedback: `Generate feedback for each gap:
    - Whether the answer was correct
    - Why the correct answer fits
    - Common mistakes if wrong
    - Usage examples for learning`
};

// Fill-in-the-gap modal implementation
export class FillGapModal extends BaseModal<FillGapPrompt, FillGapAnswer> {
  readonly type = 'fill-gap';
  readonly description = 'Complete the text by filling in missing words or phrases';
  readonly schemas = schemas;
  readonly prompts = prompts;
  readonly Component = FillGapComponent;
}

// Export singleton instance
export const fillGapModal = new FillGapModal(); 