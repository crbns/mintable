import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetVirtualBalance from "../../components/BudgetVirtualBalance";
import SmallInfo from "../../components/SmallInfo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import IconButton from "../../components/IconButton";
import { router } from "expo-router";
import Modal from "../../components/Modal";
import DropDown from "../../components/DropDown";
import CButton from "../../components/CButton";
import FormField from "../../components/FormField";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import BudgetContainer from "../../components/BudgetContainer";
import SmallError from "../../components/SmallError";

const BudgetDemo = () => {
  const [virtualBalance, setVirtualBalance] = useState(100);
  const [items, setItems] = useState([]);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isAllocateMode, setIsAllocateMode] = useState(false);

  const [budgetForm, setBudgetForm] = useState({
    title: null,
    goal: null,
    goalTime: new Date(),
    started: new Date(),
    repeating: false,
    repeatingFrequency: null,
    color: null,
    progress: 0,
  });

  // Create modal
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [colorDropdownValue, setColorDropdownValue] = useState(null);
  const [colorDropDownItems, setColorDropDownItems] = useState([
    {
      label: "Red",
      value: "#ffadad",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#ffadad"} size={16} />
      ),
    },
    {
      label: "Orange",
      value: "#ffd6a5",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#ffd6a5"} size={16} />
      ),
    },
    {
      label: "Yellow",
      value: "#fdffb6",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#fdffb6"} size={16} />
      ),
    },
    {
      label: "Green",
      value: "#caffbf",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#caffbf"} size={16} />
      ),
    },
    {
      label: "Blue",
      value: "#a0c4ff",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#a0c4ff"} size={16} />
      ),
    },
    {
      label: "Purple",
      value: "#bdb2ff",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#bdb2ff"} size={16} />
      ),
    },
    {
      label: "Pink",
      value: "#ffc6ff",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#ffc6ff"} size={16} />
      ),
    },
  ]);

  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);
  const [frequencyDropdownValue, setFrequencyDropdownValue] = useState(null);
  const [frequencyDropdownItems, setFrequencyDropdownItems] = useState([
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ]);

  const [dateTimePickerShown, setDateTimePickerShown] = useState(false);
  const dateTimeCompoenent = Platform.select({
    ios: () => (
      <RNDateTimePicker
        testID="dateTimePicker"
        value={budgetForm.goalTime}
        minimumDate={new Date()}
        mode="date"
        onChange={(e, selectedDate) => {
          const currentDate = selectedDate;
          setDateTimePickerShown(false);
          budgetForm.goalTime = currentDate;
        }}
        textColor="gray"
        accentColor="orange"
      />
    ),
    android: () => (
      <>
        <TouchableOpacity
          onPress={() => setDateTimePickerShown(true)}
          className="flex-row gap-2"
          activeOpacity={0.8}
        >
          <Text className="text-gray-100 font-pregular text-lg bg-alt-100 rounded-md p-2">
            Select a Date
          </Text>
          <Text className="text-gray-100 font-pregular text-lg bg-alt-100 rounded-md p-2">
            {budgetForm.goalTime.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {dateTimePickerShown && (
          <RNDateTimePicker
            testID="dateTimePicker"
            value={budgetForm.goalTime}
            minimumDate={new Date()}
            mode="date"
            onChange={(e, selectedDate) => {
              const currentDate = selectedDate;
              setDateTimePickerShown(false);
              budgetForm.goalTime = currentDate;
            }}
          />
        )}
      </>
    ),
  });

  const [createBudgetLoading, setCreateBudgetLoading] = useState(false);
  const createBudget = async () => {
    if (!budgetForm.title || !budgetForm.goal || colorDropdownValue === null) {
      console.warn(budgetForm.title);
      console.warn(budgetForm.goal);
      console.warn(colorDropdownValue);

      Alert.alert("Error", "Please fill out all fields");
      return;
    }
    if (!budgetForm.color) {
      budgetForm.color = colorDropdownValue;
    }
    setCreateBudgetLoading(true);

    setItems((currentItems) => [...currentItems, budgetForm]);

    setCreateBudgetLoading(false);
    setIsBudgetOpen(false);
  };

  const allocateMode = (clickedId, progress, goal) => {
    let newProgress = progress + allocateAmount;
    let excessAllocated = false;
    let amountToSubtract = allocateAmount;
    try {
      if (progress + amountToSubtract > goal) {
        // excess money, give it back to the user
        excessAllocated = true;
        amountToSubtract = goal - progress;
        newProgress = goal;
      }

      const updatedBudgets = items
        .map((budget) =>
          budget.title === clickedId
            ? { ...budget, progress: newProgress }
            : budget
        )
        .filter((budget) => budget.progress <= budget.goal);

      setItems(updatedBudgets);
      setVirtualBalance(virtualBalance - amountToSubtract);

      if (excessAllocated) {
        Alert.alert(
          "Your budget is overflowing with money!",
          "The extra amount allocated to your budget as been deposted back into your virtual balance."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
      console.error(error);
    } finally {
      setIsAllocateMode(false);
      // reset allocate amount saving myself from future bugs
      setAllocateAmount(0);
      setAllocateModalOpen(true);
    }
  };

  const [allocateModalOpen, setAllocateModalOpen] = useState(true);
  const [allocateAmount, setAllocateAmount] = useState(0);

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
          refreshing={false}
          containerStyles={"mt-5"}
          onPress={() => {
            if (items.length === 0) {
              Alert.alert(
                "Error",
                "You need to have at least one budget to allocate money to!"
              );
            } else {
              setIsAllocateMode(true);
            }
          }}
        />

        {isAllocateMode && (
          <>
            <Text className="mt-5 text-white font-psemibold">
              Click on a budget to allocate your money!
            </Text>
            <Modal
              isOpen={allocateModalOpen}
              withInput
              onRequestClose={() => setAllocateModalOpen(false)}
            >
              <View className="bg-primary w-full p-4 rounded-md">
                <View className="flex-row align-middle items-center">
                  <Text className="flex-1 text-white font-psemibold text-xl px-1">
                    Allocate Money
                  </Text>
                  <TouchableOpacity
                    className="items-end"
                    onPress={() => {
                      setAllocateModalOpen(false);
                      setIsAllocateMode(false);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      color={"gray"}
                      size={32}
                    />
                  </TouchableOpacity>
                </View>

                <Text className="font-pregular text-md text-white">
                  You have ${virtualBalance} to allocate.
                </Text>

                <FormField
                  title={"Set amount to allocate"}
                  handleChangeText={(e) => setAllocateAmount(parseInt(e))}
                  otherStyles={"mt-1"}
                  placeholder={"Set amount"}
                  inputMode={"numeric"}
                  otherChildren=<View className="items-center justify-center h-full mr-1">
                    <Text className="font-pregular text-secondary text-2xl">
                      $
                    </Text>
                  </View>
                />

                {virtualBalance - allocateAmount < 0 && (
                  <SmallError
                    text={"Number cannot excede amount to allocate"}
                  />
                )}

                {allocateAmount && (
                  <Text className="font-pregular text-md text-white mt-1">
                    You will have $
                    {virtualBalance - allocateAmount < 0
                      ? 0
                      : virtualBalance - allocateAmount}{" "}
                    remaining.
                  </Text>
                )}

                <CButton
                  title={"Select Budget"}
                  containerStyles={"mt-3"}
                  handlePress={() => {
                    if (virtualBalance - allocateAmount >= 0) {
                      setAllocateModalOpen(false);
                      setIsAllocateMode(true);
                    }
                  }}
                />
              </View>
            </Modal>
          </>
        )}

        <View className="mt-5">
          {items.map((item) => (
            <BudgetContainer
              key={item.title}
              name={item.title}
              color={item.color}
              progress={item.progress}
              goal={item.goal}
              start={item.start}
              end={item.end}
              buttonDisabled={!isAllocateMode}
              onPress={() => allocateMode(item.title, item.progress, item.goal)}
            />
          ))}
        </View>

        <Text className="text-white text-center font-pregular text-lg mt-10">
          Create a new budget
        </Text>
        <IconButton
          iconName={"plus"}
          containerColor={"bg-alt-100"}
          containerStyles={"mt-3"}
          handlePress={() => setIsBudgetOpen(true)}
        />

        <Modal
          isOpen={isBudgetOpen}
          withInput
          onRequestClose={() => setIsBudgetOpen(false)}
        >
          <View className="bg-primary w-full p-4 rounded-xl">
            <View className="flex-row align-middle items-center">
              <Text className="flex-1 text-white font-psemibold text-xl px-1">
                Create Budget
              </Text>
              <TouchableOpacity
                className="items-end"
                onPress={() => setIsBudgetOpen(false)}
              >
                <MaterialCommunityIcons name="close" color={"gray"} size={32} />
              </TouchableOpacity>
            </View>

            <FormField
              title="Title"
              handleChangeText={(e) =>
                setBudgetForm({ ...budgetForm, title: e })
              }
              otherStyles={"my-1"}
              placeholder={"Give it a title"}
            />

            <FormField
              title="Goal"
              handleChangeText={(e) =>
                setBudgetForm({ ...budgetForm, goal: parseInt(e) })
              }
              otherStyles={"my-1"}
              inputMode={"numeric"}
              placeholder={"What is the goal"}
              otherChildren=<View className="items-center justify-centerh-full mr-1">
                <Text className="font-pregular text-secondary text-2xl">$</Text>
              </View>
            />

            <DropDown
              open={colorDropdownOpen}
              value={colorDropdownValue}
              items={colorDropDownItems}
              setOpen={setColorDropdownOpen}
              setValue={setColorDropdownValue}
              setItems={setColorDropDownItems}
              title={"Color"}
              placeholder={"Select a Color"}
              containerStyles={"my-1"}
              zIndex={2000}
            />

            <View className="flex-row w-full my-1 h-20">
              {/* <View className="items-center justify-center mx-2">
                <Text className="text-gray-100 font-pmedium text-base mb-1">
                  Repeating?
                </Text>
                <BouncyCheckbox
                  className="mt-1"
                  onPress={(checked) =>
                    setBudgetForm({ ...budgetForm, repeating: checked })
                  }
                />
              </View> */}
              <View className="flex-1 ml-2">
                {budgetForm.repeating ? (
                  <DropDown
                    open={frequencyDropdownOpen}
                    value={frequencyDropdownValue}
                    items={frequencyDropdownItems}
                    setOpen={setFrequencyDropdownOpen}
                    setValue={setFrequencyDropdownValue}
                    setItems={setFrequencyDropdownItems}
                    placeholder={"How often?"}
                    title={"Frequency"}
                    zIndex={1999}
                  />
                ) : (
                  <>
                    <Text className="text-base text-gray-100 font-pmedium mx-2">
                      Choose a date
                    </Text>
                    <View className="flex-1 justify-center">
                      {dateTimeCompoenent()}
                    </View>
                  </>
                )}
              </View>
            </View>

            <CButton
              containerStyles={"mt-2"}
              title={"Create"}
              handlePress={createBudget}
              isWorking={createBudgetLoading}
            />
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BudgetDemo;
