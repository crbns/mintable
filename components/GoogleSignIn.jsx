import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import Google from "../assets/logos/Google.svg";
import { googleOAuthSession } from "../services/auth";
import { router } from "expo-router";
import { getCurrentUser } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
import { events, logEvent } from "../lib/appsflyer";

const GoogleSignIn = () => {
  const { setIsLoggedIn, setUser } = useGlobalContext();
  const [isWorking, setIsWorking] = useState(false);

  const authFlow = async () => {
    setIsWorking(true);

    try {
      const res = await googleOAuthSession();

      if (!res || res.searchParams.has('error')) {
        Alert.alert("Error", "Sign-In failed. Please try again.");
        setIsWorking(false);
        return;
      }

      const user = await getCurrentUser();

      setUser(user);
      setIsLoggedIn(true);

      await logEvent(events.LOG_IN);

      router.replace("/home");
    } catch (error) {
      console.error(error.message);
    }

    setIsWorking(false);
  }

  return (
    <>
      {isWorking ? (
        <View className="bg-white min-h-[50px] items-center justify-center flex-row gap-2 rounded-xl" style={{ marginTop: 14 }}>
          <ActivityIndicator color={'#000'} />
        </View>
      ) : (
        <TouchableOpacity className="bg-white min-h-[50px] items-center justify-center flex-row gap-2 rounded-xl" style={{ marginTop: 14 }} onPress={async () => {
          await authFlow();
        }}>
          <Google width={20} height={20} />
          <Text className="font-pmedium text-black text-2xl text-center">Sign in With Google</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default GoogleSignIn;
