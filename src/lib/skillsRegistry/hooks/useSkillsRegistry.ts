'use client';

import { useState, useEffect, useCallback } from 'react';
import registry from '../index';
import { Skill, Module, Question, SkillCategory, ExamBoard } from '../types';

interface QuestionState {
  currentQuestion: Question | null;
  isLoadingNext: boolean;
  error: any | null;
}

/**
 * Hook to interact with the SkillRegistry for infinite question generation.
 */
export default function useSkillsRegistry() {
  // State for core registry data 
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [examBoards, setExamBoards] = useState<ExamBoard[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(true);

  // State for the currently active question per module
  // { skillId -> { moduleId -> QuestionState } }
  const [activeQuestionState, setActiveQuestionState] = useState<Record<string, Record<string, QuestionState>>>({});

  // Initial load of static registry data
  useEffect(() => {
    setSkills(registry.getAllSkills());
    setCategories(registry.getCategories());
    setExamBoards(registry.getExamBoards());
    setLoadingRegistry(false);
  }, []);

  // --- Retrieval Methods --- 
  const getSkill = useCallback((id: string): Skill | undefined => registry.getSkill(id), []);
  const getModules = useCallback((skillId: string): Module[] => registry.getModules(skillId), []);
  const getModule = useCallback((skillId: string, moduleId: string): Module | undefined => registry.getModule(skillId, moduleId), []);
  
  // --- Define loading functions FIRST --- 

  /**
   * Loads the *first* question for a module when it's initially accessed.
   */
  const loadInitialQuestion = useCallback(async (skillId: string, moduleId: string) => {
    // Check again inside to prevent race conditions if called multiple times quickly
    if (activeQuestionState[skillId]?.[moduleId]) {
        // console.log(`[useSkillsRegistry] loadInitialQuestion: Already loaded/loading for ${skillId}/${moduleId}. Skipping.`);
        return; 
    }
    
    console.log(`[useSkillsRegistry] loadInitialQuestion: Loading initial question for ${skillId}/${moduleId}`);
    // Set initial loading state
    // Ensure we don't wipe other modules' states
    setActiveQuestionState(prev => ({
        ...prev,
        [skillId]: {
            ...(prev[skillId] || {}),
            [moduleId]: { currentQuestion: null, isLoadingNext: true, error: null },
        },
    }));

    try {
      const question = await registry.generateNextQuestion(skillId, moduleId);
      setActiveQuestionState(prev => ({
        ...prev,
        [skillId]: {
          ...(prev[skillId] || {}),
          [moduleId]: { currentQuestion: question, isLoadingNext: false, error: null },
        },
      }));
    } catch (error) {
      console.error(`[useSkillsRegistry] loadInitialQuestion: Error loading initial question for ${skillId}/${moduleId}:`, error);
      setActiveQuestionState(prev => ({
        ...prev,
        [skillId]: {
          ...(prev[skillId] || {}),
          [moduleId]: { currentQuestion: null, isLoadingNext: false, error: error },
        },
      }));
    }
  }, [activeQuestionState]); // Keep dependency only on activeQuestionState to prevent loops

  /**
   * Loads the *next* question for a module, replacing the current one.
   */
  const loadNextQuestion = useCallback(async (skillId: string, moduleId: string) => {
    console.log(`[useSkillsRegistry] Loading next question for ${skillId}/${moduleId}`);
    // Set loading state immediately
    setActiveQuestionState(prev => ({
      ...prev,
      [skillId]: {
        ...(prev[skillId] || {}),
        [moduleId]: { 
            currentQuestion: prev[skillId]?.[moduleId]?.currentQuestion ?? null, // Keep current while loading next
            isLoadingNext: true, 
            error: null // Clear previous error
        },
      },
    }));

    try {
      const question = await registry.generateNextQuestion(skillId, moduleId);
      setActiveQuestionState(prev => ({
        ...prev,
        [skillId]: {
          ...(prev[skillId] || {}),
          [moduleId]: { currentQuestion: question, isLoadingNext: false, error: null },
        },
      }));
    } catch (error) {
      console.error(`[useSkillsRegistry] Error loading next question for ${skillId}/${moduleId}:`, error);
      setActiveQuestionState(prev => ({
        ...prev,
        [skillId]: {
          ...(prev[skillId] || {}),
          [moduleId]: { 
              currentQuestion: prev[skillId]?.[moduleId]?.currentQuestion ?? null, // Keep current on error
              isLoadingNext: false, 
              error: error 
          },
        },
      }));
    }
  }, [activeQuestionState]); // Dependency needed

  // --- Define state getter function LAST --- 

  /**
   * Gets the state for the current question of a specific module.
   * If the state doesn't exist, it triggers the initial load.
   * 
   * @param skillId The ID of the skill.
   * @param moduleId The ID of the module.
   * @returns The current QuestionState { currentQuestion, isLoadingNext, error }.
   */
  const getCurrentQuestionState = useCallback((skillId: string, moduleId: string): QuestionState => {
    const currentSkillState = activeQuestionState[skillId];
    const moduleState = currentSkillState?.[moduleId];

    // If state exists, return it
    if (moduleState) {
      return moduleState;
    }

    // If state does NOT exist, trigger initial load (don't await)
    if (skillId && moduleId) {
        console.log(`[useSkillsRegistry] State for ${skillId}/${moduleId} not found. Triggering initial load.`);
        loadInitialQuestion(skillId, moduleId); // Fire and forget - Now defined above
    } else {
        console.warn("[useSkillsRegistry] Attempted getCurrentQuestionState with invalid skillId or moduleId", { skillId, moduleId });
    }

    // Return the default initial loading state immediately
    return { currentQuestion: null, isLoadingNext: true, error: null };
  }, [activeQuestionState, loadInitialQuestion]); // Add loadInitialQuestion dependency

  // --- Filtering/Search Methods --- 
  const getSkillsByCategory = useCallback((categoryId: string): Skill[] => registry.getSkillsByCategory(categoryId), []);
  const getSkillsByExamBoard = useCallback((boardId: string): Skill[] => registry.getSkillsByExamBoard(boardId), []);
  const searchSkills = useCallback((searchTerm: string): Skill[] => registry.searchSkills(searchTerm), []);

  return {
    skills,
    categories,
    examBoards,
    loadingRegistry,
    getSkill,
    getModules,
    getModule,
    getCurrentQuestionState, // Get the current state (question, loading, error)
    loadInitialQuestion,   // Load the very first question
    loadNextQuestion,      // Load subsequent questions
    getSkillsByCategory,
    getSkillsByExamBoard,
    searchSkills,
  };
} 