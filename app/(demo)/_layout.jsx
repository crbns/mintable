import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const DemoLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="budgetDemo" options={{ headerShown: false }} />
        <StatusBar backgroundColor="#0d2b45" style="light" />
      </Stack>
    </>
  );
};

export default DemoLayout;
