import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExamModuleRegistry, BaseExamModule, ModuleConfig, LevelConfig, ExamTypeConfig } from '@/lib/exam';
import { useExam } from '@/lib/context/user-preferences-context';
import { Brain, BookText, Headphones, MicVocal } from 'lucide-react';

// Icon mapping for modules
const MODULE_ICONS = {
  reading: Brain,
  writing: BookText,
  listening: Headphones,
  speaking: MicVocal
} as const;

export interface ExamState {
  // Selected values
  selectedModule: string;
  selectedLevel: string;
  
  // Current configurations
  examTypeConfig: ExamTypeConfig | null;
  moduleConfig: ModuleConfig | null;
  levelConfig: LevelConfig | null;
  
  // Available options
  availableModules: Array<{ id: string; label: string; icon: any }>;
  availableLevels: Array<{ id: string; label: string }>;
}

export function useExamState(): ExamState & {
  setSelectedModule: (module: string) => void;
  setSelectedLevel: (level: string) => void;
  startSession: () => void;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { examType } = useExam();
  
  // Get current exam module
  const currentExamModule = ExamModuleRegistry.getModule(examType);
  
  // Get available modules and levels
  const availableModules = currentExamModule?.getModules().map(module => ({
    id: module.id,
    label: module.label,
    icon: MODULE_ICONS[module.id as keyof typeof MODULE_ICONS] || Brain
  })) || [];
  
  const availableLevels = currentExamModule?.getLevels() || [];
  
  // Initialize state with URL params or first available options
  const [selectedModule, setSelectedModule] = useState<string>(() => {
    const urlModule = searchParams.get('module');
    if (urlModule && availableModules.some(m => m.id === urlModule)) {
      return urlModule;
    }
    return availableModules[0]?.id || '';
  });
  
  const [selectedLevel, setSelectedLevel] = useState<string>(() => {
    const urlLevel = searchParams.get('level');
    if (urlLevel && availableLevels.some(l => l.id === urlLevel)) {
      return urlLevel;
    }
    return availableLevels[0]?.id || '';
  });
  
  // Reset selections when exam type changes
  useEffect(() => {
    if (!currentExamModule) return;
    
    // If URL params exist and are valid for new exam type, keep them
    const urlModule = searchParams.get('module');
    const urlLevel = searchParams.get('level');
    
    const validModule = urlModule && availableModules.some(m => m.id === urlModule);
    const validLevel = urlLevel && availableLevels.some(l => l.id === urlLevel);
    
    if (!validModule) {
      setSelectedModule(availableModules[0]?.id || '');
    }
    
    if (!validLevel) {
      setSelectedLevel(availableLevels[0]?.id || '');
    }
  }, [examType, currentExamModule, availableModules, availableLevels, searchParams]);
  
  // Get current configurations
  const examTypeConfig = currentExamModule?.getExamType() || null;
  const moduleConfig = currentExamModule?.getModuleConfig(selectedModule) || null;
  const levelConfig = currentExamModule?.getLevelConfig(selectedLevel, selectedModule) || null;
  
  // Update URL when selections change
  useEffect(() => {
    if (selectedModule && selectedLevel) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('module', selectedModule);
      params.set('level', selectedLevel);
      router.replace(`?${params.toString()}`);
    }
  }, [selectedModule, selectedLevel, router, searchParams]);
  
  // Start session handler
  const startSession = useCallback(() => {
    if (!selectedModule || !selectedLevel) return;
    
    const params = new URLSearchParams();
    params.set('module', selectedModule);
    params.set('level', selectedLevel);
    
    router.push(`/dashboard/practice/session?${params.toString()}`);
  }, [selectedModule, selectedLevel, router]);
  
  return {
    // State
    selectedModule,
    selectedLevel,
    examTypeConfig,
    moduleConfig,
    levelConfig,
    availableModules,
    availableLevels,
    
    // Actions
    setSelectedModule,
    setSelectedLevel,
    startSession
  };
} 