import { View, Text, TouchableOpacity } from "react-native";
import React, { forwardRef, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import BottomSheetTextInput from "../lib/bottomSheetTextInput";

// Only render inside a bottom sheet: BottomSheetTextInput needs the sheet's
// context to lift the sheet above the keyboard.
const DrawerFormField = forwardRef(
  (
    {
      title,
      initialValue,
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
    const [localValue, setLocalValue] = useState(initialValue ?? "");

    // If initialValue changes (e.g., on a new budget), update localValue
    useEffect(() => {
      setLocalValue(initialValue ?? "");
    }, [initialValue]);

    // a controlled `value` wins, so a parent that cleans the text (e.g.
    // stripping non-digits) always sees its cleaned text displayed
    const isControlled = value !== undefined;

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
            value={isControlled ? value : localValue}
            placeholder={placeholder}
            placeholderTextColor="#9fb0c3"
            accessibilityLabel={title}
            onChangeText={(text) => {
              if (!isControlled) setLocalValue(text);
              handleChangeText?.(text); // propagate upward if needed
            }}
            secureTextEntry={title === "Password" && !showPassword}
            inputMode={inputMode}
          />

          {title === "Password" && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <Ionicons name="eye" size={20} color="gray" />
              ) : (
                <Ionicons name="eye-off" size={20} color="gray" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

export default DrawerFormField;
