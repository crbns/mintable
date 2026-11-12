import { View, Text, Pressable, Platform } from "react-native";
import React, { useRef } from "react";
import * as Progress from "react-native-progress";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useReducedMotion } from "react-native-reanimated";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { formatMoney, formatMonthYear } from "../lib/format";

const DAY_MS = 1000 * 60 * 60 * 24;
// past this, a day count is harder to read than the month itself
const DAY_COUNT_LIMIT = 60;

// "Due today" / "Due in 5 days" / "Due Mar 2027" / "Past target · Mar 2025"
const dueLabel = (isoDate) => {
  const target = new Date(isoDate);
  const now = new Date();
  // Reset both dates to midnight to avoid partial day issues
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  // round, not floor: a DST shift makes a day 23 or 25 hours long
  const days = Math.round((target.getTime() - now.getTime()) / DAY_MS);

  if (days < 0) {
    return { text: `Past target · ${formatMonthYear(target)}`, past: true };
  }
  if (days === 0) return { text: "Due today", past: false };
  if (days === 1) return { text: "Due tomorrow", past: false };
  if (days <= DAY_COUNT_LIMIT) return { text: `Due in ${days} days`, past: false };
  return { text: `Due ${formatMonthYear(target)}`, past: false };
};

export const isPastTarget = (isoDate) => !!isoDate && dueLabel(isoDate).past;

// iOS trailing swipe actions, sized like system list actions
const SwipeAction = ({ label, icon, background, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    className="w-20 items-center justify-center"
    style={({ pressed }) => ({
      backgroundColor: background,
      opacity: pressed ? 0.7 : 1,
    })}
  >
    <Ionicons name={icon} size={22} color="#ffffff" />
    <Text className="text-white font-pmedium text-sm mt-1">{label}</Text>
  </Pressable>
);

const BudgetContainer = ({
  containerStyles,
  progress,
  name,
  color,
  goal,
  onPress,
  onEdit,
  onDelete,
  onMore,
  date,
  completed,
}) => {
  const swipeableRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const title = name ?? "New goal";
  const due = date && !completed ? dueLabel(date) : null;
  const toGo = Math.max(goal - progress, 0);
  const extra = Math.max(progress - goal, 0);
  const accent = color ?? "#ffaa5e";

  const runAction = (action) => {
    swipeableRef.current?.close();
    action?.();
  };

  const accessibilityActions = [
    onEdit && { name: "edit", label: "Edit goal" },
    onDelete && { name: "delete", label: "Delete goal" },
  ].filter(Boolean);

  const row = (
    <Pressable
      onPress={onPress}
      onLongPress={onEdit}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={
        completed
          ? `${title}. ${formatMoney(progress)} saved. Ready to buy.`
          : `${title}. ${formatMoney(progress)} of ${formatMoney(goal)} saved.${
              due ? ` ${due.text}.` : ""
            }`
      }
      accessibilityValue={
        completed ? undefined : { min: 0, max: goal, now: Math.min(progress, goal) }
      }
      accessibilityHint={
        completed
          ? "Mark it bought or raise the target."
          : onPress
            ? "Adds money to this goal."
            : undefined
      }
      accessibilityActions={
        accessibilityActions.length > 0 ? accessibilityActions : undefined
      }
      onAccessibilityAction={(event) => {
        const { actionName } = event.nativeEvent;
        if (actionName === "edit") onEdit?.();
        if (actionName === "delete") onDelete?.();
      }}
      android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
      className={`bg-primary py-3 border-b-2 border-alt-100 ${containerStyles ?? ""}`}
    >
      {({ pressed }) => (
        // Android shows the ripple; iOS needs its own pressed feedback
        <View
          className="flex-row items-center"
          style={{ opacity: Platform.OS === "ios" && pressed ? 0.6 : 1 }}
        >
          {completed ? (
            <>
              <MaterialCommunityIcons
                name="check-circle"
                size={28}
                color={accent}
              />
              <View className="flex-1 ml-3">
                <Text
                  className="text-white font-psemibold text-lg"
                  numberOfLines={1}
                >
                  {title}
                </Text>
                <Text className="text-muted font-pregular text-sm">
                  {formatMoney(progress)} saved
                  {extra > 0 ? ` · ${formatMoney(extra)} over target` : ""}
                </Text>
              </View>
              <Text className="text-secondary font-psemibold text-base ml-3">
                Bought it?
              </Text>
            </>
          ) : (
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text
                  className="flex-1 text-white font-psemibold text-lg"
                  numberOfLines={1}
                >
                  {title}
                </Text>
                {due && (
                  <Text
                    className={`font-pregular text-sm ml-3 ${
                      due.past ? "text-secondary" : "text-muted"
                    }`}
                  >
                    {due.text}
                  </Text>
                )}
              </View>

              <View className="flex-row items-baseline mt-1 mb-2">
                <Text className="flex-1 font-pregular text-base">
                  <Text className="text-white">{formatMoney(progress)}</Text>
                  <Text className="text-muted"> of {formatMoney(goal)}</Text>
                </Text>
                <Text className="text-muted font-pregular text-sm">
                  {`${formatMoney(toGo)} to go`}
                </Text>
              </View>

              <Progress.Bar
                progress={goal > 0 ? Math.min(progress / goal, 1) : 0}
                width={null}
                color={accent}
                unfilledColor="#203c56"
                borderWidth={0}
                height={8}
                borderRadius={4}
                animated={!reduceMotion}
              />
            </View>
          )}

          {/* Material list item: actions live behind a trailing overflow button */}
          {Platform.OS === "android" && onMore && (
            <Pressable
              onPress={onMore}
              // screen readers reach these through the row's Edit and Delete actions
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              accessibilityRole="button"
              accessibilityLabel={`More options for ${title}`}
              android_ripple={{
                color: "rgba(255,255,255,0.16)",
                borderless: true,
                radius: 24,
              }}
              className="w-12 h-12 items-center justify-center -mr-3 ml-1"
            >
              <MaterialIcons name="more-vert" size={24} color="#CDCDE0" />
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );

  if (Platform.OS !== "ios" || (!onEdit && !onDelete)) return row;

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={() => (
        <View className="flex-row border-b-2 border-alt-100">
          {onEdit && (
            <SwipeAction
              label="Edit"
              icon="pencil"
              background="#203c56"
              onPress={() => runAction(onEdit)}
            />
          )}
          {onDelete && (
            <SwipeAction
              label="Delete"
              icon="trash"
              background="#d32f2f"
              onPress={() => runAction(onDelete)}
            />
          )}
        </View>
      )}
    >
      {row}
    </ReanimatedSwipeable>
  );
};

export default BudgetContainer;
