import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";

import images from "../../constants/images";
import FormField from "../../components/FormField";
import CButton from "../../components/CButton";
import { getCurrentUser, signIn } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { events, logEvent } from "../../lib/appsflyer";

const SignIn = () => {
  const { setIsLoggedIn, setUser } = useGlobalContext();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all the fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(form.email, form.password);

      const user = await getCurrentUser();

      setUser(user);
      setIsLoggedIn(true);

      await logEvent(events.LOG_IN);

      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center px-4 my-6">
          <View className="flex-row justify-between items-center">
            <Image
              source={images.logoHoriz}
              resizeMode="contain"
              className="w-[150px] h-[35px]"
            />
            <TouchableOpacity onPress={() => router.replace("/home")}>
              <MaterialCommunityIcons
                name="close"
                color={"#203c56"}
                size={35}
              />
            </TouchableOpacity>
          </View>
          <Text className="text-3xl text-white font-semibold mt-8">
            Log in to Mintable
          </Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-3"
          />

          <CButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-20"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
