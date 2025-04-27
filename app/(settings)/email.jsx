import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FormField from "../../components/FormField";
import CButton from "../../components/CButton";
import { router } from "expo-router";
import SmallError from "../../components/SmallError";
import { updateEmail } from "../../lib/appwrite";

const email = () => {
  const [newEmailForm, setNewEmailForm] = useState(null);
  const [confNewEmailForm, setConfNewEmailForm] = useState(null);
  const [passwordForm, setPasswordForm] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const emailRegex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  const onSave = async () => {
    if (!newEmailForm || !passwordForm) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    if (confNewEmailForm !== newEmailForm) {
      Alert.alert("Error", "Emails do not match.");
      return;
    }
    const res = await updateEmail(newEmailForm, passwordForm);
    console.log(res);
    if (res) {
      router.back();
      Alert.alert("Success", "Email has been sucessfully changed.");
    } else {
      Alert.alert(
        "Error",
        "Something went wrong. Ensure password is typed correctly."
      );
    }
  };

  useEffect(() => {
    setIsEmailValid(emailRegex.test(newEmailForm));
  }, [newEmailForm]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-primary p-5 h-full">
        <View className="flex-row items-center ">
          <Text className="text-3xl font-psemibold text-white flex-1">
            Change Email
          </Text>
          <TouchableOpacity
            className="items-end ml-5"
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="close" color={"gray"} size={32} />
          </TouchableOpacity>
        </View>
        <FormField
          title={"New Email"}
          otherStyles={"mt-5"}
          handleChangeText={(e) => setNewEmailForm(e)}
        />
        {!isEmailValid && <SmallError text={"Must be a valid email!"} />}
        <FormField
          title={"Confirm New Email"}
          otherStyles={"mt-5"}
          handleChangeText={(e) => setConfNewEmailForm(e)}
        />
        <FormField
          title={"Password"}
          otherStyles={"mt-5"}
          handleChangeText={(e) => setPasswordForm(e)}
        />

        <CButton
          title={"Save"}
          containerStyles={"mt-10"}
          handlePress={onSave}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default email;
