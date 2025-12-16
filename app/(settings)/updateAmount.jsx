import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FormField from "../../components/FormField";
import CButton from "../../components/CButton";
import DropDown from "../../components/DropDown";
import {
  getPreferences,
  updatePreferences,
  updateVirtualBalanceUpdateAmount,
} from "../../lib/appwrite";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";

const updateAmount = () => {
  const [addAmount, setAddAmount] = useState(0);
  const queryClient = useQueryClient();

  const updateAmountMutation = useMutation({
    mutationFn: async (amount) => {
      console.log(
        "🔄 [MUTATION] Updating virtual balance update amount:",
        amount
      );
      const result = await updateVirtualBalanceUpdateAmount(amount);
      console.log(
        "✅ [MUTATION] Virtual balance update amount updated successfully"
      );
      return result;
    },
    onSuccess: () => {
      // Invalidate virtual balance queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.virtualBalance.all,
      });
      router.back();
      Alert.alert(
        "Success",
        "Amount has been successfully changed to $" + addAmount + "."
      );
    },
    onError: (error) => {
      console.error(
        "❌ [MUTATION] Failed to update virtual balance update amount:",
        error
      );
      Alert.alert("Error", "Something went wrong.");
    },
  });

  const { isPending: isUpdating } = updateAmountMutation;

  const onSave = () => {
    updateAmountMutation.mutate(addAmount);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-primary p-5 h-full">
        <View className="flex-row items-center ">
          <Text className="text-3xl font-psemibold text-white flex-1">
            Edit Update Amount
          </Text>
          <TouchableOpacity
            className="items-end ml-5"
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="close" color={"gray"} size={32} />
          </TouchableOpacity>
        </View>
        <View className="mt-5">
          <FormField
            title="New Amount"
            handleChangeText={(e) => setAddAmount(e)}
            value={addAmount}
            otherStyles={"my-1"}
            inputMode={"numeric"}
            otherChildren=<View className="items-center justify-centerh-full mr-1">
              <Text className="font-pregular text-secondary text-2xl">$</Text>
            </View>
          />
        </View>
        <CButton
          title={"Save"}
          containerStyles={"mt-10"}
          handlePress={onSave}
          isWorking={isUpdating}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default updateAmount;
