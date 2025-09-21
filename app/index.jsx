import { View, Text, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import images from "../constants/images";
import CButton from "../components/CButton";
import { Redirect, router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

export default function App() {
  const { isLoading, isLoggedIn } = useGlobalContext();

  useEffect(() => {
    (async () => {
      const { status } = await requestTrackingPermissionsAsync();
      if (status === "granted") {
        console.log("Yay! I have user permission to track data");
      }
    })();
  }, []);

  if (!isLoading && isLoggedIn) return <Redirect href="/home" />;

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="items-center justify-center w-full px-4">
          <Image
            source={images.logoHoriz}
            className="w-[300px] h-[90px]"
            resizeMode="contain"
          />

          <Image
            source={images.onboard2}
            className="w-full h-[300px]"
            resizeMode="contain"
          />

          <View className="relative mt-5">
            <Text className="font-pbold text-white text-center text-3xl">
              Revolutionize the way you budget
            </Text>
            <Text className="font-pregular text-gray-400 text-xl text-center mt-5">
              Your all-in-one app to take control of your money while learning
              smart financial habits. Let's make managing money easy and fun!
            </Text>
          </View>
        </View>
        <View className="flex-1 justify-end items-center p-4">
          <CButton
            title={"Get Started"}
            handlePress={() => router.push("/home")}
            containerStyles={"w-full mt-7"}
          />
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#0d2b45" style="light" />
    </SafeAreaView>
  );
}
