import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";
import {
  ANIMATIONS,
  ANIMATION_DURATIONS,
  isReanimatedAnimation,
} from "../constants/animations";
import {
  WrongAnswerShake,
  LoadingSpinner,
  XPCounter as ReanimatedXPCounter,
  LevelUpFlash as ReanimatedLevelUp,
  PerfectScoreCelebration as ReanimatedPerfectScore,
  UnlockAnimation as ReanimatedUnlock,
  MilestoneCelebration as ReanimatedMilestone,
} from "./ReanimatedAnimations";

/**
 * Unified animation component that handles both Lottie and Reanimated animations
 * Automatically selects the right animation type based on the animationType
 */
const LottieAnimation = ({
  animationType,
  customSource,
  autoPlay = true,
  loop = false,
  onAnimationFinish,
  style,
  size = "medium",
  testID,
  accessibilityLabel,
  // Props specific to Reanimated animations
  xpAmount,
  level,
  progress,
}) => {
  const animationRef = useRef(null);
  const source = customSource || ANIMATIONS[animationType];

  // Check for reduced motion preference
  const reducedMotion = false; // TODO: Get from user preferences

  useEffect(() => {
    if (autoPlay && animationRef.current && !reducedMotion) {
      animationRef.current.play();
    }
  }, [autoPlay, reducedMotion]);

  // If reduced motion is enabled, don't render the animation
  if (reducedMotion) {
    return null;
  }

  // Size presets
  const sizeStyles = {
    small: { width: 50, height: 50 },
    medium: { width: 100, height: 100 },
    large: { width: 200, height: 200 },
    fullscreen: { width: 300, height: 300 },
  };

  const animationStyle = {
    ...sizeStyles[size],
    ...style,
  };

  // Handle Reanimated animations
  if (isReanimatedAnimation(animationType)) {
    switch (animationType) {
      case "WRONG_ANSWER":
        return (
          <WrongAnswerShake
            onComplete={onAnimationFinish}
            style={animationStyle}
          />
        );
      case "LOADING":
        return <LoadingSpinner size={sizeStyles[size].width} color="#ffaa5e" />;
      case "XP_COUNTER":
        return (
          <ReanimatedXPCounter
            xpAmount={xpAmount || 0}
            onComplete={onAnimationFinish}
            style={animationStyle}
          />
        );
      case "LEVEL_UP":
        return (
          <ReanimatedLevelUp
            level={level || 1}
            onComplete={onAnimationFinish}
            style={animationStyle}
          />
        );
      case "PERFECT_SCORE":
        return (
          <ReanimatedPerfectScore
            onComplete={onAnimationFinish}
            style={animationStyle}
          />
        );
      case "UNLOCK":
        return (
          <ReanimatedUnlock
            onComplete={onAnimationFinish}
            style={animationStyle}
          />
        );
      case "MILESTONE":
        return (
          <ReanimatedMilestone
            onComplete={onAnimationFinish}
            style={animationStyle}
          />
        );
      case "PROGRESS_UPDATE":
      case "PATH_CONNECTOR":
        // These are handled inline in components - just return null
        return null;
      default:
        console.warn(`Reanimated animation not implemented: ${animationType}`);
        return null;
    }
  }

  // Handle Lottie animations
  if (!source) {
    console.warn(
      `LottieAnimation: No source found for animationType: ${animationType}`
    );
    return null;
  }

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessible={!!accessibilityLabel}
    >
      <LottieView
        ref={animationRef}
        source={source}
        autoPlay={false}
        loop={loop}
        onAnimationFinish={onAnimationFinish}
        onAnimationLoaded={() => {
          if (autoPlay && !reducedMotion && animationRef.current) {
            animationRef.current.play();
          }
        }}
        style={animationStyle}
        resizeMode="contain"
      />
    </View>
  );
};

/**
 * Pre-configured animation components for common use cases
 */

// Quick feedback animations (0.5s)
export const CorrectAnswerAnimation = (props) => (
  <LottieAnimation
    animationType="STAR_BURST"
    autoPlay={true}
    loop={false}
    size="medium"
    testID="correct-answer-animation"
    accessibilityLabel="Correct answer feedback"
    {...props}
  />
);

export const WrongAnswerAnimation = (props) => (
  <LottieAnimation
    animationType="WRONG_ANSWER"
    autoPlay={true}
    loop={false}
    size="small"
    testID="wrong-answer-animation"
    accessibilityLabel="Incorrect answer feedback"
    {...props}
  />
);

// Celebration animations
export const LessonCompleteAnimation = (props) => (
  <LottieAnimation
    animationType="LESSON_COMPLETE"
    autoPlay={true}
    loop={false}
    testID="lesson-complete-animation"
    accessibilityLabel="Lesson completed celebration"
    {...props}
  />
);

export const PerfectScoreAnimation = (props) => (
  <LottieAnimation
    animationType="PERFECT_SCORE"
    autoPlay={true}
    loop={false}
    testID="perfect-score-animation"
    accessibilityLabel="Perfect score celebration"
    {...props}
  />
);

export const TrophyAnimation = (props) => (
  <LottieAnimation
    animationType="TROPHY"
    autoPlay={true}
    loop={false}
    size="large"
    testID="trophy-animation"
    accessibilityLabel="Achievement trophy"
    {...props}
  />
);

// XP and progress animations
export const XPCounterAnimation = (props) => (
  <LottieAnimation
    animationType="XP_COUNTER"
    autoPlay={true}
    loop={false}
    size="medium"
    testID="xp-counter-animation"
    accessibilityLabel="XP points counter"
    {...props}
  />
);

export const LevelUpAnimation = (props) => (
  <LottieAnimation
    animationType="LEVEL_UP"
    autoPlay={true}
    loop={false}
    size="fullscreen"
    testID="level-up-animation"
    accessibilityLabel="Level up celebration"
    {...props}
  />
);

// UI feedback animations
export const LoadingAnimation = (props) => (
  <LottieAnimation
    animationType="LOADING"
    autoPlay={true}
    loop={true}
    size="medium"
    testID="loading-animation"
    accessibilityLabel="Loading content"
    {...props}
  />
);

export const ProgressUpdateAnimation = (props) => (
  <LottieAnimation
    animationType="PROGRESS_UPDATE"
    autoPlay={true}
    loop={false}
    size="small"
    testID="progress-update-animation"
    accessibilityLabel="Progress updated"
    {...props}
  />
);

export const UnlockAnimation = (props) => (
  <LottieAnimation
    animationType="UNLOCK"
    autoPlay={true}
    loop={false}
    size="medium"
    testID="unlock-animation"
    accessibilityLabel="Content unlocked"
    {...props}
  />
);

// Utility functions
export const playAnimation = (animationRef) => {
  if (animationRef?.current) {
    animationRef.current.play();
  }
};

export const pauseAnimation = (animationRef) => {
  if (animationRef?.current) {
    animationRef.current.pause();
  }
};

export const resetAnimation = (animationRef) => {
  if (animationRef?.current) {
    animationRef.current.reset();
  }
};

export default LottieAnimation;
