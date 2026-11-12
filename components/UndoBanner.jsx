import {
  View,
  Text,
  TouchableOpacity,
  AccessibilityInfo,
  Platform,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import PlatformIconButton from "./PlatformIconButton";

const VISIBLE_MS = 10000;
// Android: Material snackbars sit above the FAB (56dp + 16dp margin + gap)
const ANDROID_FAB_CLEARANCE = 80;

// Floating snackbar with an Undo action, pinned to the bottom of the screen so
// it is visible from any scroll position. Screen-reader users get no timeout;
// they dismiss it themselves.
const UndoBanner = ({ message, onUndo, onDismiss, disabled }) => {
  useEffect(() => {
    let timer;
    let cancelled = false;
    AccessibilityInfo.isScreenReaderEnabled().then((screenReaderOn) => {
      if (!cancelled && !screenReaderOn) {
        timer = setTimeout(onDismiss, VISIBLE_MS);
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [message]);

  return (
    // The native SafeAreaView measures this view's own insets, which on iOS
    // include the tab bar, so the snackbar always clears it
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      pointerEvents="box-none"
      className="absolute left-0 right-0 bottom-0 px-3"
      style={{
        paddingBottom: Platform.OS === "android" ? ANDROID_FAB_CLEARANCE : 8,
      }}
    >
      <View
        onAccessibilityEscape={onDismiss}
        className="flex-row items-center bg-alt-100 rounded-xl pl-4 min-h-[52px]"
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <Text className="flex-1 text-white font-pregular text-base py-2">
          {message}
        </Text>
        <TouchableOpacity
          onPress={onUndo}
          disabled={disabled}
          accessibilityState={{ disabled: !!disabled }}
          accessibilityRole="button"
          accessibilityLabel="Undo"
          hitSlop={4}
          className="px-3 min-h-[44px] justify-center"
        >
          <Text
            className={`text-secondary font-psemibold text-base ${
              disabled ? "opacity-50" : ""
            }`}
          >
            Undo
          </Text>
        </TouchableOpacity>
        <PlatformIconButton
          icon="close"
          onPress={onDismiss}
          accessibilityLabel="Dismiss"
        />
      </View>
    </SafeAreaView>
  );
};

export default UndoBanner;
