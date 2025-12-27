import { View, Text, Alert, ActivityIndicator } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import React, { useState } from "react";
import { Functions } from "react-native-appwrite";
import { appleSignInToken, getCurrentUser } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
import { events, logEvent } from "../lib/appsflyer";
import { router } from "expo-router";

const AppleSignIn = () => {
  const { setIsLoggedIn, setUser } = useGlobalContext();
  const [isWorking, setIsWorking] = useState(false);

  const onSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      setIsWorking(true);
      console.log(credential);

      const res = await appleSignInToken(credential);

      if (!res) {
        console.error("Sign in error: no returning value from appwrite.");
        Alert.alert("Error", "Sign-In failed. Please try again.");
        return;
      }

      const user = await getCurrentUser();

      console.log("user: ", user);

      setUser(user);
      setIsLoggedIn(true);

      await logEvent(events.LOG_IN);

      router.replace("/home");
    } catch (e) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        console.log("Sign In Cancelled.");
      } else {
        console.error("Sign in error: ", e);
        Alert.alert("Error", "Sign-In failed. Please try again.");
      }
    }
    setIsWorking(false);
  };

  return (
    <>
      {isWorking ? (
        <View
          className="bg-black rounded-xl h-[50px] justify-center items-center"
          style={{ marginTop: 14, cornerRadius: 12 }}
        >
          <ActivityIndicator color={"#fff"} />
        </View>
      ) : (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={12}
          style={{ width: "100%", minHeight: 50, marginTop: 14 }}
          onPress={async () => await onSignIn()}
        />
      )}
    </>
  );
};

export default AppleSignIn;
