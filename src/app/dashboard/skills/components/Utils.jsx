// Sound effects utility
export const playSound = (type) => {
  // In a real implementation, this would play the actual sound
  console.log(`Playing sound: ${type}`);
  
  // Placeholder for actual sound implementation
  // const audio = new Audio(`/sounds/${type}.mp3`);
  // audio.play();
};

// Common animation variants
export const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  popIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  }
};

// Feedback messages
export const feedbackMessages = {
  correct: [
    "Excellent!",
    "Perfect!",
    "Well done!",
    "That's right!",
    "Amazing!",
    "You got it!",
    "Fantastic!"
  ],
  incorrect: [
    "Not quite right...",
    "Try again!",
    "Almost there!",
    "Let's try once more!",
    "You can do this!"
  ]
};

// Get random item from array
export const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
}; 