import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import CButton from "./CButton";
import { useGlobalContext } from "../context/GlobalProvider";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { getVirtualBalance } from "../lib/appwrite";
import { getDaysUntilNextUpdate } from "../lib/dateUtil";

const BudgetVirtualBalance = ({
  refreshing,
  virtualBalance,
  onPress,
  containerStyles,
}) => {
  const { user } = useGlobalContext();
  const { data: vBalanceData } = useQuery({
    queryKey: queryKeys.virtualBalance.current(user?.$id),
    queryFn: () => getVirtualBalance(user),
    enabled: !!user,
  });

  let daysUntilRefresh = null;
  if (vBalanceData && vBalanceData[0]) {
    const updateFreq = vBalanceData[0].updateFreq;
    daysUntilRefresh = getDaysUntilNextUpdate(updateFreq);
  }

  return (
    <View
      className={`relative border-2 border-b-4 border-alt-100 p-3 rounded-xl mt-3 ${containerStyles}`}
    >
      {daysUntilRefresh && (
        <View className="absolute top-2 right-2 bg-alt-100 rounded-full px-2 py-1">
          <Text className="text-white text-rg font-pregular">
            Updates in: {daysUntilRefresh}{" "}
            {daysUntilRefresh === 1 ? "day" : "days"}
          </Text>
        </View>
      )}
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
