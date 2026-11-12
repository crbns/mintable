import React, { useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Modal from "./Modal";

const ActionRow = ({ icon, label, color, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    android_ripple={{ color: "rgba(255,255,255,0.1)" }}
    className="flex-row items-center min-h-[56px] px-4"
  >
    <MaterialIcons name={icon} size={24} color={color} />
    <Text className="font-pregular text-base ml-6" style={{ color }}>
      {label}
    </Text>
  </Pressable>
);

// Android row overflow: a Material modal bottom sheet of item actions
const GoalActionsSheet = ({ goal: openGoal, onClose, onEdit, onDelete }) => {
  // keeps the content in place while the sheet animates closed
  const lastGoal = useRef(null);
  if (openGoal) lastGoal.current = openGoal;
  const goal = openGoal ?? lastGoal.current;

  return (
  <Modal isOpen={!!openGoal} onRequestClose={onClose} enableDynamicSizing>
    {goal && (
      <View className="w-full pb-4 -mx-3">
        <Text
          className="text-muted font-pmedium text-sm px-4 pt-1 pb-2"
          numberOfLines={1}
          accessibilityRole="header"
        >
          {goal.name}
        </Text>
        <ActionRow
          icon="edit"
          label="Edit goal"
          color="#ffffff"
          onPress={() => onEdit(goal)}
        />
        <ActionRow
          icon="delete-outline"
          label="Delete goal"
          color="#fca5a5"
          onPress={() => onDelete(goal)}
        />
      </View>
    )}
  </Modal>
  );
};

export default GoalActionsSheet;
