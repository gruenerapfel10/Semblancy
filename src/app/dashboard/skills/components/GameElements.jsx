import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faFire, faGem, faStar } from '@fortawesome/free-solid-svg-icons';

// Hearts display component
export const Hearts = ({ hearts }) => {
  return (
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <FontAwesomeIcon 
          key={i} 
          icon={faHeart} 
          className={`text-xl ${i < hearts ? 'text-error' : 'text-text-tertiary'}`} 
        />
      ))}
    </div>
  );
};

// Progress bar component
export const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-background-alt rounded-full h-2.5">
      <div 
        className="bg-brand-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Streak counter component
export const Streak = ({ count }) => {
  return (
    <div className="flex items-center bg-warning/10 px-3 py-1 rounded-full">
      <FontAwesomeIcon icon={faFire} className="text-warning mr-1.5" />
      <span className="font-bold text-warning">{count}</span>
    </div>
  );
};

// Rewards display component
export const Rewards = ({ gems, stars }) => {
  return (
    <div className="flex space-x-3">
      <div className="flex items-center">
        <FontAwesomeIcon icon={faGem} className="text-brand-primary mr-1" />
        <span className="font-bold text-text-primary">{gems}</span>
      </div>
      <div className="flex items-center">
        <FontAwesomeIcon icon={faStar} className="text-warning mr-1" />
        <span className="font-bold text-text-primary">{stars}</span>
      </div>
    </div>
  );
}; 