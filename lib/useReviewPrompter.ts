// useReviewPrompter.ts
import { useEffect, useRef } from "react";
import { Alert, Linking, AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

type Options = {
  minLaunches?: number; // first time we may prompt
  cooldownDays?: number; // wait after any answer before asking again
  storeUrlIOS?: string; // App Store URL as fallback
  storeUrlAndroid?: string; // Play Store URL as fallback
  feedbackUrl?: string; // your Google Form
  suppressInDev?: boolean; // set true to avoid alerts in dev
};

const KEYS = {
  launches: "review.launchCount",
  lastPromptAt: "review.lastPromptAt", // ISO string
  dismissedForever: "review.dismissedForever",
  leftReview: "review.leftReview",
};

async function getNum(key: string, def = 0) {
  const v = await AsyncStorage.getItem(key);
  return v ? Number(v) : def;
}
async function getBool(key: string, def = false) {
  const v = await AsyncStorage.getItem(key);
  return v ? v === "1" : def;
}
async function setBool(key: string, val: boolean) {
  await AsyncStorage.setItem(key, val ? "1" : "0");
}
async function daysSince(dateISO?: string | null) {
  if (!dateISO) return Infinity;
  const then = new Date(dateISO).getTime();
  const now = Date.now();
  return (now - then) / (1000 * 60 * 60 * 24);
}

export function useReviewPrompter(opts: Options = {}) {
  const {
    minLaunches = 5,
    cooldownDays = 14,
    storeUrlIOS,
    storeUrlAndroid,
    feedbackUrl = "https://forms.gle/QJW1saoLRsZe1mgB7",
    suppressInDev = true,
  } = opts;

  const appState = useRef(AppState.currentState);

  // Increment launch count once per app load
  useEffect(() => {
    (async () => {
      const launches = await getNum(KEYS.launches);
      await AsyncStorage.setItem(KEYS.launches, String(launches + 1));
    })();
  }, []);

  // Consider prompting when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      const prev = appState.current;
      appState.current = nextState;
      if (prev.match(/inactive|background/) && nextState === "active") {
        maybePrompt();
      }
    });
    // Also try once shortly after mount
    setTimeout(() => {
      maybePrompt();
    }, 1200);
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function maybePrompt() {
    if (__DEV__ && suppressInDev) return;

    const [launches, lastPromptISO, dismissedForever, leftReview] =
      await Promise.all([
        getNum(KEYS.launches),
        AsyncStorage.getItem(KEYS.lastPromptAt),
        getBool(KEYS.dismissedForever),
        getBool(KEYS.leftReview),
      ]);

    if (dismissedForever || leftReview) return;
    if (launches < minLaunches) return;

    const since = await daysSince(lastPromptISO);
    if (since < cooldownDays) return;

    await AsyncStorage.setItem(KEYS.lastPromptAt, new Date().toISOString());
    showEnjoyingPrompt();
  }

  function showEnjoyingPrompt() {
    Alert.alert("Enjoying the app?", "Your feedback helps us improve.", [
      { text: "Not really", onPress: () => showFeedbackPrompt() },
      { text: "Yes", onPress: () => showReviewPrompt() },
      { text: "Ask me later", style: "cancel" },
    ]);
  }

  function showFeedbackPrompt() {
    Alert.alert(
      "Share feedback?",
      "Would you like to leave feedback so we can make things better?",
      [
        { text: "No thanks", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await Linking.openURL(feedbackUrl);
            } catch {}
          },
        },
        {
          text: "Do not ask again",
          onPress: async () => setBool(KEYS.dismissedForever, true),
        },
      ]
    );
  }

  async function showReviewPrompt() {
    try {
      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
        await setBool(KEYS.leftReview, true);
        return;
      }
    } catch {
      // fall through to URL
    }
    // Fallback to store page
    const target =
      Platform.select({ ios: storeUrlIOS, android: storeUrlAndroid }) ||
      storeUrlAndroid ||
      storeUrlIOS;
    if (target) {
      try {
        await Linking.openURL(target);
        await setBool(KEYS.leftReview, true);
      } catch {}
    }
  }

  // Expose a manual trigger in case you want a button to test it
  return { triggerReviewPrompt: () => showEnjoyingPrompt() };
}
