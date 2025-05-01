import { z } from 'zod';
import { moduleDetailsSchema, type ModuleDetails } from './base';
import goetheDescriptions from './goethe.json';
import ieltsDescriptions from './ielts.json';

// Type for exam module descriptions
export type ExamDescriptions = {
  [moduleId: string]: ModuleDetails;
};

// Type for all exam descriptions
export type AllExamDescriptions = {
  [examType: string]: ExamDescriptions;
};

// Schema for exam descriptions
const examDescriptionsSchema = z.record(moduleDetailsSchema);

// Schema for all exam descriptions
const allExamDescriptionsSchema = z.record(examDescriptionsSchema);

// Load and validate descriptions
function loadDescriptions(): AllExamDescriptions {
  const descriptions = {
    goethe: goetheDescriptions,
    ielts: ieltsDescriptions
  };

  // Validate the descriptions
  return allExamDescriptionsSchema.parse(descriptions);
}

// Singleton instance for descriptions
class DescriptionLoader {
  private static instance: DescriptionLoader;
  private descriptions: AllExamDescriptions;

  private constructor() {
    this.descriptions = loadDescriptions();
  }

  static getInstance(): DescriptionLoader {
    if (!DescriptionLoader.instance) {
      DescriptionLoader.instance = new DescriptionLoader();
    }
    return DescriptionLoader.instance;
  }

  getExamDescriptions(examType: string): ExamDescriptions | undefined {
    return this.descriptions[examType];
  }

  getModuleDetails(examType: string, moduleId: string): ModuleDetails | undefined {
    return this.descriptions[examType]?.[moduleId];
  }

  getAllExamTypes(): string[] {
    return Object.keys(this.descriptions);
  }

  getModuleIds(examType: string): string[] {
    return Object.keys(this.descriptions[examType] || {});
  }
}

// Export singleton instance
export const descriptionLoader = DescriptionLoader.getInstance(); 