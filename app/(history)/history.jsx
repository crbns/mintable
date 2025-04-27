import {
  View,
  Text,
  RefreshControl,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import images from "../../constants/images";
import { CACHE_KEYS, loadFromCache } from "../../lib/cacheUtil";
import { router } from "expo-router";

// TODO: Finish this

const History = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);

  const onRefresh = async () => {
    const res = await loadFromCache(CACHE_KEYS.budgetHistory);
  };

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <SafeAreaView
      className="bg-primary h-full px-5 pt-5"
      edges={["right", "top", "left"]}
    >
      <View className="flex-row items-center gap-2">
        <Text className="text-white font-psemibold text-2xl flex-1">
          Budget History
        </Text>

        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={32} color={"gray"} />
        </TouchableOpacity>
      </View>
      <ScrollView
        className=""
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => {
                onRefresh();
              }, 3000);
            }}
          />
        }
      ></ScrollView>
    </SafeAreaView>
  );
};

export default History;
