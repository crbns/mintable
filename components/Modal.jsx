import {
  View,
  Text,
  Modal as RNModal,
  ModalProps,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";

// to allow modal to move up with keyboard present, add "withInput" as a prop to the modal component ==> <Modal withInput />

const Modal = ({ isOpen, withInput, children, ...rest }) => {
  const content = withInput ? (
    <KeyboardAvoidingView
      className="items-center justify-center flex-1 px-3 bg-zinc-900/60"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {children}
    </KeyboardAvoidingView>
  ) : (
    <View className="items-center justify-center flex-1 px-3 bg-zinc-900/60">
      {children}
    </View>
  );

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      {...rest}
    >
      {content}
    </RNModal>
  );
};

export default Modal;
