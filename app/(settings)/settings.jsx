import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { nativeApplicationVersion } from "expo-application";
import CButton from "../../components/CButton";
import { logOut, requestDeleteAccount } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import Modal from "../../components/Modal";

const SETTINGS = [
  // {
  //   group: "Profile",
  //   requiresAccount: true,
  //   items: [
  //     {
  //       id: "name",
  //       icon: "account-edit-outline",
  //       label: "Edit name",
  //       type: "link",
  //     },
  //     // Add functionality later for email and password changes
  //     // {
  //     //   id: "email",
  //     //   icon: "email-edit-outline",
  //     //   label: "Change email",
  //     //   type: "link",
  //     // },
  //     // {
  //     //   id: "password",
  //     //   icon: "key-outline",
  //     //   label: "Change password",
  //     //   type: "link",
  //     // },
  //   ],
  // },
  {
    group: "Budgeting",
    requiresAccount: true,
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
  {
    group: "Other",
    requiresAccount: false,
    items: [
      {
        id: "bugReport",
        icon: "bug",
        label: "Report Bugs",
        type: "link",
      },
      {
        id: "bugReport",
        icon: "chat-processing",
        label: "Give Feedback",
        type: "redirect",
        link: "https://forms.gle/5Hq8bfCZeRBhsCcB9",
      },
    ],
  },
];

const Settings = () => {
  const { setUser, setIsLoggedIn, isLoggedIn, user } = useGlobalContext();
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

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

        {SETTINGS.map(({ group, items, requiresAccount }) => {
          console.log(requiresAccount + "|" + isLoggedIn);
          if (isLoggedIn || !requiresAccount) {
            return (
              <View className="mt-5" key={group}>
                <Text className="text-white font-psemibold text-2xl ml-2">
                  {group}
                </Text>
                <View className="rounded-md bg-alt-100 mt-2 py-1">
                  {items.map(({ id, icon, label, type, link }) => (
                    <View key={id}>
                      <TouchableOpacity
                        className="flex-row p-5 items-center"
                        onPress={() => {
                          switch (type) {
                            case "link":
                              router.push(id);
                              break;
                            case "redirect":
                              Linking.openURL(link);

                            default:
                              console.error(
                                "No type set for settings object with id" +
                                  id +
                                  "!"
                              );
                              break;
                          }
                        }}
                      >
                        <MaterialCommunityIcons
                          name={icon}
                          size={24}
                          color={"#FFFFFF"}
                        />
                        <Text className="text-white text-xl font-pregular ml-5 flex-1">
                          {label}
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={18}
                          color={"#FFFFFF"}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            );
          } else {
            return null;
          }
        })}

        {isLoggedIn && user && (
          <>
            <CButton
              title={"Log Out"}
              containerColor={"bg-red-500"}
              containerStyles={"mt-8"}
              handlePress={async () => {
                const r = await logOut();
                if (r) {
                  router.replace("/");
                  setIsLoggedIn(false);
                  setUser(null);
                } else {
                  Alert.alert("Error", "Something went wrong");
                }
              }}
            />

            <CButton
              title={"Delete Account"}
              containerStyles={"mt-3 border-2 border-red-500"}
              containerColor={"bg-primary"}
              textColor={"text-red-500"}
              textStyles={"font-pregular"}
              handlePress={() => {
                setDeleteAccountModal(true);
              }}
            />
          </>
        )}

        <Modal isOpen={deleteAccountModal}>
          <View className="bg-primary w-full p-4 rounded-md">
            <View className="flex flex-row items-center justify-center">
              <Text className="text-white font-bold text-center">
                Are you sure you want to delete your account?
              </Text>
              <TouchableOpacity onPress={() => setDeleteAccountModal(false)}>
                <MaterialCommunityIcons name="close" color={"gray"} size={32} />
              </TouchableOpacity>
            </View>
            <Text className="text-white font-bold text-center mt-1">
              This action is irreversible.
            </Text>
            <CButton
              title={"I am sure"}
              containerColor={"bg-red-500"}
              containerStyles={"mt-8"}
              handlePress={async () => {
                await requestDeleteAccount();
                setDeleteAccountModal(false);
                setIsLoggedIn(false);
                setUser(null);
                router.replace("/");
              }}
            />
          </View>
        </Modal>

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
          <Text className="font-pregular text-gray-500">
            Made by Isaac Robinson
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
