import { View, Text, Platform } from "react-native";
import React from "react";
import PlatformIconButton from "./PlatformIconButton";

// iOS: centered title, round close button trailing.
// Android: close leading, title start-aligned (Material full-screen dialog).
const SheetHeader = ({ title, onClose }) => {
  if (Platform.OS === "ios") {
    return (
      <View className="flex-row items-center justify-center min-h-[44px]">
        <Text
          className="font-psemibold text-white text-xl text-center px-12"
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Text>
        <PlatformIconButton
          icon="close"
          filled
          onPress={onClose}
          accessibilityLabel="Close"
          containerStyles="absolute right-1"
        />
      </View>
    );
  }

  return (
    <View className="flex-row items-center min-h-[48px]">
      <PlatformIconButton
        icon="close"
        onPress={onClose}
        accessibilityLabel="Close"
      />
      <Text
        className="font-psemibold text-white text-xl ml-2 flex-1"
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
    </View>
  );
};

export default SheetHeader;
