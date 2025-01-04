import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

const CButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  disabledd,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-secondary rounded-xl justify-center min-h-[62px] items-center ${containerStyles} ${
        disabledd ? "opacity-50" : ""
      }`}
      disabled={disabledd}
    >
      <Text className={`text-primary font-psemibold text-lg ${textStyles}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CButton;
