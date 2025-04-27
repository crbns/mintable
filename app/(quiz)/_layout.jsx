import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const QuizLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="takeQuiz" options={{ headerShown: false }} />
        <StatusBar backgroundColor="#0d2b45" style="light" />
      </Stack>
    </>
  );
};

export default QuizLayout;
