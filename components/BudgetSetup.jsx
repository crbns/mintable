import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CButton from "./CButton";
import BudgetContainer from "./BudgetContainer";
import DropDown from "./DropDown";
import SmallInfo from "./SmallInfo";
import FormField from "./FormField";
import {
  createVirtualBalance,
  updatePreferences,
  updateVirtualBalanceUpdateAmount,
} from "../lib/appwrite";
import { router } from "expo-router";

const BudgetSetup = ({ update }) => {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  const handleNext = () => {
    if (step === 1) {
      if (frequencyDropdownValue === null) {
        Alert.alert("Error", "Please fill out all fields");
        return;
      }
      if (
        (frequencyDropdownValue === "weekly" ||
          frequencyDropdownValue === "biweekly") &&
        dateFreqDropdownValue === null
      ) {
        Alert.alert("Error", "Please fill out all fields");
        return;
      }
      // prevent date from showing in final step if exact date isnt needed
      if (
        !(
          frequencyDropdownValue === "weekly" ||
          frequencyDropdownValue === "biweekly"
        ) &&
        dateFreqDropdownValue !== null
      ) {
        setdateFreqDropdownValue(null);
      }
    } else if (step === 2) {
      if (addAmount === null) {
        Alert.alert("Error", "Please fill out all fields");
        return;
      }
      if (addAmount === 0) {
        Alert.alert("Error", "Amount cannot be zero");
        return;
      }
    } else if (step === 3) {
      if (startAmount === null) {
        Alert.alert("Error", "Please fill out all fields");
        return;
      }
      if (startAmount === 0) {
        Alert.alert("Error", "Amount cannot be zero");
        return;
      }
    }
    setStep((prevStep) => Math.min(prevStep + 1, totalSteps));
  };

  const handlePrevious = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const renderStepIndicator = () => {
    const indicators = [];
    for (let i = 1; i <= totalSteps; i++) {
      indicators.push(
        <View
          key={i}
          className={`flex-1 h-2 rounded-full ${
            i <= step ? "bg-secondary" : "bg-alt-100"
          }`}
        />
      );
    }
    return <View className="flex-row mb-10 gap-3 mx-3">{indicators}</View>;
  };

  const twoDays = new Date(Date.now() + 2 * 86400000).toISOString();

  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);
  const [frequencyDropdownValue, setFrequencyDropdownValue] = useState(null);
  const [frequencyDropdownItems, setFrequencyDropdownItems] = useState([
    // { label: "Weekly", value: "weekly" },
    // { label: "Bi-Weekly", value: "biweekly" },
    // { label: "Semi-Monthly", value: "semimonthly" },
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
  ]);

  const [dateFreqDropdownOpen, setdateFreqDropdownOpen] = useState(false);
  const [dateFreqDropdownValue, setdateFreqDropdownValue] = useState(null);
  const [dateFreqDropdownItems, setdateFreqDropdownItems] = useState([
    { label: "Saturday", value: "saturday" },
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Sunday", value: "sunday" },
  ]);

  const [addAmount, setAddAmount] = useState(null);
  const [startAmount, setStartAmount] = useState(null);

  const handleFinish = async () => {
    // handle null values, surely this is sufficent
    if (!frequencyDropdownValue || !startAmount || !addAmount) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }
    if (
      (frequencyDropdownValue === "weekly" ||
        frequencyDropdownValue === "biweekly") &&
      dateFreqDropdownValue === null
    ) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    console.log("updating");
    const response = await updatePreferences({
      budgetOnboardComplete: true,
      // updateFreq: frequencyDropdownValue,
      // updateFreqDate: dateFreqDropdownValue,
      startAmount: startAmount,
      // addAmount: addAmount,
    });

    // create virtual balance
    console.log("creating virtual balance");
    const vBalance = await createVirtualBalance(
      parseInt(startAmount),
      frequencyDropdownValue,
      parseInt(addAmount)
    );

    router.replace("budget");
    update();
  };

  if (step === 0) {
    return (
      <>
        <SafeAreaView
          className="h-full bg-primary px-5"
          edges={["right", "top", "left"]}
        >
          <ScrollView>
            <Text className="text-white font-psemibold text-3xl text-center mt-4">
              Welcome to Budgeting{"\n"}with Mintable
            </Text>

            <Text className="text-gray-500 font-regular text-md text-center mt-10">
              Create and manage your own budgets.
            </Text>

            <View className="border-2 rounded-md border-alt-100 p-5 mt-2 border-b-4">
              <BudgetContainer
                name="Movie Tickets"
                progress={50}
                goal={200}
                noMargin={true}
              />
            </View>

            <Text className="text-gray-500 font-regular text-md text-center mt-10">
              Set due dates that work for you.
            </Text>

            <View className="border-2 rounded-md border-alt-100 border-b-4 p-5 mt-2">
              <BudgetContainer
                name="Vacation"
                progress={1355}
                goal={1500}
                noMargin={true}
                end={twoDays}
                color={"#ffadad"}
              />
            </View>

            <Text className="text-gray-500 font-regular text-md text-center mt-10">
              Customize how often your virtual balance resets.
            </Text>

            <View className="border-2 border-b-4 border-alt-100 p-3 rounded-md mt-3">
              <View className="flex-row">
                <View className="justify-center items-start">
                  <Text className="text-white font-pregular">
                    Amount to Allocate
                  </Text>
                  <Text className="text-5xl font-plight text-white pt-3">
                    $1,000
                  </Text>
                </View>
                <View className="flex-1 items-end justify-center">
                  <Text className="text-gray-500 text-xl font-pregular text-right">
                    Reloads in: {"\n"} 1 Week
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row flex-1 justify-end items-end mb-4 gap-4">
              <CButton
                title={"Get Started"}
                textWeight={"font-pregular"}
                containerStyles={"flex-1 mt-5"}
                handlePress={() => setStep(1)}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        className="h-full bg-primary"
        edges={["right", "top", "left"]}
      >
        <View className="items-center bg-primary">{renderStepIndicator()}</View>
        {/* <ScrollView className="h-full" scrollEnabled={false}> */}
        {step === 1 && (
          <View className="px-5">
            <Text className="text-white font-psemibold text-3xl text-center">
              How often should your virtual balance be updated?
            </Text>

            <Text className="text-gray-500 font-pregular text-md text-center mt-5">
              For the best experience, choose a frequency that aligns with how
              often you receive payments, such as from a job or allowance.
            </Text>

            <View className="h-1 rounded-full w-full bg-alt-100 mt-5" />

            <DropDown
              zIndex={9999}
              open={frequencyDropdownOpen}
              value={frequencyDropdownValue}
              items={frequencyDropdownItems}
              setOpen={setFrequencyDropdownOpen}
              setValue={setFrequencyDropdownValue}
              setItems={setFrequencyDropdownItems}
              title={"Frequency"}
              containerStyles={"mt-5"}
            />

            {/* this surely could be optimized */}
            {frequencyDropdownValue === "monthly" && (
              <SmallInfo
                text={
                  "Your virtual balance will be updated on the first day of each month."
                }
                iconSize={20}
                containerStyle={"mt-5"}
              />
            )}
            {frequencyDropdownValue === "quarterly" && (
              <SmallInfo
                text={
                  "Your virtual balance will be updated on the first day of each quarter."
                }
                iconSize={20}
                containerStyle={"mt-5"}
              />
            )}
            {frequencyDropdownValue === "yearly" && (
              <SmallInfo
                text={
                  "Your virtual balance will be updated on the first day of the year."
                }
                iconSize={20}
                containerStyle={"mt-5"}
              />
            )}
            {frequencyDropdownValue !== "yearly" &&
              frequencyDropdownValue !== "quarterly" &&
              frequencyDropdownValue !== "monthly" && (
                <DropDown
                  open={dateFreqDropdownOpen}
                  value={dateFreqDropdownValue}
                  items={dateFreqDropdownItems}
                  setOpen={setdateFreqDropdownOpen}
                  setValue={setdateFreqDropdownValue}
                  setItems={setdateFreqDropdownItems}
                  title={"Which day to update on?"}
                  containerStyles={"mt-5"}
                />
              )}
          </View>
        )}
        {step === 2 && (
          <View className="px-5">
            <Text className="text-white font-psemibold text-3xl text-center">
              How much should be added to your virtual balance{" "}
              {frequencyDropdownValue}?
            </Text>

            <Text className="text-gray-500 font-pregular text-md text-center mt-5">
              Choose an amount that reflects how much you typically receive from
              sources like a job or allowance.
            </Text>

            <View className="h-1 rounded-full w-full bg-alt-100 mt-5" />

            <FormField
              title="Amount"
              handleChangeText={(e) => setAddAmount(e)}
              value={addAmount}
              otherStyles={"my-1"}
              inputMode={"numeric"}
              otherChildren=<View className="items-center justify-centerh-full mr-1">
                <Text className="font-pregular text-secondary text-2xl">$</Text>
              </View>
            />
          </View>
        )}
        {step === 3 && (
          <View className="px-5">
            <Text className="text-white font-psemibold text-3xl text-center">
              How much should your starting virtual balance be?
            </Text>

            <Text className="text-gray-500 font-pregular text-md text-center mt-5">
              Enter a starting amount that reflects the money you currently have
              or want to begin with.
            </Text>

            <View className="h-1 rounded-full w-full bg-alt-100 mt-5" />

            <FormField
              title="Amount"
              handleChangeText={(e) => setStartAmount(e)}
              value={startAmount}
              otherStyles={"my-1"}
              inputMode={"numeric"}
              otherChildren=<View className="items-center justify-centerh-full mr-1">
                <Text className="font-pregular text-secondary text-2xl">$</Text>
              </View>
            />
          </View>
        )}
        {step === 4 && (
          <View className="px-5">
            <Text className="text-white font-psemibold text-4xl text-center">
              Is this correct?{" "}
            </Text>

            <View className="h-1 rounded-full w-full bg-alt-100 my-5" />

            <View className="border-2 border-alt-100 rounded-md p-3">
              <Text className="text-white font-pregular text-2xl">
                Your virtual balance will update:
              </Text>
              <Text className="text-secondary font-psemibold text-3xl">
                {frequencyDropdownValue}
                {dateFreqDropdownValue && ` on ${dateFreqDropdownValue}s`}
              </Text>
            </View>
            <View className="border-2 border-alt-100 rounded-md p-3 mt-5">
              <Text className="text-white font-pregular text-2xl">
                What will be added to your virtual balance once updated:
              </Text>
              <Text className="text-secondary font-psemibold text-3xl">
                ${addAmount}
              </Text>
            </View>
            <View className="border-2 border-alt-100 rounded-md p-3 mt-5">
              <Text className="text-white font-pregular text-2xl">
                What your virtual balance will start with:
              </Text>
              <Text className="text-secondary font-psemibold text-3xl">
                ${startAmount}
              </Text>
            </View>
          </View>
        )}
        {/* </ScrollView> */}
        <View className="flex-row justify-center items-center p-5 gap-4 mt-10">
          {step > 1 && (
            <CButton
              title={"Back"}
              containerColor={"bg-alt-100"}
              textColor={"text-white"}
              textWeight={"font-pregular"}
              containerStyles={"flex-1"}
              handlePress={handlePrevious}
            />
          )}
          {step < totalSteps ? (
            <CButton
              title={"Next"}
              textWeight={"font-pregular"}
              containerStyles={"flex-1"}
              handlePress={handleNext}
            />
          ) : (
            <CButton
              title={"Done"}
              textWeight={"font-pregular"}
              containerStyles={"flex-1"}
              handlePress={() => handleFinish()}
            />
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default BudgetSetup;
