import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Modal from "./Modal";
import FormField from "./FormField";
import CButton from "./CButton";
import SmallError from "./SmallError";
import LottieView from "lottie-react-native";

const AllocateModal = ({
  isOpen,
  onClose,
  virtualBalance,
  allocateAmount,
  setAllocateAmount,
  setIsAllocateMode,
  selectBudgetAnimationRef,
  items,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      withInput
      onRequestClose={onClose}
      snapPoints={["90%"]}
    >
      <View className="flex align-center pb-10 w-full">
        <View className="items-center justify-center relative flex-row">
          <Text className="font-psemibold text-white text-xl text-center">
            Allocate Money
          </Text>
          <TouchableOpacity
            className="absolute right-4"
            onPress={() => {
              console.log("Allocate modal close button pressed");
              onClose();
              setIsAllocateMode(false);
            }}
          >
            <MaterialCommunityIcons name="close" size={22} color={"gray"} />
          </TouchableOpacity>
        </View>

        <View className="bg-primary w-full rounded-xl ">
          <Text className="font-pregular text-md text-white">
            {`You have $${virtualBalance} to allocate.`}
          </Text>

          <FormField
            title={"Set amount to allocate"}
            handleChangeText={(e) => setAllocateAmount(parseInt(e))}
            otherStyles={"mt-1"}
            placeholder={"Set amount"}
            inputMode={"numeric"}
            otherChildren={
              <View className="items-center justify-center h-full mr-1">
                <Text className="font-pregular text-secondary text-2xl">$</Text>
              </View>
            }
          />

          {virtualBalance - allocateAmount < 0 && (
            <SmallError text={"Number cannot excede amount to allocate"} />
          )}

          {allocateAmount && (
            <Text className="font-pregular text-md text-white mt-1">
              You will have $
              {virtualBalance - allocateAmount < 0
                ? 0
                : virtualBalance - allocateAmount}{" "}
              remaining.
            </Text>
          )}

          <CButton
            title={"Select Budget"}
            containerStyles={"mt-3"}
            handlePress={() => {
              if (virtualBalance - allocateAmount >= 0) {
                selectBudgetAnimationRef.current?.play();
                setTimeout(() => {
                  onClose();
                }, 1000);
                setIsAllocateMode(true);
              }
            }}
          />
        </View>

        <LottieView
          source={require("../assets/animations/coins_explode.json")}
          ref={selectBudgetAnimationRef}
          style={{
            width: 200,
            height: 200,
            position: "absolute",
            bottom: -60,
            alignSelf: "center",
            zIndex: 10,
            pointerEvents: "none",
          }}
          autoPlay={false}
          loop={false}
        />
      </View>
    </Modal>
  );
};

export default AllocateModal;
