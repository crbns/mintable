import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Progress from "react-native-progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Modal from "./Modal";
import SheetHeader from "./SheetHeader";
import { formatMoney } from "../lib/format";

// goals without a (valid) target date sort after every dated goal
const targetTime = (isoDate) => {
  const time = isoDate ? new Date(isoDate).getTime() : NaN;
  return Number.isNaN(time) ? Infinity : time;
};

// nearest target date first, then by name
const byTargetThenName = (a, b) => {
  const aTime = targetTime(a.goalTime);
  const bTime = targetTime(b.goalTime);
  if (aTime !== bTime) return aTime < bTime ? -1 : 1;
  return a.name.localeCompare(b.name);
};

// Stacked over AllocateModal when there are too many goals for chips.
// push keeps the allocate sheet mounted underneath; scrollable caps the list
// at the screen height on small phones / large text
const GoalPickerSheet = ({
  isOpen,
  onClose,
  onDismiss,
  items,
  selectedId,
  onSelect,
}) => {
  const sorted = useMemo(() => [...items].sort(byTargetThenName), [items]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onDismiss}
      scrollable
      enableDynamicSizing
      stackBehavior="push"
      containerStyle={{ zIndex: 10000 }}
    >
      <View className="pb-2">
        <SheetHeader title="Choose a goal" onClose={onClose} />

        <View
          className="mt-2"
          accessibilityRole="radiogroup"
          accessibilityLabel="Goals"
        >
          {sorted.map((item) => {
            const selected = item.id === selectedId;
            const saved = `${formatMoney(item.progress)} of ${formatMoney(
              item.goal,
            )}`;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onSelect(item.id)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${item.name}, ${saved}`}
                className="flex-row items-center min-h-[56px] py-3 px-2 border-b border-alt-100"
              >
                <View
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: item.color }}
                />
                <View className="flex-1">
                  <Text
                    className="text-white font-pmedium text-base"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-muted font-pregular text-sm mt-0.5">
                    {saved}
                  </Text>
                  <View className="mt-2">
                    <Progress.Bar
                      progress={
                        item.goal > 0
                          ? Math.min(item.progress / item.goal, 1)
                          : 0
                      }
                      width={null}
                      color={item.color}
                      unfilledColor="#203c56"
                      borderWidth={0}
                      height={4}
                      borderRadius={2}
                      animated={false}
                    />
                  </View>
                </View>
                <View className="w-8 items-end">
                  {selected && (
                    <MaterialCommunityIcons
                      name="check"
                      size={22}
                      color="#ffaa5e"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

export default GoalPickerSheet;
