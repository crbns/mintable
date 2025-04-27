import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CButton from "./CButton";
import { router } from "expo-router";

const RoundLessonContainer = ({
  size,
  iconName,
  shortTitle,
  title,
  progress,
  href,
  description,
  id,
  setActive,
  active,
  containerStyles,
}) => {
  const isActive = active === id;

  const toggleTooltip = () => {
    setActive(isActive ? null : id);
  };

  return (
    <>
      <TouchableOpacity
        onPress={toggleTooltip}
        className={`self-auto items-center justify-center py-5 ${containerStyles}`}
        activeOpacity={0.8}
      >
        <View
          className={`p-5 justify-center items-center rounded-full border-4 border-alt-100`}
        >
          <MaterialCommunityIcons
            name={iconName ?? "lightbulb-on"}
            size={size ?? 32}
            color={"#ffaa5e"}
          />
        </View>

        {isActive && (
          <>
            <View className="visible z-10 absolute inset-0 bottom-3/4 items-center justify-center">
              <View className="bg-alt-200 text-white p-3 rounded-xl shadow-md shadow-primary-100 w-2/3">
                <View className="flex-row">
                  <Text className="text-white text-lg font-psemibold text-left">
                    {title ?? "Chapter"}
                  </Text>
                </View>
                <CButton
                  title={`${progress ? "Continue" : "Start"}${
                    progress ? ` (${progress})` : ""
                  }`}
                  containerStyles={"mt-1"}
                  handlePress={() => router.push(href)}
                />
              </View>
              <View className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-alt-200" />
            </View>
          </>
        )}
        <Text className="font-psemibold text-white mt-3 text-xl">
          {shortTitle ?? "Lesson"}
        </Text>
      </TouchableOpacity>
    </>
  );
};

export default RoundLessonContainer;
