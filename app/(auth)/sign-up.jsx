import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";

import images from "../../constants/images";
import FormField from "../../components/FormField";
import CButton from "../../components/CButton";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { createUser, getCurrentUser } from "../../lib/appwrite";
import SmallError from "../../components/SmallError";
import { useGlobalContext } from "../../context/GlobalProvider";
import { USERNAME_REGEX } from "../../constants/constants";
import { events, logEvent } from "../../lib/appsflyer";

const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();

  const emailRegex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pwdValid, setPwdValid] = useState(true);
  const [userValid, setUserValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [regUserValid, setRegUserValid] = useState(true);

  const submit = async () => {
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      // !form.firstName ||
      // !form.lastName
      !isEmailValid
    ) {
      Alert.alert("Error", "Please fill in all the fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await createUser(form.email, form.password, form.username);

      setUser(user);
      setIsLoggedIn(true);

      logEvent(events.SIGN_UP);

      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (form.email === "") {
      return;
    }
    setIsEmailValid(emailRegex.test(form.email));
  }, [form.email]);

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
            Sign up to Mintable
          </Text>

          {/* <View className="flex flex-row gap-5 justify-center items-center">
            <FormField
              title="First Name"
              value={form.firstName}
              handleChangeText={(e) => setForm({ ...form, firstName: e })}
              otherStyles="mt-7 flex-1"
            />
            <FormField
              title="Last Name"
              value={form.lastName}
              handleChangeText={(e) => setForm({ ...form, lastName: e })}
              otherStyles="mt-7 flex-1"
            />
          </View> */}

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => {
              setForm({ ...form, username: e });
            }}
            otherStyles="mt-3"
          />

          {!userValid ? (
            <SmallError text="Username cannot be longer than 20 characters" />
          ) : null}
          {!regUserValid ? (
            <SmallError text="Username can only contain letters, numbers, underscores, and periods." />
          ) : null}

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => {
              setForm({ ...form, email: e });
            }}
            otherStyles="mt-3"
            keyboardType="email-address"
          />

          {!isEmailValid ? (
            <SmallError text="Please enter a valid email address" />
          ) : null}

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-3"
          />

          {!pwdValid ? (
            <SmallError text="Password must be least 8 characters" />
          ) : null}

          <CButton
            title="Sign Up"
            handlePress={() => {
              let pwdValid_,
                userValid_,
                regUserValid_ = false;
              pwdValid_ =
                form.password.length >= 8 && form.password.length <= 256;

              regUserValid_ = USERNAME_REGEX.test(form.username);

              userValid_ = !(form.username.length > 20);

              setPwdValid(pwdValid_);
              setUserValid(userValid_);
              setRegUserValid(regUserValid_);

              if (pwdValid_ && userValid_ && regUserValid_) submit();
            }}
            containerStyles="mt-20"
            isWorking={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Already have an account?
            </Text>
            <Link
              href="/sign-in"
              className="text-lg font-psemibold text-secondary"
            >
              Sign In
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
