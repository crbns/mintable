import { cache, useState } from "react";
import { loadFromCache, storeToCache } from "./cacheUtil";

// returns false if data doesn't exist in cache
const loadData = async (key) => {
    const cachedData = await loadFromCache(key);

    if (cachedData) {
      return cachedData;
    }
    return false;
};

// returns false if data already exists in cache. force to overwrite
const storeData = async (key, data, force) => {
    const cachedData = await loadFromCache(key);

    if(cachedData && !force) {
        return false;
    }

    await storeToCache(key, data);

    return true;
}

// load if exists, store if doesn't exist
const loadStoreData = async (key, fn, force) => {
    const cachedData = await loadData(key);
    if(cachedData) {
        return cachedData
    }
    const dbData = await fn();
    storeData(key, dbData, force);
    return dbData;
}

export default {loadData, storeData}