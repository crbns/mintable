import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native";

export const CACHE_KEYS = {
    userData: "user_profile",
    settings: "user_settings"
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