import { View, KeyboardAvoidingView, Platform } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useRef, useMemo, useEffect, useCallback } from "react";

const Modal = ({ isOpen, withInput, children, onRequestClose, ...rest }) => {
  const modalRef = useRef(null);
  const snapPoints = useMemo(() => ["90%"], []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
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
      {...rest}
    >
      <BottomSheetView className="flex-1">
        <View className="items-center justify-center flex-1">
          {withInput ? (
            <KeyboardAvoidingView
              className=""
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              {children}
            </KeyboardAvoidingView>
          ) : (
            <View className="px-3">{children}</View>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default Modal;
