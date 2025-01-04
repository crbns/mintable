import { View, Text, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import images from "../constants/images";

export default function App() {
  const [counter, setCounter] = useState(0);

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="items-center justify-center w-full px-4">
          <Image
            source={images.logoHoriz}
            className="w-[300px] h-[90px]"
            resizeMode="contain"
          />

          <View className="relative mt-5">
            <Text className="font-pbold text-white text-center text-3xl">
              Revolutionize the way you budget
            </Text>
          </View>
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#0d2b45" style="light" />
    </SafeAreaView>
  );
}
