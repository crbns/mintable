import AsyncStorage from "@react-native-async-storage/async-storage"
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
    chapter0: "chapter_0"
}

export const loadFromCache = async (key) => {
    try {
        const cachedData = await AsyncStorage.getItem(key);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
        console.log("Failed to load cached data, invalid key?")
        return null
    }
}

export const storeToCache = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        Alert.alert("Failed to store data to cache", error.message)
    }
}