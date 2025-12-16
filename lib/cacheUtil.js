import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

export const CACHE_KEYS = {
  // for allocated cash
  budgetContributions: "budgetContributions",
  // for budget setup
  hasCompletedBudgetSetUp: "hasCompletedBudgetSetUp",
  // for db data handling
  currentUser: "currentUser",
  // for budget history
  budgetHistory: "budgetHistory",

  // not sure what this is used for
  userData: "user_profile",
  settings: "user_settings",
  // chapters
  chapter0: "chapter_0",
};

export const loadFromCache = async (key, expirationMs = null) => {
  try {
    const cachedData = await SecureStore.getItemAsync(key);
    if (!cachedData) return null;
    const parsed = JSON.parse(cachedData);
    if (
      expirationMs &&
      parsed.timestamp &&
      Date.now() - parsed.timestamp > expirationMs
    ) {
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.log("Failed to load cached data, invalid key?");
    return null;
  }
};

export const storeToCache = async (key, value) => {
  try {
    const toStore = {
      data: value,
      timestamp: Date.now(),
    };
    await SecureStore.setItemAsync(key, JSON.stringify(toStore));
  } catch (error) {
    Alert.alert("Failed to store data to cache", error.message);
  }
};
