import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";

const CButton = ({
  title,
  handlePress,
  containerStyles,
  containerColor,
  textStyles,
  textColor,
  textWeight,
  disabledd,
  isWorking,
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
      {isWorking ? (
        <ActivityIndicator color={"#0d2b45"} />
      ) : (
        <Text
          className={`${textColor ?? "text-primary"} ${
            textWeight ?? "font-psemibold"
          } text-lg ${textStyles}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CButton;
