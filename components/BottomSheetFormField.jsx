import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput as RNTextInput,
  findNodeHandle,
  TextInput,
} from "react-native";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalContext } from "../context/GlobalProvider";

/**
 * BottomSheetFormField is a reusable component for form inputs in bottom sheets.
 * It handles keyboard interactions, focus/blur events for animated keyboard states,
 * and provides a consistent UI with optional password visibility toggle.
 */
const BottomSheetFormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  inputMode,
  otherChildren,
  onFocus,
  onBlur,
  ...props
}) => {
  const { animatedKeyboardState } = useGlobalContext();
  const [showPassword, setShowPassword] = useState(false);
  const textInputRef = useRef(null);
  const textInputNodesRef = useRef(new Set());

  useEffect(() => {
    if (textInputRef.current) {
      const node = findNodeHandle(textInputRef.current);
      textInputNodesRef.current.add(node);
      return () => {
        textInputNodesRef.current.delete(node);
      };
    }
  }, []);

  const handleOnFocus = useCallback(
    (args) => {
      const target = args.nativeEvent.target;
      animatedKeyboardState.set((state) => ({
        ...state,
        target,
      }));
      if (onFocus) {
        onFocus(args);
      }
    },
    [onFocus, animatedKeyboardState]
  );
  const handleOnBlur = useCallback(
    (args) => {
      const target = args.nativeEvent.target;
      const keyboardState = animatedKeyboardState.get();
      const currentFocusedInput = findNodeHandle(
        RNTextInput.State.currentlyFocusedInput()
      );

      /**
       * we need to make sure that we only remove the target
       * if the target belong to the current component and
       * if the currently focused input is not in the targets set.
       */
      const shouldRemoveCurrentTarget = keyboardState.target === target;
      const shouldIgnoreBlurEvent =
        currentFocusedInput &&
        textInputNodesRef.current.has(currentFocusedInput);

      if (shouldRemoveCurrentTarget && !shouldIgnoreBlurEvent) {
        animatedKeyboardState.set((state) => ({
          ...state,
          target: undefined,
        }));
      }

      if (onBlur) {
        onBlur(args);
      }
    },
    [onBlur, animatedKeyboardState, textInputNodesRef]
  );

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-100 font-pmedium mx-2">{title}</Text>

      <View className="w-full h-14 px-4 focus:border-secondary items-center flex-row border-b-2 border-alt-100">
        {otherChildren}
        <TextInput
          ref={textInputRef}
          className="flex-1 text-white font-psemibold text-base h-full"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7b7b8b"
          onChangeText={handleChangeText}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          secureTextEntry={title === "Password" && !showPassword}
          inputMode={inputMode}
        />

        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {/* <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
            /> */}
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
};

export default BottomSheetFormField;
