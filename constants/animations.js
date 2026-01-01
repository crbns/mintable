// Animation constants for Lottie and Reanimated animations used throughout the Learn feature
// LOTTIE: reference animation files in assets/animations/
// REANIMATED: use react-native-reanimated for better performance

export const ANIMATIONS = {
  // Existing Lottie animations
  TROPHY: require("../assets/animations/trophy.lottie"),
  CHECKMARK_CONFETTI: require("../assets/animations/checkmark_with_confetti.lottie"),
  STAR_BURST: require("../assets/animations/star_burst.lottie"),
  FIRE_FLAME: require("../assets/animations/fire_flame.lottie"),

  // Existing confetti
  LESSON_COMPLETE: require("../assets/animations/confetti.json"),
  FIRST_LESSON: require("../assets/animations/trophy.lottie"),

  // Use Reanimated for these (better performance, no file downloads needed)
  WRONG_ANSWER: "REANIMATED", // Shake animation
  PERFECT_SCORE: "REANIMATED", // Scale + fade celebration
  MILESTONE: "REANIMATED", // Particle burst
  XP_COUNTER: "REANIMATED", // Number count-up
  LEVEL_UP: "REANIMATED", // Flash + scale
  LOADING: "REANIMATED", // Spinner
  PROGRESS_UPDATE: "REANIMATED", // Circular progress
  UNLOCK: "REANIMATED", // Fade + scale
  PATH_CONNECTOR: "REANIMATED", // Line draw
};

// Animation types for easy identification
export const ANIMATION_TYPES = {
  LOTTIE: "LOTTIE",
  REANIMATED: "REANIMATED",
};

// Check if animation should use Reanimated
export const isReanimatedAnimation = (animationType) => {
  return ANIMATIONS[animationType] === "REANIMATED";
};

// Animation trigger map for easy reference
export const ANIMATION_TRIGGERS = {
  // Quiz interactions
  CORRECT_ANSWER: "STAR_BURST",
  WRONG_ANSWER: "WRONG_ANSWER",

  // Completion celebrations
  LESSON_COMPLETE: "LESSON_COMPLETE",
  PERFECT_SCORE: "PERFECT_SCORE",
  FIRST_LESSON: "FIRST_LESSON",
  MILESTONE: "MILESTONE",

  // XP and rewards
  XP_COUNTER: "XP_COUNTER",
  LEVEL_UP: "LEVEL_UP",

  // UI feedback
  LOADING: "LOADING",
  PROGRESS_UPDATE: "PROGRESS_UPDATE",
  UNLOCK: "UNLOCK",
  PATH_CONNECTOR: "PATH_CONNECTOR",

  // Future enhancements
  STREAK: "FIRE_FLAME",
};

// Animation timing constants (in milliseconds)
export const ANIMATION_DURATIONS = {
  QUICK_FEEDBACK: 500, // 0.5s - star bursts, error shakes
  MEDIUM_CELEBRATION: 1500, // 1.5s - XP counters, lesson completion
  BIG_CELEBRATION: 3000, // 3s - perfect scores, milestones
  LEVEL_UP: 2500, // 2.5s - level up animations
  LOADING: 2000, // 2s - loading animations (loop)
};

// Animation sizes for consistent scaling
export const ANIMATION_SIZES = {
  SMALL: { width: 50, height: 50 }, // Error crosses, small feedback
  MEDIUM: { width: 100, height: 100 }, // Star bursts, progress indicators
  LARGE: { width: 200, height: 200 }, // Celebrations, confetti
  FULLSCREEN: { width: 300, height: 300 }, // Major achievements
};

// Helper function to get animation config
export const getAnimationConfig = (animationType) => {
  const animation = ANIMATIONS[animationType];
  const trigger = ANIMATION_TRIGGERS[animationType];

  if (!animation) {
    console.warn(`Animation ${animationType} not found`);
    return null;
  }

  return {
    source: animation,
    trigger,
    isReanimated: animation === "REANIMATED",
    duration:
      ANIMATION_DURATIONS[animationType] ||
      ANIMATION_DURATIONS.MEDIUM_CELEBRATION,
    size: ANIMATION_SIZES.MEDIUM,
  };
};

// Animation categories for organization
export const ANIMATION_CATEGORIES = {
  FEEDBACK: ["STAR_BURST", "WRONG_ANSWER"],
  CELEBRATION: [
    "LESSON_COMPLETE",
    "PERFECT_SCORE",
    "FIRST_LESSON",
    "MILESTONE",
  ],
  PROGRESS: ["PROGRESS_UPDATE", "UNLOCK", "PATH_CONNECTOR"],
  LOADING: ["LOADING"],
  REWARDS: ["XP_COUNTER", "LEVEL_UP"],
  FUTURE: ["FIRE_FLAME"],
};
