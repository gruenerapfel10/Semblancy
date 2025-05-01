import { z } from 'zod'
import { ExamType, EXAM_LANGUAGES } from '../exam/config'
import { 
  ReadingExamHandler, 
  basePassageSchema, 
  baseQuestionsSchema,
  goethePassageSchema,
  goetheQuestionsSchema,
  ieltsPassageSchema,
  ieltsQuestionsSchema
} from './types'

// Base handler that can be used for any exam type
export class DefaultReadingExamHandler implements ReadingExamHandler {
  getPassagePrompt(examType: ExamType): string {
    const language = EXAM_LANGUAGES[examType]
    
    return `Generate a reading passage for ${examType.toUpperCase()} reading practice with the following requirements:
    - Title should be clear and descriptive
    - Content should be 300-400 words long
    - Cover an academic topic suitable for ${examType.toUpperCase()}
    - Use clear and formal language in ${language.name}
    - IMPORTANT: The entire passage MUST be written in ${language.name} language (${language.code})
    - Include 3-4 paragraphs
    - Focus on a single main idea with supporting details
    - Do not include markdown formatting or special characters
    - The passage should be culturally appropriate for ${language.name} speakers`
  }

  getQuestionsPrompt(examType: ExamType, passage: string): string {
    const language = EXAM_LANGUAGES[examType]
    
    return `Based on the following passage, generate 3 multiple-choice questions in ${language.name}. Each question must have exactly 4 options and one correct answer (0-3).
    
    Passage:
    ${passage}

    Requirements:
    - Generate exactly 3 questions in ${language.name}
    - IMPORTANT: All questions and options MUST be written ONLY in ${language.name} language (${language.code})
    - Each question must have exactly 4 options
    - The correctAnswer must be a number between 0 and 3 (index of the correct option)
    - Questions should test comprehension of the main ideas and key details
    - Options should be plausible but only one should be correct
    - Questions should be culturally appropriate for ${language.name} speakers`
  }

  getPassageSchema(): z.ZodObject<any> {
    return basePassageSchema
  }

  getQuestionsSchema(): z.ZodObject<any> {
    return baseQuestionsSchema
  }
}

// IELTS-specific implementation
export class IELTSReadingExamHandler extends DefaultReadingExamHandler {
  getPassagePrompt(examType: ExamType): string {
    const language = EXAM_LANGUAGES[examType]
    
    return `Generate an IELTS reading passage with the following structure and requirements:
    - Title should be academic and concise
    - Content should be 350-450 words with an academic tone
    - The passage should be divided into 2-3 sections with optional headings
    - Use formal academic English with appropriate vocabulary for IELTS
    - Cover topics like science, social sciences, or environment
    - Include complex sentence structures and academic vocabulary
    - The content should be factual and informative
    - Suitable for IELTS academic reading test (band 6-7)`
  }

  getQuestionsPrompt(examType: ExamType, passage: string): string {
    return `Based on the following IELTS-style passage, generate 3 questions. Each question must have exactly 4 options with one correct answer (0-3).
    
    Passage:
    ${passage}

    Requirements:
    - Generate exactly 3 questions in English
    - Include a mix of question types typical for IELTS: 
      - Multiple choice questions that test deep comprehension
      - Questions that may require inference from the text
    - Each question must have exactly 4 options
    - The correctAnswer must be a number between 0 and 3 (index of the correct option)
    - All questions should require careful reading of the passage
    - Some questions should test vocabulary in context
    - Questions should increase in difficulty`
  }

  getPassageSchema(): z.ZodObject<any> {
    return ieltsPassageSchema
  }

  getQuestionsSchema(): z.ZodObject<any> {
    return ieltsQuestionsSchema
  }
}

// Goethe-specific implementation
export class GoetheReadingExamHandler extends DefaultReadingExamHandler {
  getPassagePrompt(examType: ExamType): string {
    const language = EXAM_LANGUAGES[examType]
    
    return `Generate a Goethe-Institut style reading passage in German with the following requirements:
    - Title should be clear and descriptive in German
    - Content should be 250-350 words in German
    - Cover everyday topics relevant to German culture and society
    - Use clear German appropriate for B1-B2 level
    - IMPORTANT: The entire passage MUST be written in German
    - Include 3-4 paragraphs with logical flow
    - Include 5 key vocabulary items with definitions that might be challenging for learners
    - The passage should reflect authentic German language usage
    - Topics may include: daily life, work, education, environment, or culture in German-speaking countries`
  }

  getQuestionsPrompt(examType: ExamType, passage: string): string {
    return `Based on the following German passage, generate 3 multiple-choice questions in German in the style of Goethe exams. Each question must have exactly 4 options and one correct answer (0-3).
    
    Passage:
    ${passage}

    Requirements:
    - Generate exactly 3 questions in German
    - IMPORTANT: All questions and options MUST be written ONLY in German
    - Each question must have exactly 4 options
    - The correctAnswer must be a number between 0 and 3 (index of the correct option)
    - Questions should test both direct comprehension and implicit understanding
    - For each question, include a brief context showing which part of the passage it relates to
    - Questions should follow Goethe exam patterns for B1-B2 level
    - Options should be grammatically consistent and plausible`
  }

  getPassageSchema(): z.ZodObject<any> {
    return goethePassageSchema
  }

  getQuestionsSchema(): z.ZodObject<any> {
    return goetheQuestionsSchema
  }
}

// Factory to create the appropriate handler based on exam type
export class ReadingExamHandlerFactory {
  static createHandler(examType: ExamType): ReadingExamHandler {
    switch (examType) {
      case 'ielts':
        return new IELTSReadingExamHandler();
      case 'goethe':
        return new GoetheReadingExamHandler();
      default:
        return new DefaultReadingExamHandler();
    }
  }
} 