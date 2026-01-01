import { Text, ActivityIndicator, Pressable } from "react-native";
import React from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

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
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    translateY.value = withSpring(2, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.05, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabledd || isWorking}
      className={containerStyles}
    >
      <Animated.View
        style={animatedStyle}
        className={`${
          containerColor ?? "bg-secondary"
        } rounded-xl justify-center min-h-[50px] items-center  ${
          disabledd ? "opacity-50" : ""
        }`}
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
      </Animated.View>
    </Pressable>
  );
};

export default CButton;
