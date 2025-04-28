import {
  Skill,
  Module,
  Question,
  SkillCategory,
  ExamBoard,
  RegistryMetadata,
  SkillProgress
} from './types';
import { aiService } from '@/lib/learning/ai/ai.service';
import { v4 as uuidv4 } from 'uuid';

interface RegistryData {
  skills: Map<string, Skill>;
  categories: Map<string, SkillCategory>;
  examBoards: Map<string, ExamBoard>;
}

/**
 * SkillRegistry - Manages all skills, categories, and exam boards
 * Provides methods to filter, search, and retrieve skills
 */
class SkillRegistry {
  private skills: Map<string, Skill> = new Map();
  private metadata: RegistryMetadata;
  private userProgress: Map<string, SkillProgress> = new Map();
  private data: RegistryData = {
    skills: new Map(),
    categories: new Map(),
    examBoards: new Map(),
  };
  
  constructor(metadata: RegistryMetadata) {
    this.metadata = metadata;
    metadata.categories.forEach(cat => this.data.categories.set(cat.id, cat));
    metadata.examBoards.forEach(board => this.data.examBoards.set(board.id, board));
  }
  
  /**
   * Register a skill in the registry
   */
  registerSkill(skill: Skill): void {
    if (!skill || !skill.id) {
        console.error("Attempted to register an invalid or undefined skill.", skill);
        return; 
    }
    if (this.skills.has(skill.id)) {
      console.warn(`Skill with ID ${skill.id} already exists. Overwriting.`);
    }
    if (!this.data.categories.has(skill.category)) {
      console.error(`Skill ${skill.id} references unknown category ${skill.category}.`);
    }
    skill.examBoard.forEach(boardId => {
      if (!this.data.examBoards.has(boardId)) {
        console.error(`Skill ${skill.id} references unknown exam board ${boardId}.`);
      }
    });

    this.skills.set(skill.id, skill);
    this.data.skills.set(skill.id, skill); 
  }
  
  /**
   * Register multiple skills at once
   */
  registerSkills(skills: Skill[]): void {
    skills.forEach(skill => {
        if (skill && typeof skill === 'object' && skill.id) {
            this.registerSkill(skill);
        } else {
            console.error("Skipping registration of invalid skill object:", skill);
        }
    });
  }
  
  /**
   * Get all skills
   */
  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }
  
  /**
   * Get skill by ID
   */
  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }
  
  /**
   * Get skills by category
   */
  getSkillsByCategory(categoryId: string): Skill[] {
    return this.getAllSkills().filter(skill => skill.category === categoryId);
  }
  
  /**
   * Get skills by exam board
   */
  getSkillsByExamBoard(examBoardId: string): Skill[] {
    return this.getAllSkills().filter(
      skill => skill.examBoard.includes(examBoardId)
    );
  }
  
  /**
   * Get skills by status
   */
  getSkillsByStatus(status: string): Skill[] {
    return this.getAllSkills().filter(skill => skill.status === status);
  }
  
  /**
   * Search skills by title or description
   */
  searchSkills(query: string): Skill[] {
    const searchLower = query.toLowerCase();
    return this.getAllSkills().filter(
      skill => 
        skill.title.toLowerCase().includes(searchLower) || 
        skill.description.toLowerCase().includes(searchLower) ||
        skill.number.replace('.', '').includes(searchLower)
    );
  }
  
  /**
   * Find skills by difficulty
   */
  getSkillsByDifficulty(difficulty: string): Skill[] {
    return this.getAllSkills().filter(
      skill => skill.difficulty === difficulty
    );
  }
  
  /**
   * Get all categories
   */
  getCategories(): SkillCategory[] {
    return Array.from(this.data.categories.values());
  }
  
  /**
   * Get all exam boards
   */
  getExamBoards(): ExamBoard[] {
    return Array.from(this.data.examBoards.values());
  }
  
  /**
   * Get category by ID
   */
  getCategory(id: string): SkillCategory | undefined {
    return this.data.categories.get(id);
  }
  
  /**
   * Get exam board by ID
   */
  getExamBoard(id: string): ExamBoard | undefined {
    return this.data.examBoards.get(id);
  }
  
  /**
   * Save user progress for a skill
   */
  saveProgress(progress: SkillProgress): void {
    this.userProgress.set(progress.skillId, progress);
  }
  
  /**
   * Get user progress for a skill
   */
  getProgress(skillId: string): SkillProgress | undefined {
    return this.userProgress.get(skillId);
  }
  
  /**
   * Get all user progress
   */
  getAllProgress(): SkillProgress[] {
    return Array.from(this.userProgress.values());
  }
  
  /**
   * Check if a skill is available to the user
   * A skill is available if all its prerequisites are completed
   */
  isSkillAvailable(skillId: string): boolean {
    const skill = this.getSkill(skillId);
    if (!skill) return false;
    
    if (!skill.prerequisites || skill.prerequisites.length === 0) {
      return true;
    }
    
    return skill.prerequisites.every(prereqId => {
      const progress = this.getProgress(prereqId);
      return progress && progress.status === 'completed';
    });
  }
  
  /**
   * Get next recommended skills based on user progress
   */
  getRecommendedSkills(limit: number = 3): Skill[] {
    const available = this.getAllSkills().filter(
      skill => 
        (skill.status === 'available' || skill.status === 'attempted') &&
        this.isSkillAvailable(skill.id)
    );
    
    return available
      .sort((a, b) => {
        const aPrereqs = a.prerequisites?.length || 0;
        const bPrereqs = b.prerequisites?.length || 0;
        return aPrereqs - bPrereqs;
      })
      .slice(0, limit);
  }
  
  getModules(skillId: string): Module[] {
    const skill = this.getSkill(skillId);
    return skill ? skill.modules.sort((a, b) => a.order - b.order) : [];
  }

  getModule(skillId: string, moduleId: string): Module | undefined {
    const skill = this.getSkill(skillId);
    return skill?.modules.find(m => m.id === moduleId);
  }

  /**
   * Generates the *next* single question for a specific module by randomly choosing one of its submodules.
   * No caching is performed here for infinite generation.
   *
   * @param skillId The ID of the skill.
   * @param moduleId The ID of the module.
   * @returns A promise that resolves to a single Question, or null if generation fails or module has no submodules.
   */
  async generateNextQuestion(skillId: string, moduleId: string): Promise<Question | null> {
    const module = this.getModule(skillId, moduleId);
    if (!module) {
      console.error(`[Registry] Module ${moduleId} not found in skill ${skillId}.`);
      return null;
    }

    // Check if the module has submodules defined
    if (!module.submodules || module.submodules.length === 0) {
        console.error(`[Registry] Module ${moduleId} in skill ${skillId} has no submodules defined for question generation.`);
        return null;
    }

    // Randomly select a submodule from the current module
    const randomIndex = Math.floor(Math.random() * module.submodules.length);
    const selectedSubmodule = module.submodules[randomIndex];

    if (!selectedSubmodule) {
        // Should theoretically not happen if length > 0, but safeguard
        console.error(`[Registry] Failed to select a submodule for ${skillId}/${moduleId}.`);
        return null;
    }

    console.log(`[Registry] Requesting question generation for submodule: ${selectedSubmodule.title} (${selectedSubmodule.id}) in ${skillId}/${moduleId}...`);

    // Directly call the AI service using the selected submodule's details
    const generatedQuestion = await aiService.generateSingleQuestion(
      selectedSubmodule.generationPrompt, // Use submodule prompt
      selectedSubmodule.questionSchema    // Use submodule schema
    );

    if (!generatedQuestion) {
      console.error(`[Registry] Failed to generate question for submodule ${selectedSubmodule.id}.`);
      return null;
    }

    console.log(`[Registry] Successfully generated question (${generatedQuestion.id}) from submodule ${selectedSubmodule.id}.`);
    return generatedQuestion as Question;
  }
}

export default SkillRegistry; 