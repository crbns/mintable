import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import { loadFromCache, storeToCache, CACHE_KEYS } from "../../lib/cacheUtil";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import pregular from "../../assets/fonts/Poppins-Regular.ttf";
import CButton from "../../components/CButton";
import BudgetContributionGraph from "../../components/BudgetContributionGraph";
import HomeBudgetList from "../../components/HomeBudgetList";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getPreferences, updatePreferences } from "../../lib/appwrite";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";

const Home = () => {
  const { user, isLoggedIn, isLoading } = useGlobalContext();

  // const [data, setData] = useState(null);
  const [greeting, setGreeting] = useState("");

  // key of cache, fn: appwrite function in appwrite.js
  const loadData = async (key, fn) => {
    setIsLoading(true);
    const cachedData = await loadFromCache(key);
    // if data already exists, load that and dont make call to db
    // ##### this is unreliable as when data changes, the key still exists so it will try and load the old data ######
    // if (cachedData) {
    //   console.log("loading cached data");
    //   setData(cachedData);
    //   setIsLoading(false);
    //   return;
    // }

    // data isnt cached already so make call to appwrite db
    // console.log("loading db data");
    const dbData = await fn();
    // await storeToCache(key, dbData);

    setData(dbData);
    setIsLoading(false);
  };

  const [barData, setBarData] = useState(
    Array.from({ length: 7 }, (_, index) => ({
      day: index + 1,
      amount: 0,
    }))
  );
  const [changeFromLast, setchangeFromLast] = useState(0);

  // const loadBarData = async () => {
  //   const balanceContributionss = await loadFromCache(
  //     CACHE_KEYS.budgetContributions
  //   );

  //   let parsedContribution;
  //   if (!balanceContributionss) {
  //     // if no balance contributions in cache, initialize the json
  //     const jsonString =
  //       '{"values": ["0","0","0","0","0","0","0"],"last": "0","lastDate": "-1"}';
  //     parsedContribution = JSON.parse(jsonString);
  //     await storeToCache(CACHE_KEYS.budgetContributions, jsonString);
  //   } else {
  //     parsedContribution = JSON.parse(balanceContributionss);
  //   }

  //   const bCTotal = parsedContribution.values.reduce(
  //     (partialSum, a) => partialSum + a,
  //     0
  //   );

  //   setchangeFromLast(bCTotal - parseInt(parsedContribution.last));

  //   setBarData(
  //     Array.from({ length: 7 }, (_, index) => ({
  //       day: index + 1,
  //       amount: parseInt(parsedContribution.values[index]),
  //     }))
  //   );

  //   await updateBudgetListOnNewWeek(parsedContribution);
  // };

  // const updateBudgetListOnNewWeek = async (parsedData) => {
  //   const bCTotal = parsedData.values.reduce(
  //     (partialSum, a) => partialSum + parseInt(a),
  //     0
  //   );

  //   if (
  //     new Date().getDay() === 0 &&
  //     parseInt(parsedData.lastDate) !== new Date().getDate()
  //   ) {
  //     // console.log("replacing old budget list with zeroed out one");
  //     const next = parsedData;

  //     next.last = bCTotal;
  //     next.values = ["0", "0", "0", "0", "0", "0", "0"];
  //     next.lastDate = new Date().getDate();
  //     // console.log(JSON.stringify(next));
  //     storeToCache(CACHE_KEYS.budgetContributions, JSON.stringify(next));
  //     await loadBarData();
  //   }
  // };

  // useEffect(() => {
  //   // loadData(CACHE_KEYS.userData, getCurrentUser);
  //   loadBarData();

  //   // check if the budget contribtion json needs to be refreshed
  //   // console.log("checking if exists:" + balanceContributions);
  //   // if (balanceContributions) {
  //   //   updateBudgetListOnNewWeek();
  //   //   loadBarData();
  //   // }
  // }, []);

  const [setupComplete, setSetupComplete] = useState(true);

  // Use React Query for preferences
  const { data: preferences } = useQuery({
    queryKey: queryKeys.preferences.current(),
    queryFn: async () => {
      console.log("[QUERY] Fetching preferences");
      const result = await getPreferences();
      console.log("[QUERY] Preferences fetched:", result);
      return result;
    },
  });

  const checkBudgetSetup = async () => {
    if (!preferences) return;

    // if cache key doesn't exist, call db and store value to cache
    if (preferences.budgetOnboardComplete === null) {
      setSetupComplete(false);
      const updatedPrefs = { ...preferences, budgetOnboardComplete: false };
      await updatePreferences(updatedPrefs);
    } else if (preferences.budgetOnboardComplete === true) {
      setSetupComplete(true);
    } else if (preferences.budgetOnboardComplete === false) {
      setSetupComplete(false);
    }
  };

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        setGreeting("Good morning");
      } else if (currentHour < 18) {
        setGreeting("Good afternoon");
      } else {
        setGreeting("Good evening");
      }
    };
    updateGreeting();
  }, []);

  // Check budget setup when preferences are loaded
  useEffect(() => {
    if (preferences) {
      checkBudgetSetup();
    }
  }, [preferences]);

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color="#ffaa5e"
        className="justify-center items-center h-full bg-primary"
      />
    );
  }

  return (
    <SafeAreaView
      className="bg-primary h-full px-5 pt-5"
      edges={["right", "top", "left"]}
    >
      <ScrollView className="h-full" showsVerticalScrollIndicator={false}>
        <View className="justify-center">
          <View className="flex-row justify-center mb-2">
            <Text className="text-white font-psemibold text-left text-3xl items-start flex-1">
              {greeting}
              {/* {isLoggedIn && "\n" + user?.firstName} */}
            </Text>
            <TouchableOpacity
              className="items-end mr-2"
              onPress={() => router.push("settings")}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                color={"gray"}
                size={28}
              />
            </TouchableOpacity>
            {process.env.EXPO_PUBLIC_DEBUG_MODE === "true" && (
              <TouchableOpacity
                className="items-end mr-2"
                onPress={() => router.push("debug")}
              >
                <MaterialCommunityIcons
                  name="bug-outline"
                  color={"gray"}
                  size={28}
                />
              </TouchableOpacity>
            )}
          </View>
          <View className="h-1 bg-alt-100 rounded-full" />

          <View className="flex-1 justify-between bg-alt-100 rounded-md mt-5 p-5">
            {isLoggedIn || !setupComplete ? (
              <BudgetContributionGraph />
            ) : (
              <>
                <Text className="font-psemibold text-md text-white text-center">
                  Your budget graph will appear here once you've created a
                  budget.
                </Text>
                <CButton
                  title={"Go to Budgets"}
                  containerStyles={"mt-5"}
                  handlePress={() => router.push("/budget")}
                />
              </>
            )}
          </View>

          {/* Can be added in a later release
          
          <Text className="text-white font-pregular text-left text-3xl mt-10">
            Budgeting
          </Text>
          <View className="h-1 bg-alt-100 rounded-full mt-2" />

          <HomeBudgetList /> */}

          <Text className="text-white font-pregular text-left text-3xl mt-14">
            Learn
          </Text>
          <View className="h-1 bg-alt-100 rounded-full mt-2" />
          <View>
            <View className="w-full rounded-md bg-alt-100 mt-5 p-5">
              <Text className="text-center text-white font-psemibold">
                Budget Basics
              </Text>
              <Text className="text-center text-gray-500 font-pregular">
                Learn the basics of budgeting
              </Text>
              <CButton
                title={"Start"}
                containerStyles={"mt-1"}
                handlePress={() =>
                  router.push("/takeQuiz?chapter=1&lessonId=1")
                }
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
