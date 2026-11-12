import { View, Text, Switch, Platform, Pressable } from "react-native";
import React, { useState } from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";

const DEFAULT_DAYS_AHEAD = 30;

const defaultDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_DAYS_AHEAD);
  return date;
};

// Optional target date: off means the goal has no deadline (stored as null)
const TargetDateField = ({ value, onChange, containerStyles }) => {
  const [androidPickerShown, setAndroidPickerShown] = useState(false);
  const enabled = value !== null && value !== undefined;
  // An overdue goal keeps its past date as the floor. With today as the floor,
  // iOS would show today while the old date stayed in the form, and picking
  // today would fire no change.
  const today = new Date();
  const minimumDate = enabled && value < today ? value : today;

  return (
    <View className={containerStyles}>
      <View className="flex-row items-center justify-between mx-2 min-h-[44px]">
        <Text className="text-base text-gray-100 font-pmedium">
          Target date
        </Text>
        <Switch
          accessibilityLabel="Target date"
          value={enabled}
          onValueChange={(on) => onChange(on ? defaultDate() : null)}
          trackColor={{ true: "#ffaa5e" }}
        />
      </View>

      {enabled &&
        (Platform.OS === "ios" ? (
          <View className="mx-2 mt-1 items-start">
            <RNDateTimePicker
              value={value}
              minimumDate={minimumDate}
              mode="date"
              onChange={(e, selectedDate) => {
                if (e.type === "set" && selectedDate) onChange(selectedDate);
              }}
              accentColor="#ffaa5e"
              themeVariant="dark"
            />
          </View>
        ) : (
          <>
            <Pressable
              onPress={() => setAndroidPickerShown(true)}
              className="mx-2 mt-1 self-start bg-alt-100 rounded-md px-3 py-2 min-h-[48px] justify-center"
            >
              <Text className="text-gray-100 font-pregular text-lg">
                {value.toLocaleDateString()}
              </Text>
            </Pressable>
            {androidPickerShown && (
              <RNDateTimePicker
                value={value}
                minimumDate={minimumDate}
                mode="date"
                onChange={(e, selectedDate) => {
                  setAndroidPickerShown(false);
                  if (e.type === "set" && selectedDate) onChange(selectedDate);
                }}
              />
            )}
          </>
        ))}
    </View>
  );
};

export default TargetDateField;
