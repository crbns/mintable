import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const SettingsLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="history"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <StatusBar backgroundColor="#0d2b45" style="light" />
      </Stack>
    </>
  );
};

export default SettingsLayout;
