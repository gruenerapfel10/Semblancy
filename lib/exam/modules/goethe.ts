import { 
  BaseExamModule, 
  ExamTypeConfig, 
  ModuleConfig, 
  LevelConfig, 
  ExamModuleRegistry 
} from './base';
import { descriptionLoader } from '../descriptions/loader';

// Module types for Goethe
const GOETHE_MODULES = {
  READING: 'reading',
  WRITING: 'writing',
  LISTENING: 'listening',
  SPEAKING: 'speaking'
} as const;

type GoetheModuleType = typeof GOETHE_MODULES[keyof typeof GOETHE_MODULES];

// Level types for Goethe
const GOETHE_LEVELS = {
  A1: 'a1',
  A2: 'a2',
  B1: 'b1',
  B2: 'b2',
  C1: 'c1',
  C2: 'c2'
} as const;

type GoetheLevelType = typeof GOETHE_LEVELS[keyof typeof GOETHE_LEVELS];

// Goethe module implementation
export class GoetheExamModule extends BaseExamModule {
  private moduleConfigs: Record<GoetheModuleType, ModuleConfig>;
  private levelConfigs: Record<GoetheLevelType, Record<GoetheModuleType, LevelConfig>>;
  private examTypeConfig: ExamTypeConfig;

  constructor() {
    super();

    // Define exam type
    this.examTypeConfig = {
      id: 'goethe',
      label: 'Goethe',
      languageCode: 'de',
      languageName: 'German',
      flag: '🇩🇪'
    };

    // Load module descriptions
    const descriptions = descriptionLoader.getExamDescriptions('goethe');
    if (!descriptions) {
      throw new Error('Failed to load Goethe exam descriptions');
    }

    // Define modules with descriptions
    this.moduleConfigs = {
      [GOETHE_MODULES.READING]: {
        id: GOETHE_MODULES.READING,
        label: 'Reading',
        details: {
          ...descriptions.reading,
          supportedModals: this.getSupportedModalsForModule(GOETHE_MODULES.READING)
        }
      },
      [GOETHE_MODULES.WRITING]: {
        id: GOETHE_MODULES.WRITING,
        label: 'Writing',
        details: {
          ...descriptions.writing,
          supportedModals: this.getSupportedModalsForModule(GOETHE_MODULES.WRITING)
        }
      },
      [GOETHE_MODULES.LISTENING]: {
        id: GOETHE_MODULES.LISTENING,
        label: 'Listening',
        details: {
          ...descriptions.listening,
          supportedModals: this.getSupportedModalsForModule(GOETHE_MODULES.LISTENING)
        }
      },
      [GOETHE_MODULES.SPEAKING]: {
        id: GOETHE_MODULES.SPEAKING,
        label: 'Speaking',
        details: {
          ...descriptions.speaking,
          supportedModals: this.getSupportedModalsForModule(GOETHE_MODULES.SPEAKING)
        }
      }
    };

    // Define levels for each module
    this.levelConfigs = this.createLevelConfigs();
  }

  // Helper method to get supported modals for a module
  private getSupportedModalsForModule(moduleId: GoetheModuleType): Array<{
    type: 'multiple-choice' | 'fill-gap' | 'matching' | 'true-false' | 'short-answer';
    description: string;
    config?: Record<string, any>;
  }> {
    switch (moduleId) {
      case GOETHE_MODULES.READING:
        return [
          {
            type: 'multiple-choice',
            description: 'Select the correct answer from given options',
            config: {
              maxOptions: 4,
              allowMultipleCorrect: false
            }
          },
          {
            type: 'matching',
            description: 'Match headings with paragraphs or information',
            config: {
              maxPairs: 8
            }
          },
          {
            type: 'true-false',
            description: 'Determine if statements are true or false',
            config: {
              includeNotGiven: false
            }
          }
        ];
      case GOETHE_MODULES.WRITING:
        return [
          {
            type: 'fill-gap',
            description: 'Complete text with appropriate words',
            config: {
              allowSynonyms: true,
              caseSensitive: false,
              wordLimit: true
            }
          },
          {
            type: 'short-answer',
            description: 'Write essays and letters',
            config: {
              minWords: 100,
              maxWords: 250,
              taskTypes: ['essay', 'letter', 'description']
            }
          }
        ];
      case GOETHE_MODULES.LISTENING:
        return [
          {
            type: 'multiple-choice',
            description: 'Select the correct answer based on the audio',
            config: {
              maxOptions: 3,
              allowMultipleCorrect: false
            }
          },
          {
            type: 'fill-gap',
            description: 'Complete text while listening',
            config: {
              allowSynonyms: true,
              caseSensitive: false,
              wordLimit: true
            }
          }
        ];
      case GOETHE_MODULES.SPEAKING:
        return [
          {
            type: 'short-answer',
            description: 'Respond to prompts and questions',
            config: {
              preparationTime: 60,
              responseTime: 120,
              taskTypes: ['monologue', 'dialogue', 'presentation']
            }
          }
        ];
      default:
        return [];
    }
  }

  // Helper method to create level configurations
  private createLevelConfigs(): Record<GoetheLevelType, Record<GoetheModuleType, LevelConfig>> {
    const levels = Object.values(GOETHE_LEVELS);
    const modules = Object.values(GOETHE_MODULES);
    
    // Create a record with a configuration for each level and module
    return levels.reduce((levelConfigs, levelId) => {
      levelConfigs[levelId] = modules.reduce((moduleConfigs, moduleId) => {
        moduleConfigs[moduleId] = {
          id: levelId,
          label: this.getLevelLabel(levelId),
          details: this.moduleConfigs[moduleId].details
        };
        return moduleConfigs;
      }, {} as Record<GoetheModuleType, LevelConfig>);
      return levelConfigs;
    }, {} as Record<GoetheLevelType, Record<GoetheModuleType, LevelConfig>>);
  }

  // Helper method to get level label
  private getLevelLabel(levelId: GoetheLevelType): string {
    const labels: Record<GoetheLevelType, string> = {
      [GOETHE_LEVELS.A1]: 'A1 - Beginner',
      [GOETHE_LEVELS.A2]: 'A2 - Elementary',
      [GOETHE_LEVELS.B1]: 'B1 - Intermediate',
      [GOETHE_LEVELS.B2]: 'B2 - Upper Intermediate',
      [GOETHE_LEVELS.C1]: 'C1 - Advanced',
      [GOETHE_LEVELS.C2]: 'C2 - Proficiency'
    };
    return labels[levelId];
  }

  // Required interface implementations
  getModules() {
    return Object.values(this.moduleConfigs).map(({ id, label }) => ({ id, label }));
  }

  getLevels() {
    return Object.keys(this.levelConfigs).map(id => ({
      id,
      label: this.getLevelLabel(id as GoetheLevelType)
    }));
  }

  getExamType(): ExamTypeConfig {
    return this.examTypeConfig;
  }

  getModuleConfig(moduleId: string): ModuleConfig | null {
    return this.moduleConfigs[moduleId as GoetheModuleType] || null;
  }

  getLevelConfig(levelId: string, moduleId: string): LevelConfig | null {
    if (!this.levelConfigs[levelId as GoetheLevelType]) return null;
    return this.levelConfigs[levelId as GoetheLevelType][moduleId as GoetheModuleType] || null;
  }
}

// Register this module
const goetheModule = new GoetheExamModule();
ExamModuleRegistry.register('goethe', goetheModule);