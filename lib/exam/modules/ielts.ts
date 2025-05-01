import { 
  BaseExamModule, 
  ExamTypeConfig, 
  ModuleConfig, 
  LevelConfig, 
  ExamModuleRegistry 
} from './base';
import { descriptionLoader } from '../descriptions/loader';

// Module types for IELTS
const IELTS_MODULES = {
  READING: 'reading',
  WRITING: 'writing',
  LISTENING: 'listening',
  SPEAKING: 'speaking'
} as const;

type IeltsModuleType = typeof IELTS_MODULES[keyof typeof IELTS_MODULES];

// Band levels for IELTS (1-9)
const IELTS_BANDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
type IeltsBandType = typeof IELTS_BANDS[number];

// IELTS module implementation
export class IeltsExamModule extends BaseExamModule {
  private moduleConfigs: Record<IeltsModuleType, ModuleConfig>;
  private levelConfigs: Record<IeltsBandType, Record<IeltsModuleType, LevelConfig>>;
  private examTypeConfig: ExamTypeConfig;

  constructor() {
    super();

    // Define exam type
    this.examTypeConfig = {
      id: 'ielts',
      label: 'IELTS',
      languageCode: 'en',
      languageName: 'English',
      flag: '🇬🇧'
    };

    // Load module descriptions
    const descriptions = descriptionLoader.getExamDescriptions('ielts');
    if (!descriptions) {
      throw new Error('Failed to load IELTS exam descriptions');
    }

    // Define modules with descriptions
    this.moduleConfigs = {
      [IELTS_MODULES.READING]: {
        id: IELTS_MODULES.READING,
        label: 'Reading',
        details: {
          ...descriptions.reading,
          supportedModals: this.getSupportedModalsForModule(IELTS_MODULES.READING)
        }
      },
      [IELTS_MODULES.WRITING]: {
        id: IELTS_MODULES.WRITING,
        label: 'Writing',
        details: {
          ...descriptions.writing,
          supportedModals: this.getSupportedModalsForModule(IELTS_MODULES.WRITING)
        }
      },
      [IELTS_MODULES.LISTENING]: {
        id: IELTS_MODULES.LISTENING,
        label: 'Listening',
        details: {
          ...descriptions.listening,
          supportedModals: this.getSupportedModalsForModule(IELTS_MODULES.LISTENING)
        }
      },
      [IELTS_MODULES.SPEAKING]: {
        id: IELTS_MODULES.SPEAKING,
        label: 'Speaking',
        details: {
          ...descriptions.speaking,
          supportedModals: this.getSupportedModalsForModule(IELTS_MODULES.SPEAKING)
        }
      }
    };

    // Define levels (bands) for each module
    this.levelConfigs = this.createBandConfigs();
  }

  // Helper method to create band configurations for all modules
  private createBandConfigs(): Record<IeltsBandType, Record<IeltsModuleType, LevelConfig>> {
    const bandConfigs: Record<string, Record<IeltsModuleType, LevelConfig>> = {};
    
    // Generate configurations for each band
    IELTS_BANDS.forEach(band => {
      bandConfigs[band] = this.createBandConfigForModules(band);
    });
    
    return bandConfigs as Record<IeltsBandType, Record<IeltsModuleType, LevelConfig>>;
  }

  // Create configurations for all modules at a specific band
  private createBandConfigForModules(band: string): Record<IeltsModuleType, LevelConfig> {
    const modules = Object.values(IELTS_MODULES);
    const bandLabel = this.getBandLabel(band);
    
    // Create a record with a configuration for each module
    return modules.reduce((configs, moduleId) => {
      configs[moduleId as IeltsModuleType] = {
        id: band,
        label: bandLabel,
        details: this.createBandDetails(band, moduleId as IeltsModuleType)
      };
      return configs;
    }, {} as Record<IeltsModuleType, LevelConfig>);
  }

  // Get descriptive label for each band
  private getBandLabel(band: string): string {
    const bandDescriptions: Record<string, string> = {
      '1': 'Band 1 - Non User',
      '2': 'Band 2 - Extremely Limited User',
      '3': 'Band 3 - Limited User',
      '4': 'Band 4 - Basic User',
      '5': 'Band 5 - Modest User',
      '6': 'Band 6 - Competent User',
      '7': 'Band 7 - Good User',
      '8': 'Band 8 - Very Good User',
      '9': 'Band 9 - Expert User'
    };
    
    return bandDescriptions[band] || `Band ${band}`;
  }

  // Create specific band details for a given band and module
  private createBandDetails(band: string, moduleId: IeltsModuleType) {
    const bandNum = parseInt(band, 10);
    
    const baseDetails = {
      description: `This Band ${band} exam tests your ability to understand and use English in ${moduleId} contexts at an ${this.getBandLabel(band).toLowerCase()} level.`,
      skills: [
        {
          name: `${moduleId.charAt(0).toUpperCase() + moduleId.slice(1)} at Band ${band}`,
          description: `Understanding and processing ${moduleId} content at Band ${band} level`,
          examples: [
            'Identifying main ideas',
            'Understanding specific details',
            'Following instructions'
          ]
        },
        {
          name: 'Vocabulary building',
          description: 'Expanding and using appropriate vocabulary',
          examples: [
            'Learning new words in context',
            'Using vocabulary accurately',
            'Understanding word relationships'
          ]
        },
        {
          name: 'Grammar practice',
          description: 'Using correct grammar structures',
          examples: [
            'Applying grammar rules',
            'Using appropriate tenses',
            'Forming correct sentences'
          ]
        }
      ],
      textTypes: [
        {
          name: 'Academic texts',
          description: 'Texts from academic sources',
          examples: ['Research papers', 'Academic articles', 'Textbook extracts']
        },
        {
          name: 'Diagrams',
          description: 'Visual representations of information',
          examples: ['Flow charts', 'Process diagrams', 'Technical drawings']
        },
        {
          name: 'Charts',
          description: 'Data visualization and statistical information',
          examples: ['Bar charts', 'Line graphs', 'Pie charts']
        }
      ],
      questionTypes: [
        {
          name: 'Multiple choice',
          description: 'Select the correct answer from options',
          examples: ['Single answer', 'Multiple answers', 'Best answer']
        },
        {
          name: 'True/False/Not Given',
          description: 'Determine if statements are true, false, or not mentioned',
          examples: ['Factual statements', 'Inference questions', 'Opinion statements']
        },
        {
          name: 'Matching',
          description: 'Match related items or information',
          examples: ['Headings with paragraphs', 'Questions with answers', 'Statements with speakers']
        }
      ],
      supportedModals: this.getSupportedModalsForModule(moduleId),
      examStructure: {
        description: `The Band ${band} exam structure is designed to test your ${moduleId} skills comprehensively.`,
        parts: [
          {
            name: 'Part 1',
            description: 'Basic comprehension and understanding',
            duration: 20,
            questions: 13,
            skills: ['Basic comprehension', 'Vocabulary recognition', 'Simple analysis'],
            format: 'Multiple choice and matching questions',
            tips: [
              'Read questions first',
              'Look for key words',
              'Manage your time well'
            ],
            supportedModals: this.getSupportedModalsForPart(moduleId, 'part1')
          },
          {
            name: 'Part 2',
            description: 'Advanced comprehension and analysis',
            duration: 20,
            questions: 13,
            skills: ['Detailed comprehension', 'Analysis', 'Evaluation'],
            format: 'True/False/Not Given and multiple choice questions',
            tips: [
              'Read carefully',
              'Take notes',
              'Review your answers'
            ],
            supportedModals: this.getSupportedModalsForPart(moduleId, 'part2')
          },
          {
            name: 'Part 3',
            description: 'Complex analysis and evaluation',
            duration: 20,
            questions: 14,
            skills: ['Critical analysis', 'Synthesis', 'Evaluation'],
            format: 'Matching and summary completion questions',
            tips: [
              'Understand the text structure',
              'Identify key arguments',
              'Pay attention to detail'
            ],
            supportedModals: this.getSupportedModalsForPart(moduleId, 'part3')
          }
        ],
        totalDuration: 60,
        totalQuestions: 40,
        passingScore: bandNum,
        difficulty: this.getDifficultyLevel(bandNum),
        preparationTime: this.getPreparationTime(bandNum),
        recommendedResources: [
          'Cambridge IELTS materials',
          'British Council resources',
          'Online practice tests'
        ]
      }
    };

    return baseDetails;
  }

  // Helper method to determine difficulty level based on band
  private getDifficultyLevel(band: number): '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' {
    return band.toString() as '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  }

  // Helper method to determine preparation time based on band
  private getPreparationTime(band: number): string {
    if (band <= 3) return '1-2 months';
    if (band <= 4) return '2-3 months';
    if (band <= 5) return '3-4 months';
    if (band <= 6) return '4-5 months';
    if (band <= 7) return '5-6 months';
    return '6+ months';
  }

  // Helper method to get supported modals for a module
  private getSupportedModalsForModule(moduleId: IeltsModuleType): Array<{
    type: 'multiple-choice' | 'fill-gap' | 'matching' | 'true-false' | 'short-answer';
    description: string;
    config?: Record<string, any>;
  }> {
    switch (moduleId) {
      case IELTS_MODULES.READING:
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
            description: 'Determine if statements are true, false, or not given',
            config: {
              includeNotGiven: true
            }
          }
        ];
      case IELTS_MODULES.WRITING:
        return [
          {
            type: 'fill-gap',
            description: 'Complete summary with appropriate words',
            config: {
              allowSynonyms: true,
              caseSensitive: false,
              wordLimit: true
            }
          },
          {
            type: 'short-answer',
            description: 'Write essays and reports',
            config: {
              minWords: 150,
              maxWords: 300,
              taskTypes: ['essay', 'report', 'letter']
            }
          }
        ];
      case IELTS_MODULES.LISTENING:
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
            description: 'Complete notes, summary, or form',
            config: {
              allowSynonyms: true,
              caseSensitive: false,
              wordLimit: true
            }
          }
        ];
      case IELTS_MODULES.SPEAKING:
        return [
          {
            type: 'short-answer',
            description: 'Respond to interview questions and tasks',
            config: {
              preparationTime: 60,
              responseTime: 120,
              taskTypes: ['interview', 'monologue', 'discussion']
            }
          }
        ];
      default:
        return [];
    }
  }

  // Helper method to get supported modals for a specific part
  private getSupportedModalsForPart(moduleId: IeltsModuleType, part: string): Array<'multiple-choice' | 'fill-gap' | 'matching' | 'true-false' | 'short-answer'> {
    switch (moduleId) {
      case IELTS_MODULES.READING:
        switch (part) {
          case 'part1':
            return ['multiple-choice', 'matching'];
          case 'part2':
            return ['true-false', 'multiple-choice'];
          case 'part3':
            return ['matching', 'fill-gap'];
          default:
            return ['multiple-choice'];
        }
      case IELTS_MODULES.WRITING:
        return part === 'part1' 
          ? ['short-answer'] // Task 1: Report/Letter
          : ['short-answer']; // Task 2: Essay
      case IELTS_MODULES.LISTENING:
        return ['multiple-choice', 'fill-gap'];
      case IELTS_MODULES.SPEAKING:
        return ['short-answer'];
      default:
        return [];
    }
  }

  // Required interface implementations
  getModules() {
    return Object.values(this.moduleConfigs).map(({ id, label }) => ({ id, label }));
  }

  getLevels() {
    return IELTS_BANDS.map(band => ({
      id: band,
      label: this.getBandLabel(band)
    }));
  }

  getExamType(): ExamTypeConfig {
    return this.examTypeConfig;
  }

  getModuleConfig(moduleId: string): ModuleConfig | null {
    return this.moduleConfigs[moduleId as IeltsModuleType] || null;
  }

  getLevelConfig(levelId: string, moduleId: string): LevelConfig | null {
    if (!this.levelConfigs[levelId as IeltsBandType]) return null;
    return this.levelConfigs[levelId as IeltsBandType][moduleId as IeltsModuleType] || null;
  }
}

// Register this module
ExamModuleRegistry.register('ielts', new IeltsExamModule());