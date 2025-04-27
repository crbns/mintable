import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const IconButton = ({
  iconName,
  iconSize,
  iconColor,
  handlePress,
  containerStyles,
  containerColor,
  textStyles,
  disabledd,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`${
        containerColor ?? "bg-secondary"
      } rounded-xl justify-center min-h-[50px] items-center ${containerStyles} ${
        disabledd ? "opacity-50" : ""
      }`}
      disabled={disabledd}
    >
      <MaterialCommunityIcons
        name={iconName ?? "abjad-arabic"}
        size={iconSize ?? 32}
        color={iconColor ?? "#0d2b45"}
      />
    </TouchableOpacity>
  );
};

export default IconButton;
