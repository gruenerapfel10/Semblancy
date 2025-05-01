import { z } from 'zod';

// Zod schema for skill description
export const skillSchema = z.object({
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string())
});

// Zod schema for text type description
export const textTypeSchema = z.object({
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string())
});

// Zod schema for question type description
export const questionTypeSchema = z.object({
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string())
});

// Zod schema for exam part description
export const examPartSchema = z.object({
  name: z.string(),
  description: z.string(),
  duration: z.number(),
  questions: z.number(),
  skills: z.array(z.string()),
  format: z.string(),
  tips: z.array(z.string())
});

// Zod schema for exam structure
export const examStructureSchema = z.object({
  description: z.string(),
  parts: z.array(examPartSchema),
  totalDuration: z.number(),
  totalQuestions: z.number(),
  passingScore: z.number(),
  difficulty: z.union([
    z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']),
    z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
  ]),
  preparationTime: z.string(),
  recommendedResources: z.array(z.string())
});

// Zod schema for module details
export const moduleDetailsSchema = z.object({
  description: z.string(),
  skills: z.array(skillSchema),
  textTypes: z.array(textTypeSchema),
  questionTypes: z.array(questionTypeSchema),
  examStructure: examStructureSchema
});

// TypeScript types derived from Zod schemas
export type Skill = z.infer<typeof skillSchema>;
export type TextType = z.infer<typeof textTypeSchema>;
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type ExamPart = z.infer<typeof examPartSchema>;
export type ExamStructure = z.infer<typeof examStructureSchema>;
export type ModuleDetails = z.infer<typeof moduleDetailsSchema>;