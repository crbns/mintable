import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const SettingsLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="settings"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="email"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="password"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="updateAmount"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="updateFrequency"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="name"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="bugReport"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="feedback"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <StatusBar backgroundColor="#0d2b45" style="light" />
      </Stack>
    </>
  );
};

export default SettingsLayout;
