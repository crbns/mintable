import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { ProgressUpdateAnimation } from "./LottieAnimation";

/**
 * Enhanced lesson node component for the Duolingo-style learning path
 * Shows progress, completion state, and XP rewards
 */
const LessonNode = ({
  lessonId,
  title,
  shortTitle,
  iconName = "lightbulb-on",
  maxXP = 250,
  progress = 0, // 0-1 for progress bar
  isCompleted = false,
  isInProgress = false,
  isSuggested = false,
  onPress,
  containerStyles,
  size = 80,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(progress);
  const [showProgressAnimation, setShowProgressAnimation] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animate progress changes
  useEffect(() => {
    if (progress !== animatedProgress) {
      setShowProgressAnimation(true);
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
        setShowProgressAnimation(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, animatedProgress]);

  // Pulse animation for suggested lessons
  useEffect(() => {
    if (isSuggested) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isSuggested, scaleAnim]);

  const handlePress = () => {
    // Scale down animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(lessonId);
  };

  const getNodeState = () => {
    if (isCompleted) return "completed";
    if (isInProgress) return "inProgress";
    if (isSuggested) return "suggested";
    return "notStarted";
  };

  const getNodeColors = () => {
    const state = getNodeState();
    switch (state) {
      case "completed":
        return {
          background: "#caffbf", // green
          border: "#caffbf",
          icon: "#0a1929",
          progress: "#caffbf",
        };
      case "inProgress":
        return {
          background: "#ffaa5e", // orange
          border: "#ffaa5e",
          icon: "#0a1929",
          progress: "#ffaa5e",
        };
      case "suggested":
        return {
          background: "#a0c4ff", // blue
          border: "#a0c4ff",
          icon: "#0a1929",
          progress: "#a0c4ff",
        };
      default: // notStarted
        return {
          background: "#203c56", // alt-100
          border: "#203c56",
          icon: "#ffaa5e",
          progress: "#ffaa5e",
        };
    }
  };

  const colors = getNodeColors();
  const nodeSize = size;
  const iconSize = nodeSize * 0.4;

  return (
    <View className={`items-center py-4 ${containerStyles}`}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          className="items-center justify-center"
        >
          {/* Main node circle */}
          <View
            className="items-center justify-center rounded-full border-4"
            style={{
              width: nodeSize,
              height: nodeSize,
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            {/* Progress ring for in-progress lessons */}
            {isInProgress && !isCompleted && (
              <View className="absolute inset-0 items-center justify-center">
                <Progress.Circle
                  size={nodeSize - 8}
                  progress={animatedProgress}
                  color={colors.progress}
                  borderWidth={0}
                  thickness={4}
                  unfilledColor="transparent"
                  strokeCap="round"
                />
                {showProgressAnimation && (
                  <View className="absolute">
                    <ProgressUpdateAnimation size="small" />
                  </View>
                )}
              </View>
            )}

            {/* Icon */}
            <MaterialCommunityIcons
              name={iconName}
              size={iconSize}
              color={colors.icon}
            />

            {/* Checkmark for completed lessons */}
            {isCompleted && (
              <View className="absolute -top-1 -right-1 bg-green-400 rounded-full p-1">
                <MaterialCommunityIcons name="check" size={16} color="white" />
              </View>
            )}

            {/* Suggested indicator */}
            {isSuggested && !isCompleted && (
              <View className="absolute -top-1 -right-1 bg-blue-400 rounded-full p-1">
                <MaterialCommunityIcons name="star" size={12} color="white" />
              </View>
            )}
          </View>

          {/* Title */}
          <Text className="font-psemibold text-white mt-2 text-center text-sm max-w-20">
            {shortTitle || title}
          </Text>

          {/* XP amount */}
          <Text className="font-pregular text-secondary text-xs mt-1">
            {maxXP} XP
          </Text>

          {/* Progress text for in-progress lessons */}
          {isInProgress && !isCompleted && (
            <Text className="font-pregular text-white text-xs mt-1">
              {Math.round(animatedProgress * 100)}%
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default LessonNode;
