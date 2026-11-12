import { View, Text } from "react-native";
import React, { forwardRef } from "react";
import DrawerModal from "./DrawerModal";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CButton from "./CButton";

// Two-button confirmation sheet. With `destructive`, the confirm button is the
// filled red one and the safe choice is the quiet outline. Sizes to its
// content, so long names and large text never push the buttons off-screen.
const ConfirmDrawerModal = forwardRef(
  (
    {
      onDismiss,
      headerText,
      description,
      confirmText,
      cancelText,
      destructive,
      onConfirm,
      onCancel,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();

    // called on every tap, so a retry after a failure always goes through
    const choose = (confirmed) => {
      ref.current?.dismiss();
      if (confirmed) {
        onConfirm?.();
      } else {
        onCancel?.();
      }
    };

    return (
      <DrawerModal
        ref={ref}
        onDismiss={onDismiss}
        backgroundColor="#0d2b45"
        stackBehavior="push"
        enableDynamicSizing
      >
        {/* DrawerModal adds no bottom inset, so clear the home indicator here */}
        <BottomSheetView
          className="flex align-center px-5"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Text
            className="text-xl font-psemibold text-white text-center"
            accessibilityRole="header"
          >
            {headerText ?? "Are you sure?"}
          </Text>
          {description && (
            <Text className="text-base font-pregular text-gray-100 text-center mt-2">
              {description}
            </Text>
          )}
          <View className="w-full flex-row gap-4 mt-6">
            <CButton
              containerStyles={"flex-1 border-2 border-muted"}
              containerColor={"bg-primary"}
              textColor={"text-gray-100"}
              title={cancelText ?? "Cancel"}
              handlePress={() => choose(false)}
            />
            <CButton
              containerStyles={"flex-1"}
              containerColor={destructive ? "bg-red-600" : "bg-secondary"}
              textColor={destructive ? "text-white" : "text-primary"}
              title={confirmText ?? "Confirm"}
              handlePress={() => choose(true)}
            />
          </View>
        </BottomSheetView>
      </DrawerModal>
    );
  },
);

export default ConfirmDrawerModal;
