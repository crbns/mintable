import { View, Text, Platform, TouchableOpacity, Alert } from "react-native";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import DrawerModal from "./DrawerModal";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import DrawerFormField from "./DrawerFormField";
import DropDown from "./DropDown";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import CButton from "./CButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { deleteBudget, editBudget } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";

const ConfirmDrawerModal = forwardRef(
  (
    { onDismiss, headerText, button1Text, button2Text, incentive1, setReturn },
    ref
  ) => {
    const originalFormRef = useRef(null);

    const dismissed = async () => {
      // if (hasChanged) {
      //   await saveChanges();
      // }

      if (onDismiss) {
        onDismiss();
      }
    };

    return (
      <DrawerModal
        ref={ref}
        onDismiss={dismissed}
        backgroundColor="#0d2b45"
        stackBehavior="push"
        snapPoints={["30%"]}
      >
        <BottomSheetView className="flex align-center pb-10 px-5">
          <View className="w-full items-center justify-center relative">
            <Text className="text-xl font-psemibold text-white mb-5 text-center">
              {headerText ?? "Are you sure?"}
            </Text>
            <View className="w-full flex-row gap-5">
              <CButton
                containerStyles={`flex-1 ${
                  incentive1 ? "bg-green-500" : "border-2 border-gray-500"
                }`}
                containerColor={`bg-primary`}
                textColor={incentive1 ? "text-primary" : "text-gray-500"}
                title={button1Text ?? "Yes"}
                handlePress={() => {
                  setReturn(true);
                  ref.current?.dismiss();
                }}
              />
              <CButton
                containerStyles={`flex-1 ${
                  !incentive1 ? "bg-red-500" : "border-2 border-gray-500"
                }`}
                containerColor={`bg-primary`}
                textColor={!incentive1 ? "text-primary" : "text-gray-500"}
                title={button2Text ?? "No"}
                handlePress={() => {
                  setReturn(false);
                  ref.current?.dismiss();
                }}
              />
            </View>
          </View>
        </BottomSheetView>
      </DrawerModal>
    );
  }
);

export default ConfirmDrawerModal;
