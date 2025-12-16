import {
  QueryClient,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";

// Create QueryClient with default options suitable for a budgeting app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      // Add logging for debugging
      onSuccess: (data) => {
        console.log("Query successful:", {
          dataLength: Array.isArray(data) ? data.length : "N/A",
          timestamp: new Date().toISOString(),
        });
      },
      onError: (error) => {
        console.error("Query failed:", {
          error: error?.message || "Unknown error",
          status: error?.status,
          timestamp: new Date().toISOString(),
        });
      },
    },
    mutations: {
      retry: false,
      // Add logging for debugging
      onSuccess: (data, variables, context) => {
        console.log("Mutation successful:", {
          data: data?.$id || "N/A",
          timestamp: new Date().toISOString(),
        });
      },
      onError: (error, variables, context) => {
        console.error("Mutation failed:", {
          error: error?.message || "Unknown error",
          status: error?.status,
          timestamp: new Date().toISOString(),
        });
      },
    },
  },
});

// Configure focusManager for React Native
focusManager.setEventListener((onFocus) => {
  const subscription = AppState.addEventListener("change", (status) => {
    console.log("App state changed:", {
      status,
      isFocused: status === "active",
    });
    if (status === "active") {
      onFocus();
    }
  });

  return () => subscription?.remove();
});

// Configure onlineManager for React Native
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    console.log("Network state changed:", {
      isConnected: !!state.isConnected,
      isInternetReachable: !!state.isInternetReachable,
      details: state.details,
    });
    setOnline(!!state.isConnected);
  });
});
