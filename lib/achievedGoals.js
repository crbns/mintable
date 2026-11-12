import AsyncStorage from "@react-native-async-storage/async-storage";

// Goals the user marked as bought. Appwrite deletes the goal itself, so this
// on-device list is what keeps the win around afterwards.
const MAX_ENTRIES = 50;
const keyFor = (userId) => `achievedGoals:${userId}`;

export const loadAchievedGoals = async (userId) => {
  if (!userId) return [];
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Couldn't read achieved goals:", error);
    return [];
  }
};

// Newest first. Returns the updated list.
export const addAchievedGoal = async (userId, entry) => {
  const current = await loadAchievedGoals(userId);
  const next = [entry, ...current.filter((e) => e.id !== entry.id)].slice(
    0,
    MAX_ENTRIES,
  );
  try {
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(next));
  } catch (error) {
    console.error("Couldn't save achieved goal:", error);
  }
  return next;
};
