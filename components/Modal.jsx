import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useRef, useMemo, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Modal = ({
  isOpen,
  withInput,
  children,
  onRequestClose,
  snapPoints: customSnapPoints,
  enableDynamicSizing = false,
  ...rest
}) => {
  const modalRef = useRef(null);
  const snapPoints = useMemo(
    () => customSnapPoints || ["90%"],
    [customSnapPoints]
  );
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        onPress={() => Keyboard.dismiss()}
        {...props}
      />
    ),
    []
  );

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [isOpen]);

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: "#0d2b45" }}
      handleIndicatorStyle={{ backgroundColor: "#203c56" }}
      onDismiss={onRequestClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior={Platform.OS === "ios" ? "interactive" : "extend"}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableDynamicSizing={enableDynamicSizing}
      topInset={insets.top}
      {...rest}
    >
      <BottomSheetView className="flex-1 px-3">{children}</BottomSheetView>
    </BottomSheetModal>
  );
};

export default Modal;
