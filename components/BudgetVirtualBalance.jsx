import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import CButton from "./CButton";

const BudgetVirtualBalance = ({
  refreshing,
  virtualBalance,
  onPress,
  containerStyles,
}) => {
  return (
    <View
      className={`border-2 border-b-4 border-alt-100 p-3 rounded-xl mt-3 ${containerStyles}`}
    >
      <Text className="text-white font-pregular">Virtual Balance</Text>
      {refreshing ? (
        <ActivityIndicator />
      ) : (
        <Text className="text-5xl font-plight text-white pt-3">
          ${virtualBalance}
        </Text>
      )}
      <CButton
        title={"Allocate"}
        containerColor={"bg-alt-100"}
        textColor={"text-white"}
        textWeight={"font-pregular"}
        handlePress={onPress}
      />
    </View>
  );
};

export default BudgetVirtualBalance;
