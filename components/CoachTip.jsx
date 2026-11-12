import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PlatformIconButton from "./PlatformIconButton";

// One short, dismissible nudge that links what the user just did to a lesson
const CoachTip = ({ message, lessonTitle, cta, onOpenLesson, onDismiss }) => (
  <View className="flex-row items-start bg-alt-100 rounded-xl mt-4 pl-4 py-1">
    <MaterialCommunityIcons
      name="school-outline"
      size={22}
      color="#ffaa5e"
      style={{ marginTop: 12 }}
    />
    <View className="flex-1 ml-3 py-2">
      <Text className="text-white font-pregular text-base">{message}</Text>
      <Pressable
        onPress={onOpenLesson}
        accessibilityRole="link"
        accessibilityLabel={`Open lesson: ${lessonTitle}`}
        className="self-start min-h-[44px] justify-center"
      >
        <Text className="text-secondary font-psemibold text-base">
          {cta}
        </Text>
      </Pressable>
    </View>
    <PlatformIconButton
      icon="close"
      onPress={onDismiss}
      accessibilityLabel="Hide this tip"
    />
  </View>
);

export default CoachTip;
