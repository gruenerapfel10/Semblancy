import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from './Utils';

// Multiple choice question component
export const MultipleChoiceQuestion = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [readyForNext, setReadyForNext] = useState(false);
  
  const handleSelect = (option) => {
    if (status) return;
    
    setSelected(option);
    const isCorrect = option === question.correctAnswer;
    setStatus(isCorrect ? 'correct' : 'incorrect');
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    // Show feedback immediately
    setShowFeedback(true);
    
    // For correct answers, we can auto-proceed after a delay
    // For incorrect answers, wait for user to click "Next"
    if (isCorrect) {
      setTimeout(() => {
        onAnswer(isCorrect);
      }, 1500);
    } else {
      setReadyForNext(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const optionVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    correct: { 
      scale: [1, 1.05, 1],
      backgroundColor: "var(--success)",
      color: "white",
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    incorrect: { 
      scale: [1, 1.05, 1],
      backgroundColor: "var(--error)",
      color: "white",
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-lg mx-auto p-6"
    >
      {/* Question Header */}
      <div className="mb-8 text-center">
        <h3 className="text-xl font-bold text-text-primary mb-3">{question.question}</h3>
        {question.subtitle && (
          <p className="text-sm text-text-secondary">{question.subtitle}</p>
        )}
      </div>
      
      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option, i) => (
          <motion.button
            key={i}
            onClick={() => handleSelect(option)}
            disabled={status !== null}
            variants={optionVariants}
            initial="initial"
            whileHover={status ? "initial" : "hover"}
            whileTap={status ? "initial" : "tap"}
            animate={
              selected === option
                ? status === 'correct'
                  ? "correct"
                  : "incorrect"
                : status && option === question.correctAnswer
                ? "correct"
                : "initial"
            }
            className={`
              relative w-full p-4 rounded-2xl text-left
              ${status === null 
                ? 'bg-background-elevated hover:bg-background-alt border-2 border-border-light' 
                : selected === option
                ? status === 'correct'
                  ? 'bg-success/10 border-2 border-success'
                  : 'bg-error/10 border-2 border-error'
                : status && option === question.correctAnswer
                ? 'bg-success/10 border-2 border-success'
                : 'bg-background-elevated border-2 border-border-light opacity-50'
              }
            `}
          >
            {/* Option Content */}
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-medium">{option}</span>
              
              {/* Status Icon */}
              {status && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center
                    ${selected === option
                      ? status === 'correct'
                        ? 'bg-success text-white'
                        : 'bg-error text-white'
                      : status && option === question.correctAnswer
                      ? 'bg-success text-white'
                      : ''
                    }
                  `}
                >
                  <FontAwesomeIcon 
                    icon={selected === option 
                      ? status === 'correct' 
                        ? faCheck 
                        : faXmark
                      : status && option === question.correctAnswer
                      ? faCheck
                      : faXmark
                    } 
                    className="text-sm"
                  />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Feedback Message */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              mt-6 p-4 rounded-xl text-center
              ${status === 'correct' 
                ? 'bg-success/10 border border-success/20' 
                : 'bg-error/10 border border-error/20'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <FontAwesomeIcon 
                icon={status === 'correct' ? faCheck : faXmark} 
                className={`text-xl ${status === 'correct' ? 'text-success' : 'text-error'}`}
              />
              <p className={`font-bold ${status === 'correct' ? 'text-success' : 'text-error'}`}>
                {status === 'correct' ? 'Excellent!' : 'Not quite right...'}
              </p>
            </div>
            {status === 'incorrect' && (
              <p className="text-sm text-text-secondary">{question.explanation}</p>
            )}
            
            {/* Next Question Button for incorrect answers */}
            {readyForNext && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAnswer(false)}
                className="mt-4 px-6 py-2 bg-brand-primary text-white rounded-lg font-medium flex items-center justify-center mx-auto"
              >
                <span>Next Question</span>
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Calculation question component
export const CalculationQuestion = ({ question, onAnswer }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [status, setStatus] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [readyForNext, setReadyForNext] = useState(false);
  const inputRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (status) return;
    
    const isCorrect = userAnswer.trim() === question.answer.trim();
    setStatus(isCorrect ? 'correct' : 'incorrect');
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    // Always show answer for feedback
    setShowAnswer(true);
    
    // For correct answers, we can auto-proceed after a delay
    // For incorrect answers, wait for user to click "Next"
    if (isCorrect) {
      setTimeout(() => {
        onAnswer(isCorrect);
      }, 1500);
    } else {
      setReadyForNext(true);
    }
  };
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-lg mx-auto p-6"
    >
      {/* Question Header */}
      <div className="mb-8 text-center">
        <h3 className="text-xl font-bold text-text-primary mb-3">{question.question}</h3>
        {question.subtitle && (
          <p className="text-sm text-text-secondary">{question.subtitle}</p>
        )}
      </div>
      
      {/* Steps */}
      <div className="space-y-4 mb-8">
        {question.steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-background-alt rounded-xl border border-border-light"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-text-secondary text-sm">{step}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Answer Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={status !== null}
            placeholder="Type your answer here..."
            className={`
              w-full p-4 rounded-xl text-text-primary
              bg-background-elevated border-2
              focus:outline-none focus:ring-2 focus:ring-offset-2
              transition-all duration-200
              ${status === 'correct' 
                ? 'border-success focus:ring-success/20' 
                : status === 'incorrect'
                ? 'border-error focus:ring-error/20'
                : 'border-border-light focus:ring-brand-primary/20 focus:border-brand-primary'
              }
            `}
          />
          {status && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`
                absolute right-4 top-1/2 -translate-y-1/2
                w-6 h-6 rounded-full flex items-center justify-center
                ${status === 'correct' ? 'bg-success' : 'bg-error'}
              `}
            >
              <FontAwesomeIcon 
                icon={status === 'correct' ? faCheck : faXmark} 
                className="text-white text-sm"
              />
            </motion.div>
          )}
        </div>
        
        {!status && (
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 bg-brand-primary text-white rounded-xl font-semibold
                     hover:bg-brand-primary-dark transition-colors duration-200
                     flex items-center justify-center gap-2"
          >
            <span>Check Answer</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
          </motion.button>
        )}
      </form>
      
      {/* Feedback Message */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 rounded-xl bg-success/10 border border-success/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faCheck} className="text-success" />
              <p className="font-bold text-success">Correct Answer:</p>
            </div>
            <p className="text-success text-sm">{question.answer}</p>
            {question.explanation && (
              <p className="mt-2 text-xs text-text-secondary">{question.explanation}</p>
            )}
            
            {/* Next Question Button for incorrect answers */}
            {readyForNext && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAnswer(false)}
                className="mt-4 px-6 py-2 bg-brand-primary text-white rounded-lg font-medium flex items-center justify-center mx-auto"
              >
                <span>Next Question</span>
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 