import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { nativeApplicationVersion } from "expo-application";
import CButton from "../../components/CButton";
import { logOut } from "../../lib/appwrite";

const SETTINGS = [
  {
    group: "Profile",
    items: [
      {
        id: "name",
        icon: "account-edit-outline",
        label: "Edit name",
        type: "link",
      },
      // Add functionality later for email and password changes
      // {
      //   id: "email",
      //   icon: "email-edit-outline",
      //   label: "Change email",
      //   type: "link",
      // },
      // {
      //   id: "password",
      //   icon: "key-outline",
      //   label: "Change password",
      //   type: "link",
      // },
    ],
  },
  {
    group: "Budgeting",
    items: [
      {
        id: "updateFrequency",
        icon: "reload",
        label: "Change update frequency",
        type: "link",
      },
      {
        id: "updateAmount",
        icon: "cash-plus",
        label: "Edit update amount",
        type: "link",
      },
    ],
  },
];

const Settings = () => {
  return (
    <SafeAreaView className="bg-primary h-full px-5 pt-5">
      <ScrollView>
        <View className="flex-row items-center ">
          <Text className="text-3xl font-pbold text-white flex-1 align-middle">
            Settings
          </Text>
          <TouchableOpacity
            className="items-end ml-5"
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="close" color={"gray"} size={32} />
          </TouchableOpacity>
        </View>

        {SETTINGS.map(({ group, items }) => (
          <View className="mt-5" key={group}>
            <Text className="text-white font-psemibold text-2xl ml-2">
              {group}
            </Text>
            <View className="rounded-md bg-alt-100 mt-2 py-1">
              {items.map(({ id, icon, label, type }) => (
                <View key={id}>
                  <TouchableOpacity
                    className="flex-row p-5 items-center"
                    onPress={() => router.push(id)}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={24}
                      color={"#FFFFFF"}
                    />
                    <Text className="text-white text-xl font-pregular ml-5 flex-1">
                      {label}
                    </Text>
                    {type === "link" && (
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={18}
                        color={"#FFFFFF"}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}

        <CButton
          title={"Log Out"}
          containerColor={"bg-red-500"}
          containerStyles={"mt-5"}
          handlePress={async () => {
            const r = await logOut();
            if (r) {
              router.replace("/");
            } else {
              Alert.alert("Error", "Something went wrong");
            }
          }}
        />

        <View className="justify-center items-center mt-10">
          <Text className="font-pregular text-gray-500">
            Version {nativeApplicationVersion}
          </Text>
          <Text
            className="font-pregular text-gray-500"
            onPress={() => Linking.openURL("https://icons8.com")}
          >
            Icons by Icon8
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
