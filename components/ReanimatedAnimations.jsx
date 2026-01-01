import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * Reanimated animations for better performance than Lottie
 * Used for simple UI feedback animations
 */

// Wrong Answer Shake Animation
export const WrongAnswerShake = ({ onComplete, style }) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 }, () => {
        if (onComplete) runOnJS(onComplete)();
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[animatedStyle, style]}
      className="justify-center items-center"
    >
      <MaterialCommunityIcons name="close-circle" size={40} color="#ff6b6b" />
    </Animated.View>
  );
};

// Loading Spinner
export const LoadingSpinner = ({ size = 50, color = "#ffaa5e" }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1, // Infinite
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <MaterialCommunityIcons name="loading" size={size} color={color} />
    </Animated.View>
  );
};

// XP Counter with number animation
export const XPCounter = ({ xpAmount, onComplete, style }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withTiming(1, { duration: 300 }, () => {
      if (onComplete) runOnJS(onComplete)();
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <View className="items-center">
        <MaterialCommunityIcons
          name="star-shooting-outline"
          size={60}
          color="#ffaa5e"
        />
        <Text className="text-secondary font-psemibold text-4xl mt-2">
          +{xpAmount}
        </Text>
      </View>
    </Animated.View>
  );
};

// Level Up Flash
export const LevelUpFlash = ({ level, onComplete, style }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 2000 }),
      withTiming(0, { duration: 300 }, () => {
        if (onComplete) runOnJS(onComplete)();
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <View className="items-center bg-secondary/20 rounded-full p-8">
        <MaterialCommunityIcons
          name="chevron-triple-up"
          size={60}
          color="#ffaa5e"
        />
        <Text className="text-secondary font-psemibold text-5xl mt-2">
          LEVEL {level}!
        </Text>
      </View>
    </Animated.View>
  );
};

// Perfect Score Celebration
export const PerfectScoreCelebration = ({ onComplete, style }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8 });
    opacity.value = withTiming(1, { duration: 300 });
    rotation.value = withSequence(
      withTiming(360, { duration: 1000 }),
      withTiming(360, { duration: 1500 }, () => {
        if (onComplete) runOnJS(onComplete)();
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <View className="items-center">
        <MaterialCommunityIcons name="star" size={80} color="#ffd700" />
        <Text className="text-yellow-400 font-psemibold text-3xl mt-2">
          PERFECT!
        </Text>
      </View>
    </Animated.View>
  );
};

// Circular Progress Animation
export const CircularProgressAnimation = ({
  progress,
  size = 60,
  color = "#ffaa5e",
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  // This is a simplified version - actual circular progress uses SVG or Progress.Circle
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedProgress.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <MaterialCommunityIcons name="circle-slice-8" size={size} color={color} />
    </Animated.View>
  );
};

// Unlock Animation (fade + scale up)
export const UnlockAnimation = ({ onComplete, style }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withTiming(1, { duration: 500 }, () => {
      if (onComplete) runOnJS(onComplete)();
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <MaterialCommunityIcons
        name="lock-open-variant"
        size={50}
        color="#a0c4ff"
      />
    </Animated.View>
  );
};

// Milestone Celebration (particle burst effect with icons)
export const MilestoneCelebration = ({ onComplete, style }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.5, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(1, { duration: 2500 }),
      withTiming(0, { duration: 200 }, () => {
        if (onComplete) runOnJS(onComplete)();
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <View className="items-center">
        <MaterialCommunityIcons
          name="star-four-points"
          size={100}
          color="#ffd700"
        />
        <Text className="text-yellow-400 font-psemibold text-2xl mt-2">
          MILESTONE!
        </Text>
      </View>
    </Animated.View>
  );
};

// Path Connector Draw Animation
export const PathConnectorDraw = ({ height = 30 }) => {
  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withTiming(height, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <Animated.View
      style={[animatedStyle, { width: 4, backgroundColor: "#203c56" }]}
      className="rounded-full"
    />
  );
};

export default {
  WrongAnswerShake,
  LoadingSpinner,
  XPCounter,
  LevelUpFlash,
  PerfectScoreCelebration,
  CircularProgressAnimation,
  UnlockAnimation,
  MilestoneCelebration,
  PathConnectorDraw,
};
