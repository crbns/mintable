import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import { loadFromCache, storeToCache, CACHE_KEYS } from "../../lib/cacheUtil";
import { getCurrentUser } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  // key of cache, fn: appwrite function in appwrite.js
  const loadData = async (key, fn) => {
    setIsLoading(true);
    const cachedData = await loadFromCache(key);
    // if data already exists, load that and dont make call to db
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
      return;
    }

    // data isnt cached already so make call to appwrite db
    const dbData = await fn();
    await storeToCache(key, dbData);

    setData(dbData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData(CACHE_KEYS.userData, getCurrentUser);
  }, []);

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
    <SafeAreaView className="bg-primary h-full">
      <View className="items-center justify-center">
        <Text className="text-white">Hello {data.firstName}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Home;
