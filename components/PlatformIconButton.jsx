import { View, Platform, TouchableOpacity, Pressable } from "react-native";
import React from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Each OS gets its own glyph family: Ionicons sit closest to SF Symbols,
// MaterialIcons are the Android system set
const ICONS = {
  close: { ios: "close", android: "close" },
  settings: { ios: "settings-outline", android: "settings" },
  add: { ios: "add", android: "add" },
};

// Corner/toolbar button: 44pt target on iOS, 48dp with ripple on Android
const PlatformIconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  color = "#CDCDE0",
  filled,
  containerStyles = "",
}) => {
  if (Platform.OS === "ios") {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className={`w-11 h-11 items-center justify-center ${containerStyles}`}
      >
        {filled ? (
          <View className="w-8 h-8 rounded-full bg-alt-100 items-center justify-center">
            <Ionicons name={ICONS[icon].ios} size={20} color={color} />
          </View>
        ) : (
          <Ionicons name={ICONS[icon].ios} size={26} color={color} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: "rgba(255,255,255,0.16)", borderless: true, radius: 24 }}
      className={`w-12 h-12 items-center justify-center ${containerStyles}`}
    >
      <MaterialIcons name={ICONS[icon].android} size={24} color={color} />
    </Pressable>
  );
};

export default PlatformIconButton;
