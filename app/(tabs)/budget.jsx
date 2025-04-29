import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetContainer from "../../components/BudgetContainer";
import CButton from "../../components/CButton";
import IconButton from "../../components/IconButton";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import DropDownPicker from "react-native-dropdown-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DropDown from "../../components/DropDown";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import useAppwrite from "../../lib/useAppwrite";
import {
  createBudget as createBudgetDb,
  getBudgets,
  getCurrentUser,
  getPreferences,
  getVirtualBalance,
  updateBudget,
  updatePreferences,
  updateVirtualBalance,
} from "../../lib/appwrite";
import images from "../../constants/images";
import ContentLoader, { Facebook, Rect } from "react-content-loader/native";
import SmallError from "../../components/SmallError";
import BudgetSetup from "../../components/BudgetSetup";
import { loadFromCache, storeToCache, CACHE_KEYS } from "../../lib/cacheUtil";
import eventBus from "../../lib/eventBus";
import { router } from "expo-router";

const Budget = () => {
  const [progress, setProgress] = useState(0);
  const [virtualBalance, setVirtualBalance] = useState(0);
  const [items, setItems] = useState([]);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    title: null,
    goal: null,
    goalTime: new Date(),
    started: new Date(),
    repeating: false,
    repeatingFrequency: null,
    color: null,
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

  const addItem = (id, name, color, progress, goal, start, end) => {
    setItems([
      ...items,
      {
        id: id,
        name: name,
        color: color,
        progress: progress,
        goal: goal,
        start: start,
        end: end,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const { data: budgets, refetch } = useAppwrite(getBudgets);
  // const { data: vBalance, vBRefetch } = useAppwrite(getVirtualBalance);

  const [refreshing, setRefreshing] = useState(false);

  const onFirstRefresh = async () => {
    setRefreshing(true);

    const budgetData = await getBudgets();
    // await vBRefetch(); not sure why its hanging on this
    // temporary solution
    const vBal = await getVirtualBalance();

    setItems(() => []);

    // add each budget to items
    // const newItems = budgetData.map((element) => ({
    //   id: element.$id,
    //   name: element.title,
    //   color: element.color,
    //   progress: element.progress,
    //   goal: element.goal,
    //   start: element.start,
    //   end: element.end,
    // }));

    const newItems = budgetData
      .filter(function (element) {
        console.log(element.progress + "," + element.goal);
        return element.progress < element.goal;
      })
      .map((element) => ({
        id: element.$id,
        name: element.title,
        color: element.color,
        progress: element.progress,
        goal: element.goal,
        start: element.start,
        end: element.end,
      }));

    setItems(newItems);

    // console.log(budgets);
    // console.log(newItems);
    // console.log(vBal[0].balance);

    setVirtualBalance(vBal[0].balance);

    setRefreshing(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);

    await refetch();
    // await vBRefetch(); not sure why its hanging on this
    // temporary solution
    const vBal = await getVirtualBalance();

    setItems(() => []);

    // add each budget to items
    // const newItems = budgets.map((element) => ({
    //   id: element.$id,
    //   name: element.title,
    //   color: element.color,
    //   progress: element.progress,
    //   goal: element.goal,
    //   start: element.start,
    //   end: element.end,
    // }));

    const newItems = budgets
      .filter(function (element) {
        console.log(element.progress + "," + element.goal);
        return element.progress < element.goal;
      })
      .map((element) => ({
        id: element.$id,
        name: element.title,
        color: element.color,
        progress: element.progress,
        goal: element.goal,
        start: element.start,
        end: element.end,
      }));

    setItems(newItems);

    // console.log(budgets);
    // console.log(newItems);
    // console.log(vBal[0].balance);

    setVirtualBalance(vBal[0].balance);

    setRefreshing(false);
  };

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

    try {
      const currentUser = await getCurrentUser();

      const result = await createBudgetDb(
        budgetForm.title,
        budgetForm.goal,
        budgetForm.goalTime,
        currentUser,
        budgetForm.repeating,
        budgetForm.repeatingFrequency,
        budgetForm.color,
        budgetForm.started
      );

      if (!result) {
        Alert.alert("Error", "Something went wrong");
      } else {
        setIsBudgetOpen(false);
      }
      await onRefresh();
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
      console.error(error);
    } finally {
      setCreateBudgetLoading(false);
    }
  };

  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocateAmount, setAllocateAmount] = useState(0);
  const [isAllocateMode, setIsAllocateMode] = useState(false);

  // called when budget is selected in allocate mode
  const allocateMode = async (id, progress, goal) => {
    const newProgress = progress + allocateAmount;
    let excessAllocated = false;
    try {
      if (progress + allocateAmount > goal) {
        // excess money, give it back to the user
        excessAllocated = true;
        setAllocateAmount(allocateAmount - (progress + allocateAmount));
        newProgress = goal;
      }

      const result = await updateBudget(id, newProgress);
      // edit amount to allocate
      const newVB = await updateVirtualBalance(virtualBalance - allocateAmount);

      // upload current progress to cache

      // if the key doesnt return anything, initialize the json string
      if ((await loadFromCache(CACHE_KEYS.budgetContributions)) === null) {
        const jsonString =
          '{"values": ["0","0","0","0","0","0","0"],"last": "0"}';
        storeToCache(CACHE_KEYS.budgetContributions, jsonString);
      }

      const today = new Date().getDay();

      const budgetContributions = JSON.parse(
        await loadFromCache(CACHE_KEYS.budgetContributions)
      );
      const before = parseInt(budgetContributions.values[today]);
      const newAmount = before + allocateAmount;
      budgetContributions.values[today] = newAmount.toString();
      const budgetContributionsString = JSON.stringify(budgetContributions);
      await storeToCache(
        CACHE_KEYS.budgetContributions,
        budgetContributionsString
      );
      eventBus.emit("newContribution", budgetContributionsString);

      if (excessAllocated) {
        Alert.alert(
          "Your budget is overflowing with money!",
          "The extra amount allocated to your budget as been deposted back into your virtual balance."
        );
      }

      if (!result) {
        Alert.alert("Error", "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
      console.error(error);
    } finally {
      setIsAllocateMode(false);
      // reset allocate amount saving myself from future bugs
      setAllocateAmount(0);
    }
  };

  const [setupComplete, setSetupComplete] = useState(false);

  const checkBudgetSetup = async () => {
    const response = await getPreferences();
    // if cache key doesn't exist, call db and store value to cache
    if (response.budgetOnboardComplete === null) {
      setSetupComplete(false);
      response.budgetOnboardComplete = false;
      await updatePreferences(response);
    } else if (response.budgetOnboardComplete === true) {
      setSetupComplete(true);
    } else if (response.budgetOnboardComplete === false) {
      setSetupComplete(false);
    }
  };

  // startup functions
  useEffect(() => {
    // trigger function to check if setup has been completed
    checkBudgetSetup();

    // trigger reload function on start to populate budget data
    onFirstRefresh();
  }, []);

  if (!setupComplete) {
    return <BudgetSetup />;
  }

  return (
    <SafeAreaView
      className="bg-primary h-full px-5 pt-5"
      edges={["right", "top", "left"]}
    >
      <ScrollView
        className=""
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => {
                onRefresh();
              }, 3000);
            }}
          />
        }
      >
        <View className="flex-row flex-1 items-center gap-2">
          <Image
            source={images.logoSmall}
            className="w-[60px] h-[30px]"
            resizeMode="contain"
          />
          <Text className="text-white font-psemibold text-2xl flex-1">
            Budget
          </Text>

          {/* <TouchableOpacity onPress={() => router.push("history")}>
            <MaterialCommunityIcons name="history" size={32} color={"gray"} />
          </TouchableOpacity> */}
          {/* TODO: Will be implemented later on */}
        </View>
        <View className="border-2 border-b-4 border-alt-100 p-3 rounded-xl mt-3">
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
            handlePress={() => setAllocateModalOpen(true)}
          />
        </View>

        <Modal
          isOpen={allocateModalOpen}
          withInput
          onRequestClose={() => setAllocateModalOpen(false)}
        >
          <View className="bg-primary w-full p-4 rounded-md">
            <View className="flex-row align-middle items-center">
              <Text className="flex-1 text-white font-psemibold text-xl px-1">
                Create Budget
              </Text>
              <TouchableOpacity
                className="items-end"
                onPress={() => setAllocateModalOpen(false)}
              >
                <MaterialCommunityIcons name="close" color={"gray"} size={32} />
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
                <Text className="font-pregular text-secondary text-2xl">$</Text>
              </View>
            />

            {virtualBalance - allocateAmount < 0 && (
              <SmallError text={"Number cannot excede amount to allocate"} />
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

        <View className="mt-5">
          {refreshing ? (
            <ActivityIndicator />
          ) : (
            items.map((item) => (
              <BudgetContainer
                key={item.id}
                name={item.name}
                color={item.color}
                progress={item.progress}
                goal={item.goal}
                start={item.start}
                end={item.end}
                buttonDisabled={!isAllocateMode}
                onPress={() => allocateMode(item.id, item.progress, item.goal)}
              />
            ))
          )}
        </View>

        {/* <CButton
          title={"another one"}
          handlePress={() => addItem(<BudgetContainer progress={progress} />)}
        /> */}

        {/* <View className="flex-row mt-10">
          <CButton
            handlePress={() => setProgress(progress + 0.1)}
            containerStyles={"flex-1"}
            title={"add"}
          />
          <CButton
            handlePress={() => setProgress(progress - 0.1)}
            containerStyles={"flex-1"}
            title={"subtract"}
          />
        </View> */}

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
              <View className="items-center justify-center mx-2">
                <Text className="text-gray-100 font-pmedium text-base mb-1">
                  Repeating?
                </Text>
                <BouncyCheckbox
                  className="mt-1"
                  onPress={(checked) =>
                    setBudgetForm({ ...budgetForm, repeating: checked })
                  }
                />
              </View>
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

export default Budget;
