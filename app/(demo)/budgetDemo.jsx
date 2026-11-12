import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetVirtualBalance from "../../components/BudgetVirtualBalance";
import SmallInfo from "../../components/SmallInfo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import IconButton from "../../components/IconButton";
import { router } from "expo-router";
import BudgetContainer from "../../components/BudgetContainer";
import AllocateModal from "../../components/AllocateModal";
import CreateBudgetModal from "../../components/CreateBudgetModal";

// Guest demo: the real budget sheets, backed by local state only
const BudgetDemo = () => {
  const [virtualBalance, setVirtualBalance] = useState(100);
  const [items, setItems] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [allocateTarget, setAllocateTarget] = useState({
    open: false,
    goalId: null,
  });

  const activeItems = items.filter((item) => item.progress < item.goal);

  const closeAllocate = () => setAllocateTarget({ open: false, goalId: null });

  const createBudget = ({ title, goal, color, goalTime }) => {
    setItems((currentItems) => [
      ...currentItems,
      { id: `${Date.now()}`, name: title, goal, progress: 0, color, goalTime },
    ]);
    setIsCreateOpen(false);
  };

  // AllocateModal caps the amount at what the goal and balance allow
  const allocateToGoal = (goalId, amount) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === goalId
          ? { ...item, progress: item.progress + amount }
          : item,
      ),
    );
    setVirtualBalance((balance) => balance - amount);
    closeAllocate();
  };

  return (
    <SafeAreaView className="bg-primary h-full px-5">
      <ScrollView>
        <View className="justify-between items-center flex-row">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" color={"#203c56"} size={40} />
          </TouchableOpacity>
          <SmallInfo
            text={
              "You're using Mintable's demo budget.\nChanges won't be saved."
            }
          />
        </View>

        <BudgetVirtualBalance
          virtualBalance={virtualBalance}
          containerStyles={"mt-5"}
          buttonTitle={"Add to a goal"}
          disabled={activeItems.length === 0 || virtualBalance <= 0}
          hint={
            items.length === 0
              ? "Create a goal to start adding money."
              : virtualBalance <= 0
                ? "That's all of your demo money."
                : null
          }
          onPress={() => setAllocateTarget({ open: true, goalId: null })}
        />

        <View className="mt-5">
          {items.map((item) => {
            const completed = item.progress >= item.goal;
            return (
              <BudgetContainer
                key={item.id}
                name={item.name}
                color={item.color}
                progress={item.progress}
                goal={item.goal}
                date={item.goalTime}
                completed={completed}
                onPress={
                  completed
                    ? undefined
                    : () => setAllocateTarget({ open: true, goalId: item.id })
                }
              />
            );
          })}
        </View>

        <Text className="text-white text-center font-pregular text-lg mt-10">
          Create a new budget
        </Text>
        <IconButton
          iconName={"plus"}
          containerColor={"bg-alt-100"}
          containerStyles={"mt-3"}
          handlePress={() => setIsCreateOpen(true)}
        />
      </ScrollView>

      <AllocateModal
        isOpen={allocateTarget.open}
        initialGoalId={allocateTarget.goalId}
        onClose={closeAllocate}
        virtualBalance={virtualBalance}
        items={activeItems}
        onConfirm={allocateToGoal}
        onEditGoal={() => {
          closeAllocate();
          Alert.alert("Not in the demo", "Log in to edit your goals.");
        }}
        isWorking={false}
      />

      <CreateBudgetModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createBudget}
        isWorking={false}
        usedColors={items.map((item) => item.color)}
      />
    </SafeAreaView>
  );
};

export default BudgetDemo;
