import { useEffect } from "react";
import { Alert } from "react-native";
import * as Updates from "expo-updates";

const ForceUpdateGate = ({ children }) => {
  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "Update Available",
            "A new version is available and required. The app will now restart.",
            [
              {
                text: "Restart Now",
                onPress: () => Updates.reloadAsync(),
              },
            ],
            { cancelable: false }
          );
        }
      } catch (e) {
        console.error("Update check failed", e);
        Alert.alert(
          "Update Check Failed",
          "We couldn't check for the latest version.",
          [{ text: "OK" }]
        );
      }
    };

    checkForUpdate();
  }, []);

  return children;
};

export default ForceUpdateGate;
