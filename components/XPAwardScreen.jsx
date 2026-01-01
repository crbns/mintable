import React, { useEffect, useState } from "react";
import { View, Text, Modal } from "react-native";
import CButton from "./CButton";
import {
  LessonCompleteAnimation,
  PerfectScoreAnimation,
} from "./LottieAnimation";
import { XPCounter } from "./ReanimatedAnimations";

/**
 * XP Award Screen shown after completing a lesson
 * Displays animated XP counter and celebration
 */
const XPAwardScreen = ({
  visible,
  onContinue,
  xpEarned = 0,
  score = 0,
  maxScore = 10,
  isPerfectScore = false,
  isFirstCompletion = false,
}) => {
  const [displayXP, setDisplayXP] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animate XP counter
  useEffect(() => {
    if (visible && xpEarned > 0) {
      const duration = 2000; // 2 seconds
      const steps = 40;
      const increment = xpEarned / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;

        if (step >= steps) {
          setDisplayXP(xpEarned);
          setShowCelebration(true);
          clearInterval(timer);
        } else {
          setDisplayXP(Math.round(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [visible, xpEarned]);

  const getScorePercentage = () => {
    return Math.round((score / maxScore) * 100);
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return "Excellent work!";
    if (percentage >= 70) return "Great job!";
    if (percentage >= 50) return "Good effort!";
    return "Keep practicing!";
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return "text-green-400";
    if (percentage >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinue}
    >
      <View className="flex-1 bg-black/80 items-center justify-center p-6">
        <View className="bg-alt-200 rounded-2xl p-6 w-full max-w-sm items-center relative">
          {/* Celebration Animation - Full Modal Size */}
          <View className="absolute inset-0 items-center justify-center">
            {isPerfectScore ? (
              <PerfectScoreAnimation
                size="fullscreen"
                autoPlay={showCelebration}
              />
            ) : (
              <LessonCompleteAnimation
                size="fullscreen"
                autoPlay={showCelebration}
              />
            )}
          </View>
          {/* Score Display */}
          <View className="items-center mb-4">
            <Text className="text-white font-psemibold text-2xl mb-2">
              Lesson Complete!
            </Text>
            <Text className={`font-psemibold text-xl ${getScoreColor()}`}>
              {score}/{maxScore} ({getScorePercentage()}%)
            </Text>
            <Text className="text-white font-pregular text-base mt-1">
              {getScoreMessage()}
            </Text>
          </View>

          {/* XP Counter with Reanimated Animation */}
          <View className="items-center mb-4">
            {showCelebration && <XPCounter xpAmount={xpEarned} />}
          </View>

          {/* Special Messages */}
          {isPerfectScore && (
            <View className="bg-green-900/30 rounded-lg p-3 mb-4 items-center">
              <Text className="text-green-400 font-psemibold text-sm">
                🎯 Perfect Score!
              </Text>
            </View>
          )}

          {isFirstCompletion && (
            <View className="bg-blue-900/30 rounded-lg p-3 mb-4 items-center">
              <Text className="text-blue-400 font-psemibold text-sm">
                🏆 First Completion Bonus!
              </Text>
            </View>
          )}
          {/* Continue Button */}
          <CButton
            title="Continue Learning"
            handlePress={onContinue}
            containerStyles="w-full"
          />
        </View>
      </View>
    </Modal>
  );
};

export default XPAwardScreen;
