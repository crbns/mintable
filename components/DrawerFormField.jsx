import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

const DrawerFormField = ({
  title,
  initialValue,
  placeholder,
  handleChangeText,
  otherStyles,
  inputMode,
  otherChildren,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [localValue, setLocalValue] = useState(initialValue ?? "");

  // If initialValue changes (e.g., on a new budget), update localValue
  useEffect(() => {
    setLocalValue(initialValue ?? "");
  }, [initialValue]);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-100 font-pmedium mx-2">{title}</Text>

      <View className="w-full h-14 px-4 focus:border-secondary items-center flex-row border-b-2 border-alt-100">
        {otherChildren}
        <TextInput
          className="flex-1 text-white font-psemibold text-base h-full"
          value={localValue}
          placeholder={placeholder}
          placeholderTextColor="#7b7b8b"
          onChangeText={(text) => {
            setLocalValue(text);
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
};

export default DrawerFormField;
