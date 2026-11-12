import React, { forwardRef, useCallback } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SheetBackdrop from "./SheetBackdrop";

// Ref-driven bottom sheet. Sizes to its content unless `snapPoints` are
// passed. Children supply their own BottomSheetView / BottomSheetScrollView.
const DrawerModal = forwardRef((props, ref) => {
  const {
    snapPoints,
    enableDynamicSizing = !snapPoints,
    backgroundColor,
    withInput,
    children,
    ...rest
  } = props;
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props) => <SheetBackdrop {...props} withInput={withInput} />,
    [withInput]
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: backgroundColor ?? "white" }}
      handleIndicatorStyle={{ backgroundColor: "#7b7b8b" }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustPan"
      enableBlurKeyboardOnGesture={!!withInput}
      enableDynamicSizing={enableDynamicSizing}
      topInset={insets.top}
      {...rest}
    >
      {children}
    </BottomSheetModal>
  );
});

export default DrawerModal;
