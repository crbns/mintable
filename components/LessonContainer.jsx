import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import React, { useState, useRef } from "react";
import CButton from "./CButton";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LessonContainer = ({
  title,
  chapterTitle,
  chapterEmoji,
  progress,
  progressMax,
  href,
  inProgress,
  complete,
  completeDate,
  score,
  containerStyles,
}) => {
  const buttonText = "Start";
  const [open, setOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleOpen = () => {
    setOpen(!open);

    Animated.parallel(
      (Animated.timing(slideAnim, {
        toValue: open ? 0 : 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(),
      Animated.timing(rotateAnim, {
        toValue: open ? 0 : 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      })).start()
    );
  };

  const contentHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [55, 200],
  });

  const rotateIcon = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <TouchableOpacity
      onPress={toggleOpen}
      activeOpacity={0.9}
      className={`${containerStyles}`}
    >
      <View className="border-4 border-alt-100 rounded-xl">
        <Animated.View style={{ height: contentHeight, overflow: "hidden" }}>
          <View>
            <View className="flex-row">
              <View>
                <Text className="px-3 pt-3 text-3xl text-white font-pregular">
                  {title ?? null}
                </Text>
                <Text className="px-3 text-xl text-gray-500 font-pslim">
                  {chapterTitle ?? null}
                </Text>
              </View>
              <Text className="flex-1 text-right px-3 pt-3 text-4xl align-middle">
                {chapterEmoji ?? "📚"}
              </Text>
            </View>
            <View className="p-5">
              <CButton
                title={inProgress ? "Continue" : "Start"}
                handlePress={() => router.push(href)}
              />
            </View>
          </View>
        </Animated.View>
        <Animated.View
          style={{ transform: [{ rotate: rotateIcon }] }}
          className="justify-center items-center"
        >
          <MaterialCommunityIcons
            name="chevron-down"
            color={"gray"}
            size={30}
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export default LessonContainer;
