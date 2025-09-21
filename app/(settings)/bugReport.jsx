import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CButton from "../../components/CButton";

const bugReport = () => {
  return (
    <SafeAreaView className="bg-primary p-5 h-full">
      <View className="flex-row items-center ">
        <Text className="text-3xl font-psemibold text-white flex-1">
          Report Bugs
        </Text>
        <TouchableOpacity
          className="items-end ml-5"
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="close" color={"gray"} size={32} />
        </TouchableOpacity>
      </View>
      <View className="mt-5">
        <Text className="text-white font-pregular text-xl text-center">
          Found a bug? Report it to
        </Text>
        <Text className="text-secondary font-pbold text-3xl text-center my-2">
          bugs@mintableapp.com
        </Text>
        <Text className="text-white font-pregular text-md text-center">
          Please include a detailed description of the bug and how to reproduce
          it.
        </Text>
      </View>
      <CButton
        title={"Back"}
        containerStyles={"mt-10"}
        handlePress={() => router.back()}
      />
    </SafeAreaView>
  );
};

export default bugReport;
