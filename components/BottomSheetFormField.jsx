import { View, Text, TouchableOpacity } from "react-native";
import React, { forwardRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import BottomSheetTextInput from "../lib/bottomSheetTextInput";

/**
 * BottomSheetFormField is a reusable component for form inputs in bottom sheets.
 * BottomSheetTextInput reports focus/blur to the enclosing sheet so it can lift
 * above the keyboard, so this must only be rendered inside a bottom sheet.
 * Provides a consistent UI with optional password visibility toggle.
 */
const BottomSheetFormField = forwardRef(
  (
    {
      title,
      value,
      placeholder,
      handleChangeText,
      otherStyles,
      inputMode,
      otherChildren,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View className={`space-y-2 ${otherStyles}`}>
        <Text className="text-base text-gray-100 font-pmedium mx-2">
          {title}
        </Text>

        <View className="w-full h-14 px-4 focus:border-secondary items-center flex-row border-b-2 border-alt-100">
          {otherChildren}
          <BottomSheetTextInput
            ref={ref}
            className="flex-1 text-white font-psemibold text-base h-full"
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#9fb0c3"
            accessibilityLabel={title}
            onChangeText={handleChangeText}
            secureTextEntry={title === "Password" && !showPassword}
            inputMode={inputMode}
            {...props}
          />

          {title === "Password" && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {!showPassword ? (
                <Ionicons name="eye-off" size={20} color={"gray"} />
              ) : (
                <Ionicons name="eye" size={20} color="gray" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

export default BottomSheetFormField;
