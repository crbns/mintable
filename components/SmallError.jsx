import { View, Text } from "react-native";
import React from "react";

import { MaterialIcons } from "@expo/vector-icons";

const SmallError = ({ text, containerStyle, iconSize, textStyle }) => {
  return (
    <View className={`mt-4 flex-row align-center ${containerStyle}`}>
      <MaterialIcons name="error-outline" size={iconSize ?? 16} color="red" />
      <Text className={`text-red-600 font-pregular mx-1 ${textStyle}`}>
        {text}
      </Text>
    </View>
  );
};

export default SmallError;
