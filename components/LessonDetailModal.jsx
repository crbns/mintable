import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CButton from "./CButton";
import { TrophyAnimation } from "./LottieAnimation";

/**
 * Modal that shows lesson details before starting
 * Displays title, description, XP reward, and previous performance
 */
const LessonDetailModal = ({
  visible,
  onClose,
  onStartLesson,
  lesson = {},
  previousScore = null,
  isCompleted = false,
  isLoading = false,
}) => {
  const {
    title = "Lesson Title",
    description = "Learn about this important budgeting concept.",
    maxXP = 250,
    iconName = "lightbulb-on",
    shortTitle,
  } = lesson || {};

  const getScoreColor = (score, maxScore) => {
    if (!score || !maxScore) return "text-white";
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "text-green-400";
    if (percentage >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreText = (score, maxScore) => {
    if (!score || !maxScore) return "";
    const percentage = Math.round((score / maxScore) * 100);
    return `${score}/${maxScore} (${percentage}%)`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-5">
        <View className="bg-alt-200 rounded-2xl p-6 w-full max-w-sm">
          {/* Header with close button */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-white font-psemibold text-xl">{title}</Text>
              {shortTitle && shortTitle !== title && (
                <Text className="text-secondary font-pregular text-base mt-1">
                  {shortTitle}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 -mt-2 -mr-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Lesson icon and XP */}
          <View className="items-center mb-4">
            <View className="bg-primary p-4 rounded-full border-2 border-alt-100 mb-3">
              <MaterialCommunityIcons
                name={iconName}
                size={40}
                color="#ffaa5e"
              />
            </View>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="fire" size={20} color="#ffaa5e" />
              <Text className="text-secondary font-psemibold text-lg ml-2">
                {maxXP} XP
              </Text>
            </View>
          </View>

          {/* Description */}
          <ScrollView className="max-h-24 mb-4">
            <Text className="text-white font-pregular text-base leading-5">
              {description}
            </Text>
          </ScrollView>

          {/* Previous performance */}
          {previousScore && (
            <View className="bg-primary/50 rounded-lg p-3 mb-4">
              <Text className="text-white font-psemibold text-sm mb-1">
                Previous Attempt
              </Text>
              <Text
                className={`font-pregular text-base ${getScoreColor(
                  previousScore.score,
                  previousScore.maxScore
                )}`}
              >
                {getScoreText(previousScore.score, previousScore.maxScore)}
              </Text>
              <Text className="text-gray-400 font-pregular text-xs mt-1">
                {new Date(previousScore.lastAttempted).toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Completion indicator */}
          {isCompleted && (
            <View className="flex-row items-center bg-green-900/30 rounded-lg p-3 mb-4">
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#caffbf"
              />
              <Text className="text-green-400 font-psemibold text-sm ml-2">
                Completed
              </Text>
            </View>
          )}

          {/* Trophy animation for first completion */}
          {isCompleted && !previousScore && (
            <View className="items-center mb-4">
              <TrophyAnimation size="medium" />
            </View>
          )}

          {/* Action buttons */}
          <View className="gap-3">
            <CButton
              title={isCompleted ? "Practice Again" : "Start Lesson"}
              handlePress={onStartLesson}
              disabled={isLoading}
              containerStyles={isLoading ? "opacity-50" : ""}
            />

            <TouchableOpacity
              onPress={onClose}
              className="items-center py-3"
              disabled={isLoading}
            >
              <Text className="text-gray-400 font-pregular text-base">
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LessonDetailModal;
