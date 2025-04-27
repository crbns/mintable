import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../components/FormField";
import CButton from "../../components/CButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { updateName } from "../../lib/appwrite";

const username = () => {
  const [firstNameForm, setFirstNameForm] = useState(null);
  const [lastNameForm, setLastNameForm] = useState(null);
  const [confFirstNameForm, setConfFirstNameForm] = useState(null);
  const [confLastNameForm, setConfLastNameForm] = useState(null);

  const onSave = async () => {
    if (
      !firstNameForm ||
      !lastNameForm ||
      !confFirstNameForm ||
      !confLastNameForm
    ) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    if (
      firstNameForm !== confFirstNameForm ||
      lastNameForm !== confLastNameForm
    ) {
      Alert.alert("Error", "Names do not match.");
      return;
    }
    const res = await updateName(firstNameForm, lastNameForm);
    if (res) {
      router.back();
      Alert.alert("Success", "Name has been sucessfully changed.");
    } else {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-primary p-5 h-full">
        <View className="flex-row items-center ">
          <Text className="text-3xl font-psemibold text-white flex-1">
            Edit Name
          </Text>
          <TouchableOpacity
            className="items-end ml-5"
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="close" color={"gray"} size={32} />
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-5 mt-5">
          <FormField
            title={"New First Name"}
            otherStyles={"flex-1"}
            handleChangeText={(e) => setFirstNameForm(e)}
          />
          <FormField
            title={"New Last Name"}
            otherStyles={"flex-1"}
            handleChangeText={(e) => setLastNameForm(e)}
          />
        </View>
        <View className="flex-row gap-5 mt-2">
          <FormField
            title={"Confirm First Name"}
            otherStyles={"flex-1"}
            handleChangeText={(e) => setConfFirstNameForm(e)}
          />
          <FormField
            title={"Confirm Last Name"}
            otherStyles={"flex-1"}
            handleChangeText={(e) => setConfLastNameForm(e)}
          />
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

export default username;
