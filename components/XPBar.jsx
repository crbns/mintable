import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import * as Progress from "react-native-progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LevelUpFlash } from "./ReanimatedAnimations";

/**
 * XP Bar component showing total XP and progress toward next level
 * Displays at the top of the Learn screen
 */
const XPBar = ({
  totalXP = 0,
  showLevelUp = false,
  onLevelUpComplete,
  containerStyles,
}) => {
  const [displayXP, setDisplayXP] = useState(totalXP);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);

  // Calculate current level and progress
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const xpInCurrentLevel = totalXP % 1000;
  const progressToNextLevel = xpInCurrentLevel / 1000;

  // Animate XP counter when totalXP changes
  useEffect(() => {
    if (totalXP !== displayXP) {
      const difference = totalXP - displayXP;
      const duration = 1500; // 1.5 seconds
      const steps = 30;
      const increment = difference / steps;
      let current = displayXP;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;

        if (step >= steps) {
          setDisplayXP(totalXP);
          clearInterval(timer);

          // Check if leveled up
          const newLevel = Math.floor(totalXP / 1000) + 1;
          if (newLevel > currentLevel && showLevelUp) {
            setShowLevelUpAnimation(true);
            // Auto-hide after 2 seconds
            setTimeout(() => {
              setShowLevelUpAnimation(false);
              onLevelUpComplete?.();
            }, 2000);
          }
        } else {
          setDisplayXP(Math.round(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [totalXP, displayXP, currentLevel, showLevelUp]);

  return (
    <View
      className={`border-2 border-alt-100 p-3 rounded-xl mt-3 ${containerStyles}`}
    >
      {/* Level up animation overlay */}
      {showLevelUpAnimation && (
        <View className="absolute inset-0 z-10 items-center justify-center bg-primary/80 rounded-xl">
          <LevelUpFlash />
          <Text className="text-white font-psemibold text-3xl mt-4">
            Level Up!
          </Text>
        </View>
      )}

      {/* Main XP display */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="fire" color="#ffaa5e" size={24} />
          <Text className="text-secondary font-psemibold text-lg ml-2">
            {displayXP.toLocaleString()} XP
          </Text>
        </View>

        <Text className="text-white font-pregular text-base">
          Level {currentLevel}
        </Text>
      </View>

      {/* Progress bar */}
      <Progress.Bar
        progress={progressToNextLevel}
        width={null}
        color="#ffaa5e"
        borderWidth={1}
        borderColor="#203c56"
        height={8}
        borderRadius={4}
        unfilledColor="#0a1929"
      />

      {/* Progress text */}
      <View className="flex-row justify-between mt-1">
        <Text className="text-white font-pregular text-xs">
          {xpInCurrentLevel} / 1000 XP
        </Text>
        <Text className="text-white font-pregular text-xs">
          {Math.round(progressToNextLevel * 100)}%
        </Text>
      </View>
    </View>
  );
};

export default XPBar;
