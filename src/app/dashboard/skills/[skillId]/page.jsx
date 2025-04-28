'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import useSkillsRegistry from '@/lib/skillsRegistry/hooks/useSkillsRegistry';

// Import modular components
import { MultipleChoiceQuestion, CalculationQuestion } from '../components/QuestionComponents';
import { Celebration, LessonComplete } from '../components/Celebration';
import { Header, Footer, SoundButton } from '../components/Layout';
import { playSound } from '../components/Utils';

// Main Lesson Page Component - Infinite Runner Style
export default function SkillPage() {
  const router = useRouter();
  const { skillId } = useParams();
  const { 
    getSkill, 
    getModule, 
    getCurrentQuestionState, 
    loadInitialQuestion,
    loadNextQuestion
  } = useSkillsRegistry();

  // --- State Management --- 
  const [currentModuleId, setCurrentModuleId] = useState(null);
  // Game state (less emphasis on module/lesson completion)
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [gems, setGems] = useState(0);
  const [stars, setStars] = useState(0); // Maybe use stars differently?
  const [score, setScore] = useState(0); // Track overall score

  // UI state
  const [showCelebration, setShowCelebration] = useState(false); // Keep for effects
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // --- Data Fetching & Setup --- 
  const skill = getSkill(skillId || ''); 
  const currentModule = currentModuleId ? getModule(skillId || '', currentModuleId) : null;

  // Get current question state from hook
  const { currentQuestion, isLoadingNext, error: questionError } = 
    getCurrentQuestionState(skillId || '', currentModuleId || '');

  // Load the first module and its initial question on mount
  useEffect(() => {
    if (skill && skill.modules.length > 0 && !currentModuleId) {
      const firstModuleId = skill.modules.sort((a, b) => a.order - b.order)[0].id;
      setCurrentModuleId(firstModuleId);
    }
  }, [skill, currentModuleId]);

  // Trigger loading the *initial* question when the module ID is set
  useEffect(() => {
      if (skillId && currentModuleId) {
          // Check if we need to load the initial question for this module
          const state = getCurrentQuestionState(skillId, currentModuleId);
          if (!state.currentQuestion && !state.isLoadingNext && !state.error) {
             loadInitialQuestion(skillId, currentModuleId);
          }
      }
  }, [skillId, currentModuleId, getCurrentQuestionState, loadInitialQuestion]); // Add dependencies

  // --- Event Handlers --- 
  
  const handleAnswer = (isCorrect) => {
    if (isLoadingNext || isTransitioning) return; // Prevent acting during load/transition

    setIsTransitioning(true); // Start transition visual state (e.g., disable buttons)

    if (isCorrect) {
      console.log("[SkillPage] Correct Answer");
      playSound('correct');
      // Update score/streak/gems
      const newStreak = streak + 1;
      setStreak(newStreak);
      const streakBonus = Math.min(Math.floor(newStreak / 3), 3);
      const pointsToAdd = currentQuestion?.points || 10;
      setScore(prev => prev + pointsToAdd);
      setGems(prev => prev + 5 + streakBonus);
      
      // Load next question after feedback animation delay
      setTimeout(() => {
        if (skillId && currentModuleId) {
            console.log("[SkillPage] Loading next question after correct answer.");
            loadNextQuestion(skillId, currentModuleId);
        }
        // Reset transition state AFTER potential load starts
        setIsTransitioning(false); 
      }, 1500); 

    } else {
      console.log("[SkillPage] Incorrect Answer");
      playSound('incorrect');
      setStreak(0);
      
      // --- Deduct heart ONLY on incorrect --- 
      const newHearts = hearts - 1;
      setHearts(Math.max(0, newHearts));
      // -------------------------------------

      if (newHearts <= 0) {
        // Game Over Logic
        console.error("GAME OVER - Out of hearts!");
        // TODO: Show Game Over UI
        // Reset essentials after a delay
        setTimeout(() => {
            setHearts(3); 
            setStreak(0); 
            setScore(0);
            setGems(0); // Reset gems too
            if (skillId && currentModuleId) {
                console.log("[SkillPage] Resetting to initial question after game over.");
                loadInitialQuestion(skillId, currentModuleId); 
            }
            setIsTransitioning(false);
        }, 2000);
      } else {
         // Incorrect, but game continues: Load next question after feedback delay
         setTimeout(() => {
            if (skillId && currentModuleId) {
                 console.log("[SkillPage] Loading next question after incorrect answer.");
                 loadNextQuestion(skillId, currentModuleId);
            }
             // Reset transition state AFTER potential load starts
             setIsTransitioning(false); 
         }, 1500); 
      }
    }
  };

  // --- Navigation & Reset --- 
  const handleGoBack = () => router.push('/dashboard/skills');

  // --- Render Logic --- 

  // Loading Skill/Module itself
  if (!skill) return <div className="h-full flex items-center justify-center">Loading Skill...</div>;
  if (!currentModule) return <div className="h-full flex items-center justify-center">Loading Module...</div>;

  return (
    <div className="h-full flex flex-col bg-background w-full overflow-hidden">
      {/* Header: Remove progress bar, maybe show score? */}
      <Header 
        // progress={progress} // Removed progress 
        hearts={hearts} 
        streak={streak} 
        onBack={handleGoBack} 
        // Optional: Pass score to display
        score={score}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-2 relative">
        <div className="mb-2 text-center">
          <h1 className="text-lg font-bold text-text-primary">{skill.title} - {currentModule.title}</h1>
          {/* Maybe show current streak or score here? */}
          <p className="text-xs text-text-secondary">Streak: {streak}</p>
        </div>
        
        <div className="w-full max-w-2xl bg-background-elevated rounded-lg shadow p-3 mb-2 min-h-[200px] flex items-center justify-center relative">
           {/* Loading Indicator for Next Question (Subtle) */}
           {isLoadingNext && (
               <div className="absolute top-2 right-2 text-xs text-text-secondary animate-pulse">Generating...</div>
           )}

            {/* Error State */}
            {questionError && !isLoadingNext && (
                <div className="text-center text-error">
                    <p>Error generating the next question.</p>
                    <p className="text-xs mt-1">({questionError.message || 'Please try again or go back.'})</p>
                    <button 
                        onClick={() => loadNextQuestion(skillId, currentModuleId)}
                        className="mt-2 px-3 py-1 bg-error text-white rounded text-sm hover:bg-red-700"
                        disabled={isLoadingNext} // Disable if already loading
                    >
                        Retry
                    </button>
                </div>
            )}
            
            {/* Render Current Question - Ensure Key Prop is Correct */}
            {!questionError && currentQuestion && (
                 <AnimatePresence mode="wait">
                    {currentQuestion.type === 'multiple_choice' ? (
                        <MultipleChoiceQuestion 
                            key={currentQuestion.id} // CRUCIAL: Forces re-mount on ID change
                            question={currentQuestion} 
                            onAnswer={handleAnswer} 
                            disabled={isLoadingNext || isTransitioning} 
                        />
                    ) : ( 
                        <CalculationQuestion 
                            key={currentQuestion.id} // CRUCIAL: Forces re-mount on ID change
                            question={currentQuestion} 
                            onAnswer={handleAnswer} 
                            disabled={isLoadingNext || isTransitioning}
                        />
                    )}
                </AnimatePresence>
            )}

            {/* Initial Loading State (different from isLoadingNext) */}
            {!currentQuestion && isLoadingNext && !questionError && (
                 <div className="text-text-secondary">Loading first question...</div>
            )}
        </div>
        
        <SoundButton />
      </main>
      
      {/* Footer: Remove question count, show gems/stars */}
      <Footer 
        // currentQuestion={currentQuestionIndex} // Removed
        // totalQuestions={totalQuestionsInModule} // Removed
        gems={gems} 
        stars={stars} 
      />
      
      {/* Celebration component might need adjustment or different trigger */}
      {/* <Celebration show={showCelebration} onComplete={() => {}} /> */}
      
      {/* Lesson Complete doesn't make sense here, remove or replace with Game Over */}

    </div>
  );
}
