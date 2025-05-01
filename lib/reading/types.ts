import { z } from 'zod'
import { ExamType } from '../exam/config'

// Base interface for all reading exam handlers
export interface ReadingExamHandler {
  getPassagePrompt(examType: ExamType): string;
  getQuestionsPrompt(examType: ExamType, passage: string): string;
  getPassageSchema(): z.ZodObject<any>;
  getQuestionsSchema(): z.ZodObject<any>;
}

// Base types that can be extended by specific exam types
export const basePassageSchema = z.object({
  title: z.string(),
  content: z.string()
})

export const baseQuestionSchema = z.object({
  id: z.number(),
  text: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3)
})

export const baseQuestionsSchema = z.object({
  questions: z.array(baseQuestionSchema).length(3)
})

// Goethe-specific schemas
export const goethePassageSchema = basePassageSchema.extend({
  vocabulary: z.array(z.object({
    word: z.string(),
    definition: z.string()
  })).optional()
})

export const goetheQuestionSchema = baseQuestionSchema.extend({
  context: z.string().optional()
})

export const goetheQuestionsSchema = z.object({
  questions: z.array(goetheQuestionSchema).length(3)
})

// IELTS-specific schemas
export const ieltsPassageSchema = basePassageSchema.extend({
  sections: z.array(z.object({
    heading: z.string().optional(),
    content: z.string()
  })).optional()
})

export const ieltsQuestionSchema = baseQuestionSchema.extend({
  questionType: z.enum(['multiple-choice', 'true-false-notgiven']).optional()
})

export const ieltsQuestionsSchema = z.object({
  questions: z.array(ieltsQuestionSchema).length(3)
}) 