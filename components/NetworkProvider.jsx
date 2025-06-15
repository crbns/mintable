import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { addEventListener } from "@react-native-community/netinfo";
import Modal from "./Modal";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {children}
      {!isConnected && (
        <Modal isOpen={true}>
          <View className="p-5">
            <MaterialCommunityIcons name="wifi-off" color={"red"} size={28} />
          </View>
        </Modal>
      )}
    </>
  );
};

export default NetworkProvider;
