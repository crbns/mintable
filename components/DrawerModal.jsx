import { View, StyleSheet, Text } from "react-native";
import React, { forwardRef, useCallback, useMemo } from "react";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DrawerModal = forwardRef((props, ref) => {
  const snapPoints = useMemo(() => props.snapPoints, []);
  const insets = useSafeAreaInsets();

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

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints ?? []}
      backdropComponent={renderBackdrop}
      onDismiss={props.onDismiss}
      backgroundStyle={{ backgroundColor: props.backgroundColor ?? "white" }}
      handleIndicatorStyle={{ backgroundColor: "#203c56" }}
      keyboardBehavior={"fillParent"}
      enableDynamicSizing={true}
      topInset={insets.top}
      {...props}
    >
      {/* <BottomSheetView className="flex align-center bg-white">
        <Text className="text-3xl text-center font-psemibold p-10">
          Bottom Modal 😎
        </Text>
      </BottomSheetView> */}
      {props.children}
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  containerHeadline: {
    fontSize: 24,
    fontWeight: "600",
    padding: 20,
  },
});

export default DrawerModal;
