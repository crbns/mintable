import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

const OutlineButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isDisabled,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={` rounded-xl justify-center min-h-[62px] items-center border-2 border-b-4 flex-1  ${
        containerStyles ?? "border-alt-100"
      } ${isDisabled ? "opacity-50" : ""}`}
      disabled={isDisabled}
    >
      <Text
        className={`text-white font-pregular text-lg text-center ${textStyles}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default OutlineButton;
