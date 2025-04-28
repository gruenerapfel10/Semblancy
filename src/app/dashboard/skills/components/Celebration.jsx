import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faStar, faGem, faBolt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { playSound } from './Utils';

// Celebration modal component
export const Celebration = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      // Play celebration sound
      playSound('celebration');
      
      // Complete celebration after animation duration
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="bg-white rounded-xl p-8 shadow-xl z-10 text-center max-w-xs"
      >
        <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 text-5xl mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Great job!</h2>
        <p className="text-gray-600 mb-4">You've completed this lesson!</p>
        <div className="flex justify-center space-x-4 mb-2">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-xl" />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>
            <FontAwesomeIcon icon={faGem} className="text-purple-500 text-xl" />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>
            <FontAwesomeIcon icon={faBolt} className="text-blue-500 text-xl" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// Lesson completion screen component
export const LessonComplete = ({ gems, onContinue, onPracticeAgain }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 text-5xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Lesson Complete!</h1>
        <p className="text-gray-600 mb-8">You've earned {gems} gems and 1 star!</p>
        
        <div className="flex flex-col space-y-3">
          <button 
            onClick={onContinue}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Continue
          </button>
          <button 
            onClick={onPracticeAgain}
            className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}; 