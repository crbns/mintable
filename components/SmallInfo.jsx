import { View, Text } from "react-native";
import React from "react";

import { MaterialIcons } from "@expo/vector-icons";

const SmallInfo = ({ text, containerStyle, iconSize, textStyle }) => {
  return (
    // TODO: Why the fuck is there margin in the component
    <View className={`flex-row justify-center items-center ${containerStyle}`}>
      <MaterialIcons
        name="error-outline"
        size={iconSize ?? 16}
        color="#6b7280"
      />
      <Text className={`text-gray-500 font-pregular mx-1 ${textStyle}`}>
        {text}
      </Text>
    </View>
  );
};

export default SmallInfo;
