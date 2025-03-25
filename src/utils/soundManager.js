// Sound manager utility for flashcards app

// Cache audio instances to prevent recreation
const audioCache = {
  'card-flip': typeof Audio !== 'undefined' ? new Audio('/sounds/card-flip.mp3') : null,
  'success': typeof Audio !== 'undefined' ? new Audio('/sounds/success.mp3') : null,
  'error': typeof Audio !== 'undefined' ? new Audio('/sounds/error.mp3') : null
};

/**
 * Preload all audio files
 */
export const preloadSounds = () => {
  if (typeof window === 'undefined') return; // Skip on server
  
  // Load each sound
  Object.values(audioCache).forEach(audio => {
    if (audio) {
      audio.load();
    }
  });
};

/**
 * Play a sound effect
 * @param {string} type - The type of sound to play ('card-flip', 'success', 'error')
 * @param {boolean} soundEnabled - Whether sound is enabled
 */
export const playSound = (type, soundEnabled = true) => {
  if (!soundEnabled || typeof window === 'undefined') return;
  
  const audio = audioCache[type];
  if (audio) {
    // Reset audio to beginning and play
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn(`Failed to play sound: ${type}`, err);
    });
  }
};

/**
 * Check if sounds are available (primarily for testing)
 * @returns {boolean} - Whether sounds are available
 */
export const areSoundsAvailable = () => {
  return typeof Audio !== 'undefined' && 
    Object.values(audioCache).some(audio => audio !== null);
};

export default {
  playSound,
  preloadSounds,
  areSoundsAvailable
}; 