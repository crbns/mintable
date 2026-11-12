import { View, Text, Pressable } from "react-native";
import React from "react";
import { GOAL_COLORS } from "../constants/goalColors";

const ColorSwatches = ({ value, onChange, containerStyles }) => {
  return (
    <View className={containerStyles}>
      <Text className="text-base text-gray-100 font-pmedium mx-2">Color</Text>
      <View
        className="flex-row justify-between mt-2 mx-2"
        accessibilityRole="radiogroup"
      >
        {GOAL_COLORS.map((color) => {
          const selected = color.value === value;
          return (
            <Pressable
              key={color.value}
              onPress={() => onChange(color.value)}
              hitSlop={6}
              accessibilityRole="radio"
              accessibilityLabel={color.label}
              accessibilityState={{ checked: selected }}
              className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
                selected ? "border-white" : "border-transparent"
              }`}
            >
              <View
                className="w-7 h-7 rounded-full"
                style={{ backgroundColor: color.value }}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default ColorSwatches;
