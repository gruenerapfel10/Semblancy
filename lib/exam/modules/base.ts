/**
 * Base module structures for the exam configuration system
 * This provides the foundation for all exam type implementations
 */

// Common interfaces for module configuration
export interface ExamModuleDetails {
  description: string;
  skills: Array<{
    name: string;
    description: string;
    examples: string[];
  }>;
  textTypes: Array<{
    name: string;
    description: string;
    examples: string[];
  }>;
  questionTypes: Array<{
    name: string;
    description: string;
    examples: string[];
  }>;
  supportedModals: Array<{
    type: 'multiple-choice' | 'fill-gap' | 'matching' | 'true-false' | 'short-answer';
    description: string;
    config?: Record<string, any>;
  }>;
  examStructure: {
    description: string;
    parts: Array<{
      name: string;
      description: string;
      duration: number;
      questions: number;
      skills: string[];
      format: string;
      tips: string[];
      supportedModals?: Array<'multiple-choice' | 'fill-gap' | 'matching' | 'true-false' | 'short-answer'>;
    }>;
    totalDuration: number;
    totalQuestions: number;
    passingScore: number;
    difficulty: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
    preparationTime: string;
    recommendedResources: string[];
  };
}

export interface ModuleConfig {
  id: string;
  label: string;
  icon?: any;
  details: ExamModuleDetails;
}

export interface LevelConfig {
  id: string;
  label: string;
  details: ExamModuleDetails;
}

export interface ExamTypeConfig {
  id: string;
  label: string;
  languageCode: string;
  languageName: string;
  flag: string;
}

// The base module class that all specific modules will extend
export abstract class BaseExamModule {
  abstract getModules(): { id: string; label: string; icon?: any }[];
  abstract getLevels(): { id: string; label: string }[];
  abstract getExamType(): ExamTypeConfig;
  abstract getModuleConfig(moduleId: string): ModuleConfig | null;
  abstract getLevelConfig(levelId: string, moduleId: string): LevelConfig | null;
}

// Registry to store and retrieve all exam modules
export class ExamModuleRegistry {
  private static modules: Map<string, BaseExamModule> = new Map();

  static register(examType: string, module: BaseExamModule): void {
    this.modules.set(examType, module);
  }

  static getModule(examType: string): BaseExamModule | undefined {
    return this.modules.get(examType);
  }

  static getAllExamTypes(): string[] {
    return Array.from(this.modules.keys());
  }

  static getAllModules(): BaseExamModule[] {
    return Array.from(this.modules.values());
  }
} 