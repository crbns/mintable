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
      <Modal isOpen={!isConnected} key={isConnected ? "online" : "offline"}>
        <View className="bg-primary w-full p-5 rounded-md flex justify-center items-center">
          <MaterialCommunityIcons name="wifi-off" color={"red"} size={40} />
          <View className="mt-5 mx-5">
            <Text className="text-white font-psemibold text-2xl text-center">
              No Internet Connection
            </Text>
            <Text className="text-white font-pregular mt-3 text-center">
              You don't seem to be connected to the internet. Please check your
              connection and try again later.
            </Text>
          </View>
        </View>
      </Modal>

      {/* {!isConnected && (
        <View>
          <Text>NO CONNECTION</Text>
        </View>
      )} */}
    </>
  );
};

export default NetworkProvider;
