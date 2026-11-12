import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Keyboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Modal from "./Modal";
import BottomSheetFormField from "./BottomSheetFormField";
import CButton from "./CButton";
import SheetHeader from "./SheetHeader";
import GoalPickerSheet from "./GoalPickerSheet";
import { formatMoney, formatMonthYear } from "../lib/format";
import { isPastTarget } from "./BudgetContainer";

const QUICK_AMOUNTS = [5, 10, 20];
// past this many goals the chips wrap into a wall, so a picker sheet takes over
const MAX_GOAL_CHIPS = 3;

const Chip = ({ label, selected, onPress, dotColor }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ checked: selected }}
    className={`flex-row items-center rounded-full px-4 min-h-[44px] mr-2 mb-2 border-2 ${
      selected ? "border-secondary bg-alt-100" : "border-alt-100"
    }`}
  >
    {dotColor && (
      <View
        className="w-3 h-3 rounded-full mr-2"
        style={{ backgroundColor: dotColor }}
      />
    )}
    <Text className="text-white font-pmedium text-base">{label}</Text>
  </Pressable>
);

// Goals and amounts are each a single choice, so they announce as radios
// Goal-first allocation: pick (or arrive with) a goal, choose an amount, confirm once
const AllocateModal = ({
  isOpen,
  onClose,
  virtualBalance,
  items,
  initialGoalId,
  onConfirm,
  onEditGoal,
  isWorking,
}) => {
  const [goalId, setGoalId] = useState(null);
  const [amountText, setAmountText] = useState("");
  const inputRef = useRef(null);
  // focusing during the present animation can land the keyboard before the
  // sheet has a position, so the field waits until the sheet settles
  const [settled, setSettled] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  // the picked goal is applied once the picker has animated away, so the
  // amount field doesn't focus (and raise the keyboard) under a closing sheet
  const [pendingGoalId, setPendingGoalId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setGoalId(initialGoalId ?? (items.length === 1 ? items[0].id : null));
      setAmountText("");
      setSettled(false);
    }
    setPickerOpen(false);
    setPendingGoalId(null);
  }, [isOpen, initialGoalId]);

  const openPicker = () => {
    Keyboard.dismiss();
    setPickerOpen(true);
  };

  const handlePickerSelect = (id) => {
    // a second tap during the close animation would never be applied
    if (!pickerOpen) return;
    setPendingGoalId(id);
    setPickerOpen(false);
  };

  // runs after the picker's close animation, however it was closed
  const handlePickerDismiss = () => {
    setPickerOpen(false);
    if (!isOpen) return;
    if (pendingGoalId) {
      setGoalId(pendingGoalId);
      setPendingGoalId(null);
    }
    // a field that is already mounted (switching goals) won't autoFocus again;
    // a newly mounted one focuses itself via autoFocus={settled}
    inputRef.current?.focus();
  };

  const handleSheetChange = (index) => {
    if (index === 0 && !settled) {
      setSettled(true);
      inputRef.current?.focus();
    }
  };

  const canChooseGoal = !initialGoalId && items.length > 1;
  const usePicker = items.length > MAX_GOAL_CHIPS;
  const goal = items.find((item) => item.id === goalId) ?? null;
  const remaining = goal ? Math.max(goal.goal - goal.progress, 0) : 0;
  const maxAddable = goal ? Math.min(remaining, virtualBalance) : 0;
  const amount = parseInt(amountText, 10) || 0;
  const tooMuch = goal && amount > maxAddable;
  const canConfirm = !!goal && amount > 0 && !tooMuch && !isWorking;

  const chips = QUICK_AMOUNTS.filter((value) => value < maxAddable).map(
    (value) => ({ label: formatMoney(value), value }),
  );
  if (maxAddable > 0) {
    chips.push({
      label:
        maxAddable === remaining
          ? `Fill it · ${formatMoney(maxAddable)}`
          : `All of it · ${formatMoney(maxAddable)}`,
      value: maxAddable,
    });
  }

  // rides above the number pad, so the CTA is never under the keyboard
  const footer = goal ? (
    <View className="bg-primary px-3 pt-3 pb-3">
      <CButton
        title={amount > 0 ? `Add ${formatMoney(amount)}` : "Add money"}
        disabledd={!canConfirm}
        isWorking={isWorking}
        handlePress={() => onConfirm(goal.id, amount)}
      />

      <TouchableOpacity
        className="mt-3 min-h-[44px] items-center justify-center"
        onPress={() => onEditGoal(goal)}
        accessibilityRole="button"
      >
        <Text className="text-gray-100 font-pmedium text-base">Edit goal</Text>
      </TouchableOpacity>
    </View>
  ) : undefined;

  return (
    <Modal
      isOpen={isOpen}
      withInput
      onRequestClose={onClose}
      onChange={handleSheetChange}
      footer={footer}
    >
      <View className={`flex align-center w-full ${goal ? "pb-2" : "pb-6"}`}>
        <SheetHeader
          title={goal ? `Add to ${goal.name}` : "Add to a goal"}
          onClose={onClose}
        />

        <Text className="font-pregular text-base text-gray-100 mt-4 mx-2">
          {`${formatMoney(virtualBalance)} available`}
        </Text>

        {canChooseGoal && usePicker && (
          <View className="mt-4 mx-2">
            <Text className="text-base text-gray-100 font-pmedium mb-2">
              Goal
            </Text>
            <TouchableOpacity
              onPress={openPicker}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={
                goal
                  ? `Goal: ${goal.name}, ${formatMoney(remaining)} to go`
                  : "Goal: none chosen"
              }
              accessibilityHint="Opens the list of goals"
              className="flex-row items-center min-h-[48px] rounded-xl bg-alt-100 px-4 py-2"
            >
              {goal && (
                <View
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: goal.color }}
                />
              )}
              <View className="flex-1">
                {goal ? (
                  <>
                    <Text
                      className="text-white font-pmedium text-base"
                      numberOfLines={1}
                    >
                      {goal.name}
                    </Text>
                    <Text className="text-muted font-pregular text-sm">
                      {`${formatMoney(remaining)} to go`}
                    </Text>
                  </>
                ) : (
                  <Text className="text-muted font-pregular text-base">
                    Choose a goal
                  </Text>
                )}
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color="#CDCDE0"
              />
            </TouchableOpacity>
          </View>
        )}

        {canChooseGoal && !usePicker && (
          <View className="mt-4">
            <Text className="text-base text-gray-100 font-pmedium mx-2 mb-2">
              Which goal?
            </Text>
            <View
              className="flex-row flex-wrap mx-2"
              accessibilityRole="radiogroup"
              accessibilityLabel="Which goal?"
            >
              {items.map((item) => (
                <Chip
                  key={item.id}
                  label={item.name}
                  dotColor={item.color}
                  selected={item.id === goalId}
                  onPress={() => setGoalId(item.id)}
                />
              ))}
            </View>
          </View>
        )}

        {goal && (
          <>
            {isPastTarget(goal.goalTime) && (
              <View className="flex-row items-center flex-wrap mt-3 mx-2">
                <Text className="font-pregular text-base text-secondary">
                  {`Target was ${formatMonthYear(goal.goalTime)}.`}
                </Text>
                <TouchableOpacity
                  onPress={() => onEditGoal(goal)}
                  accessibilityRole="button"
                  className="min-h-[44px] justify-center ml-2"
                >
                  <Text className="font-psemibold text-base text-white underline">
                    Pick a new date
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <BottomSheetFormField
              ref={inputRef}
              title="How much to add"
              // a goal picked after the sheet settled mounts the field late
              autoFocus={settled}
              value={amountText}
              handleChangeText={(text) =>
                setAmountText(text.replace(/[^0-9]/g, ""))
              }
              otherStyles={"mt-4"}
              placeholder={"0"}
              inputMode={"numeric"}
              otherChildren={
                <View className="items-center justify-center h-full mr-1">
                  <Text className="font-pregular text-secondary text-2xl">
                    $
                  </Text>
                </View>
              }
            />

            {chips.length > 0 && (
              <View
                className="flex-row flex-wrap mt-3 mx-2"
                accessibilityRole="radiogroup"
                accessibilityLabel="Quick amounts"
              >
                {chips.map((chip) => (
                  <Chip
                    key={chip.label}
                    label={chip.label}
                    selected={amount === chip.value}
                    onPress={() => setAmountText(chip.value.toString())}
                  />
                ))}
              </View>
            )}

            <Text className="font-pregular text-base text-gray-100 mt-2 mx-2">
              {tooMuch
                ? remaining < virtualBalance
                  ? `Only ${formatMoney(remaining)} left to reach this goal.`
                  : `You have ${formatMoney(virtualBalance)} available.`
                : amount > 0
                  ? `${goal.name} will be at ${formatMoney(
                      goal.progress + amount,
                    )} of ${formatMoney(goal.goal)}.`
                  : `${formatMoney(goal.progress)} of ${formatMoney(
                      goal.goal,
                    )} saved so far.`}
            </Text>
          </>
        )}
      </View>

      {/* portals out like DropDown's sheet, so it adds nothing to this layout */}
      {canChooseGoal && usePicker && (
        <GoalPickerSheet
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onDismiss={handlePickerDismiss}
          items={items}
          selectedId={pendingGoalId ?? goalId}
          onSelect={handlePickerSelect}
        />
      )}
    </Modal>
  );
};

export default AllocateModal;
