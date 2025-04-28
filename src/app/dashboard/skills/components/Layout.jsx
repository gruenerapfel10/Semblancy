import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import { Hearts, ProgressBar, Streak, Rewards } from './GameElements';
import { playSound } from './Utils';

// Header component with progress and game stats
export const Header = ({ progress, hearts, streak, onBack }) => {
  return (
    <header className="bg-background border-b border-border-light py-2">
      <div className="max-w-screen-lg mx-auto px-4 flex items-center">
        <button 
          onClick={onBack}
          className="mr-3 text-text-secondary hover:text-text-primary"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
        </button>
        
        <div className="flex-1">
          <ProgressBar progress={progress} />
        </div>
        
        <div className="ml-3 flex items-center space-x-3">
          <Hearts hearts={hearts} />
          <Streak count={streak} />
        </div>
      </div>
    </header>
  );
};

// Footer component with question counter and rewards
export const Footer = ({ currentQuestion, totalQuestions, gems, stars }) => {
  return (
    <footer className="bg-background border-t border-border-light py-2 px-4">
      <div className="max-w-screen-lg mx-auto flex justify-between items-center">
        <div className="text-sm text-text-secondary">
          Question {currentQuestion + 1} of {totalQuestions}
        </div>
        <Rewards gems={gems} stars={stars} />
      </div>
    </footer>
  );
};

// Sound control button
export const SoundButton = () => {
  return (
    <button 
      className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-background border border-border-light shadow-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-background-alt"
      onClick={() => playSound('button')}
    >
      <FontAwesomeIcon icon={faVolumeHigh} className="text-sm" />
    </button>
  );
}; 