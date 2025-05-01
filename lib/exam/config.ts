/**
 * Exam type definitions and configurations
 */

export const EXAM_TYPES = {
  IELTS: 'ielts',
  GOETHE: 'goethe'
} as const;

export type ExamType = typeof EXAM_TYPES[keyof typeof EXAM_TYPES];

export const EXAM_LANGUAGES = {
  [EXAM_TYPES.IELTS]: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
  },
  [EXAM_TYPES.GOETHE]: {
    code: 'de',
    name: 'German',
    flag: '🇩🇪',
  }
} as const;

export const DEFAULT_EXAM = EXAM_TYPES.IELTS;

/**
 * Helper functions for exam configuration
 */
export const getExamLanguage = (examType: ExamType) => EXAM_LANGUAGES[examType];
export const getExamFlag = (examType: ExamType) => EXAM_LANGUAGES[examType].flag;
export const getExamName = (examType: ExamType) => EXAM_LANGUAGES[examType].name;
export const getExamCode = (examType: ExamType) => EXAM_LANGUAGES[examType].code; 