import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import * as Progress from "react-native-progress";

const OutlineButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isDisabled,
  progress,
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
      {/* Progress bar at the bottom */}
      {progress !== undefined && (
        <View className="absolute bottom-0 left-0 right-0">
          <Progress.Bar
            progress={progress}
            width={null}
            height={4}
            color="#10b981"
            unfilledColor="transparent"
            borderWidth={0}
            borderRadius={0}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default OutlineButton;
