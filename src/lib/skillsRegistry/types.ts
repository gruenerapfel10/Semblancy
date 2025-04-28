import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { z } from 'zod';

/**
 * Core question types used across all modules
 */
export type QuestionType = "multiple_choice" | "calculation" | "matching" | "ordering" | "fill_blank";

/**
 * Base question interface that all questions must implement
 */
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  timeLimit?: number; // Time limit in seconds, optional
}

/**
 * Multiple choice question implementation
 */
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  question: string;
  subtitle?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

/**
 * Calculation question implementation
 */
export interface CalculationQuestion extends BaseQuestion {
  type: "calculation";
  question: string;
  subtitle?: string;
  steps: string[];
  answer: string;
  explanation?: string;
  acceptableVariations?: string[]; // For different formats of correct answers
}

/**
 * Union type of all possible question types
 */
export type Question = MultipleChoiceQuestion | CalculationQuestion;

/**
 * Represents a specific topic or lesson *within* a Module.
 * Each submodule defines the exact prompt and schema for generating questions related to it.
 */
export interface Submodule {
  id: string;
  title: string;
  description?: string; // Optional description for the specific subtopic
  order: number; // Order within the module
  questionSchema: z.ZodType<any, any>; // Zod schema for this subtopic's questions
  generationPrompt: string; // Specific prompt for this subtopic
}

/**
 * Represents a larger learning module within a skill, now containing submodules.
 * Can provide overall context for generation if needed.
 */
export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  submodules: Submodule[]; // Module now contains an array of Submodules
  // REMOVED: questionSchema and generationPrompt from Module
  // OPTIONAL: Add a context prompt for the whole module if desired
  // moduleContextPrompt?: string; 
}

/**
 * Skill Category (e.g., Maths, Physics)
 */
export interface SkillCategory {
  id: string;
  name: string;
  icon: IconDefinition;
  description?: string;
  color?: string;
}

/**
 * Exam board interface
 */
export interface ExamBoard {
  id: string;
  name: string;
  country?: string;
  level?: string;
}

/**
 * Main Skill interface
 */
export interface Skill {
  id: string;
  number: string;
  title: string;
  description: string;
  category: string;
  examBoard: string[];
  topics: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "locked" | "available" | "attempted" | "completed";
  prerequisites?: string[];
  modules: Module[]; // This now uses the Module interface containing Submodules
  icon?: IconDefinition;
}

/**
 * Progress tracking for a user on a specific module
 */
export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  score: number;
  maxScore: number;
  attempts: number;
  lastAttemptDate?: Date;
  answeredQuestions: {
    questionId: string;
    correct: boolean;
    attempts: number;
  }[];
}

/**
 * Progress tracking for a user on a specific skill
 */
export interface SkillProgress {
  skillId: string;
  status: "locked" | "available" | "attempted" | "completed";
  startedDate?: Date;
  completedDate?: Date;
  stars: number;
  maxStars: number;
  moduleProgress: Record<string, ModuleProgress>; // Key is moduleId
}

/**
 * Registry metadata
 */
export interface RegistryMetadata {
  version: string;
  lastUpdated: string;
  categories: SkillCategory[];
  examBoards: ExamBoard[];
}

// ========================================
// Zod Schemas for Validation & Generation
// ========================================

// Zod schema for BaseQuestion properties
export const BaseQuestionSchema = z.object({
  // Keep ID optional during generation, can be added later if needed
  id: z.string().optional().describe("Unique identifier for the question (can be generated later)."), 
  type: z.enum(['multiple_choice', 'calculation']).describe("The type of the question."),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe("Difficulty level of the question."),
  points: z.number().int().positive().describe("Points awarded for a correct answer."),
  question: z.string().min(10).describe("The main text of the question being asked."),
  explanation: z.string().optional().describe("Optional explanation shown after answering.")
});

// Zod schema for MultipleChoiceQuestion
export const MultipleChoiceQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('multiple_choice'),
  options: z.array(z.string().min(1))
    .min(2, "Must provide at least 2 options.")
    .max(5, "Cannot provide more than 5 options.")
    .describe("An array of possible answer strings, including the correct one."),
  correctAnswer: z.string().min(1).describe("The exact string from the options array that is the correct answer.")
}).refine(data => data.options.includes(data.correctAnswer), {
  message: "Correct answer must be one of the provided options.",
  path: ["correctAnswer"], // Path to the field that failed validation
});


// Zod schema for CalculationQuestion
export const CalculationQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('calculation'),
  steps: z.array(z.string().min(5)).optional().describe("Optional array of strings outlining the steps to solve the problem."),
  answer: z.string().min(1).describe("The correct numerical or symbolic answer as a string."),
  acceptableVariations: z.array(z.string().min(1)).optional().describe("Optional array of acceptable string variations of the answer (e.g., different formatting).")
});

// Union schema for any question type
export const QuestionSchema = z.union([
  MultipleChoiceQuestionSchema,
  CalculationQuestionSchema
]).describe("Schema representing either a Multiple Choice or Calculation question.");

// Schema for an array of questions
export const QuestionsArraySchema = z.array(QuestionSchema)
  .min(1, "Must generate at least one question.")
  .describe("Schema for an array containing multiple questions.");


// Type alias inferred from the Zod schema (optional but can be useful)
export type GeneratedQuestion = z.infer<typeof QuestionSchema>; 