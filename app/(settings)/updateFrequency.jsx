import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FormField from "../../components/FormField";
import CButton from "../../components/CButton";
import DropDown from "../../components/DropDown";
import { getPreferences, updatePreferences } from "../../lib/appwrite";
import SmallInfo from "../../components/SmallInfo";

const updateFrequency = () => {
  const [dateFreqDropdownOpen, setdateFreqDropdownOpen] = useState(false);
  const [dateFreqDropdownValue, setdateFreqDropdownValue] = useState(null);
  const [dateFreqDropdownItems, setdateFreqDropdownItems] = useState([
    { label: "Saturday", value: "saturday" },
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Sunday", value: "sunday" },
  ]);

  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);
  const [frequencyDropdownValue, setFrequencyDropdownValue] = useState(null);
  const [frequencyDropdownItems, setFrequencyDropdownItems] = useState([
    // { label: "Weekly", value: "weekly" },
    // { label: "Bi-Weekly", value: "biweekly" },
    // { label: "Semi-Monthly", value: "semimonthly" },
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
  ]);

  const onSave = async () => {
    if (frequencyDropdownValue === null) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    if (
      (frequencyDropdownValue === "weekly" ||
        frequencyDropdownValue === "biweekly") &&
      dateFreqDropdownValue === null
    ) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    const prefs = await getPreferences();

    prefs.updateFreq = frequencyDropdownValue;
    if (dateFreqDropdownValue !== null) {
      prefs.updateFreqDate = dateFreqDropdownValue;
    }

    const res = await updatePreferences(prefs);
    if (res) {
      router.back();
      Alert.alert(
        "Success",
        "Update frequency has been sucessfully changed to " +
          frequencyDropdownValue +
          "."
      );
    } else {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-primary p-5 h-full">
        <View className="flex-row items-center ">
          <Text className="text-3xl font-psemibold text-white flex-1">
            Change Update Frequency
          </Text>
          <TouchableOpacity
            className="items-end ml-5"
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="close" color={"gray"} size={32} />
          </TouchableOpacity>
        </View>
        <View className="mt-5">
          <DropDown
            zIndex={9999}
            open={frequencyDropdownOpen}
            value={frequencyDropdownValue}
            items={frequencyDropdownItems}
            setOpen={setFrequencyDropdownOpen}
            setValue={setFrequencyDropdownValue}
            setItems={setFrequencyDropdownItems}
            title={"Frequency"}
            containerStyles={"mt-5"}
          />
          {/* this surely could be optimized */}
          {frequencyDropdownValue === "monthly" && (
            <SmallInfo
              text={
                "Your virtual balance will be updated on the first day of each month."
              }
              iconSize={20}
            />
          )}
          {frequencyDropdownValue === "quarterly" && (
            <SmallInfo
              text={
                "Your virtual balance will be updated on the first day of each quarter."
              }
              iconSize={20}
            />
          )}
          {frequencyDropdownValue === "yearly" && (
            <SmallInfo
              text={
                "Your virtual balance will be updated on the first day of the year."
              }
              iconSize={20}
            />
          )}
          {frequencyDropdownValue !== "yearly" &&
            frequencyDropdownValue !== "quarterly" &&
            frequencyDropdownValue !== "monthly" && (
              <DropDown
                open={dateFreqDropdownOpen}
                value={dateFreqDropdownValue}
                items={dateFreqDropdownItems}
                setOpen={setdateFreqDropdownOpen}
                setValue={setdateFreqDropdownValue}
                setItems={setdateFreqDropdownItems}
                title={"Which day to update on?"}
                containerStyles={"mt-5"}
              />
            )}
        </View>
        <CButton
          title={"Save"}
          containerStyles={"mt-10"}
          handlePress={onSave}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default updateFrequency;
