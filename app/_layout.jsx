import { StyleSheet, Text, View } from "react-native";
import { Slot, SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import "../global.css";
import React, { useEffect } from "react";

import GlobalProvider from "../context/GlobalProvider";
import NetworkProvider from "../components/NetworkProvider";
import ForceUpdateGate from "../components/ForceUpdateGate";
import appsFlyer from "react-native-appsflyer";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

import "react-native-reanimated";
import { useReviewPrompter } from "../lib/useReviewPrompter";

import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  // TODO: add this to env
  useEffect(() => {
    const option = {
      isDebug: process.env.EXPO_PUBLIC_DEBUG_MODE === "true" ? true : false,
      appId: "id6745320066",
      devKey: "oZi6o63nWqWCzUCsDrBpNP",
      timeToWaitForATTUserAuthorization: 10,
    };

    appsFlyer.initSdk(
      option,
      (res) => {
        console.log("AppsFlyer: ", res);
      },
      (err) => {
        console.error("AppsFlyer: ", err);
      }
    );

    appsFlyer.startSdk();
  }, []);

  // TODO: add store urls
  useReviewPrompter({
    minLaunches: 1,
    cooldownDays: 0,
    feedbackUrl: "https://forms.gle/QJW1saoLRsZe1mgB7",
    storeUrlIOS:
      "https://apps.apple.com/us/app/mintable-budget-learn/id6745320066",
    storeUrlAndroid:
      "https://play.google.com/store/apps/details?id=com.isaac.mintable",
  });

  if (!fontsLoaded && !error) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GlobalProvider>
            <BottomSheetModalProvider>
              <NetworkProvider>
                <ForceUpdateGate>
                  <Stack
                    screenOptions={{
                      contentStyle: { backgroundColor: "#0d2b45" },
                    }}
                  >
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(auth)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(quiz)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(settings)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(history)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(demo)"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </ForceUpdateGate>
              </NetworkProvider>
            </BottomSheetModalProvider>
          </GlobalProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
