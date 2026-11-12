import React, { useEffect, useRef, useState } from "react";
import { View, Text, Switch, TouchableOpacity, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Modal from "./Modal";
import CButton from "./CButton";
import SheetHeader from "./SheetHeader";
import { formatMoney } from "../lib/format";

// Opens from a full goal. "I bought it" hands back to the screen, which
// celebrates and offers Undo before anything is deleted.
const ReadyGoalSheet = ({ goal: openGoal, onClose, onBought, onRaiseTarget }) => {
  // keeps the content in place while the sheet animates closed
  const lastGoal = useRef(null);
  if (openGoal) lastGoal.current = openGoal;
  const goal = openGoal ?? lastGoal.current;
  const [returnExtra, setReturnExtra] = useState(true);
  const extra = goal ? Math.max(goal.progress - goal.goal, 0) : 0;
  const spent = goal ? Math.min(goal.progress, goal.goal) : 0;

  useEffect(() => {
    if (openGoal) setReturnExtra(true);
  }, [openGoal?.id]);

  return (
    // scrolls so the bottom link can't clip at the largest text sizes
    <Modal isOpen={!!openGoal} onRequestClose={onClose} scrollable>
      {goal && (
        <View className="w-full pb-6">
          <SheetHeader title={goal.name} onClose={onClose} />

          <View className="items-center mt-4 mx-2">
            <MaterialCommunityIcons
              name="check-circle"
              size={48}
              color={goal.color ?? "#ffaa5e"}
            />
            <Text className="text-white font-psemibold text-2xl text-center mt-3">
              {`You saved ${formatMoney(goal.progress)}`}
            </Text>
            <Text className="text-muted font-pregular text-base text-center mt-2">
              Bought it? Mark it done and it moves to your Achieved list.
            </Text>
          </View>

          {extra > 0 && (
            <View className="flex-row items-center mt-5 mx-2 min-h-[48px]">
              <Text className="flex-1 text-white font-pregular text-base mr-3">
                {`Put the extra ${formatMoney(extra)} back in your balance`}
              </Text>
              <Switch
                value={returnExtra}
                onValueChange={setReturnExtra}
                accessibilityLabel={`Put the extra ${formatMoney(extra)} back in your balance`}
                trackColor={{ false: "#203c56", true: "#ffaa5e" }}
                thumbColor={Platform.OS === "android" ? "#ffffff" : undefined}
                ios_backgroundColor="#203c56"
              />
            </View>
          )}

          <CButton
            title={
              extra > 0 && returnExtra
                ? `I bought it for ${formatMoney(spent)}`
                : "I bought it"
            }
            containerStyles={"mt-6"}
            handlePress={() =>
              onBought(goal, { returnExtra: extra > 0 && returnExtra })
            }
          />
          <TouchableOpacity
            onPress={() => onRaiseTarget(goal)}
            accessibilityRole="button"
            className="mt-2 min-h-[44px] items-center justify-center"
          >
            <Text className="text-gray-100 font-pmedium text-base">
              Raise the target instead
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  );
};

export default ReadyGoalSheet;
