import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Modal from "./Modal";
import CButton from "./CButton";
import SheetHeader from "./SheetHeader";
import BottomSheetFormField from "./BottomSheetFormField";
import ColorSwatches from "./ColorSwatches";
import TargetDateField from "./TargetDateField";
import { pickUnusedColor } from "../constants/goalColors";

// Only a name and an amount are required; color is pre-picked, date is optional
const CreateBudgetModal = ({
  isOpen,
  onClose,
  onCreate,
  isWorking,
  usedColors,
}) => {
  const [title, setTitle] = useState("");
  const [goalText, setGoalText] = useState("");
  const [color, setColor] = useState(null);
  const [goalTime, setGoalTime] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setGoalText("");
      setColor(pickUnusedColor(usedColors));
      setGoalTime(null);
    }
  }, [isOpen]);

  const goal = parseInt(goalText, 10) || 0;
  const canCreate = title.trim().length > 0 && goal > 0 && !isWorking;

  // sizes to the form, scrolls when it outgrows a small screen or large
  // text, and keeps the CTA pinned above the keyboard
  return (
    <Modal
      isOpen={isOpen}
      withInput
      onRequestClose={onClose}
      scrollable
      footer={
        <View className="bg-primary px-3 pt-3 pb-3">
          <CButton
            title={"Create goal"}
            disabledd={!canCreate}
            isWorking={isWorking}
            handlePress={() =>
              onCreate({ title: title.trim(), goal, color, goalTime })
            }
          />
        </View>
      }
    >
      <View className="flex align-center pb-3 w-full">
        <SheetHeader title="New goal" onClose={onClose} />

        <BottomSheetFormField
          title="What are you saving for?"
          value={title}
          handleChangeText={setTitle}
          otherStyles={"mt-4"}
          placeholder={"New headphones"}
        />

        <BottomSheetFormField
          title="Goal amount"
          value={goalText}
          handleChangeText={(text) => setGoalText(text.replace(/[^0-9]/g, ""))}
          otherStyles={"mt-4"}
          inputMode={"numeric"}
          placeholder={"0"}
          otherChildren={
            <View className="items-center justify-center h-full mr-1">
              <Text className="font-pregular text-secondary text-2xl">$</Text>
            </View>
          }
        />

        <ColorSwatches
          value={color}
          onChange={setColor}
          containerStyles={"mt-5"}
        />

        <TargetDateField
          value={goalTime}
          onChange={setGoalTime}
          containerStyles={"mt-4"}
        />
      </View>
    </Modal>
  );
};

export default CreateBudgetModal;
