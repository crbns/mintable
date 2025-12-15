import { View, Text, Platform, TouchableOpacity, Alert } from "react-native";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import DrawerModal from "./DrawerModal";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import DrawerFormField from "./DrawerFormField";
import DropDown from "./DropDown";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import CButton from "./CButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  deleteBudget,
  editBudget,
  getBudgetByDocId,
  getVirtualBalance,
  updateVirtualBalance,
} from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
import ConfirmDrawerModal from "./ConfirmDrawerModal";

const EditBudgetDrawerModal = forwardRef(
  ({ onDismiss, budget, requireRefresh }, ref) => {
    const { user } = useGlobalContext();

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

    const originalFormRef = useRef(null);
    const confirmFormRef = useRef(null);
    const [confirmFormReturn, setConfirmFormReturn] = useState(null);
    const [changeDetected, setChangeDetected] = useState(false);

    const [budgetForm, setBudgetForm] = useState({
      title: null,
      goal: null,
      goalTime: null,
      repeating: false,
      repeatingFrequency: null,
      color: null,
    });
    const [budgetId, setBudgetId] = useState(null);

    const dateTimeCompoenent = Platform.select({
      ios: () => (
        <RNDateTimePicker
          testID="dateTimePicker"
          value={budgetForm.goalTime ?? new Date()}
          mode="date"
          onChange={(e, selectedDate) => {
            if (e.type === "set" && selectedDate) {
              setDateTimePickerShown(false);
              setBudgetForm((prev) => ({
                ...prev,
                goalTime: selectedDate,
              }));
            }
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
              {budgetForm.goalTime?.toLocaleDateString() ?? "Select date"}
            </Text>
          </TouchableOpacity>
          {dateTimePickerShown && (
            <RNDateTimePicker
              testID="dateTimePicker"
              value={budgetForm.goalTime ?? new Date()}
              mode="date"
              onChange={(e, selectedDate) => {
                if (e.type === "set" && selectedDate) {
                  setDateTimePickerShown(false);
                  setBudgetForm((prev) => ({
                    ...prev,
                    goalTime: selectedDate,
                  }));
                }
              }}
            />
          )}
        </>
      ),
    });

    const isFormEqual = (a, b) => {
      if (!a || !b) return false;
      return (
        a.title === b.title &&
        a.goal === b.goal &&
        a.repeating === b.repeating &&
        a.repeatingFrequency === b.repeatingFrequency &&
        a.color === b.color &&
        a.goalTime?.toISOString() === b.goalTime?.toISOString()
      );
    };

    const saveChanges = async () => {
      const res = await editBudget(budgetId, {
        title: budgetForm.title,
        goal: budgetForm.goal,
        goalTime: budgetForm.goalTime,
        repeating: budgetForm.repeating,
        color: budgetForm.color,
        started: budgetForm.started,
        accountId: user.accountId,
      });

      if (res) {
        Alert.alert("Success!", "Your budget has been edited.");
        requireRefresh();
        ref.current?.dismiss();
      } else {
        Alert.alert("Error", "Something went wrong");
      }
    };

    const dismissed = async () => {
      console.log("Modal dismissed");
      // if (hasChanged) {
      //   await saveChanges();
      // }

      if (onDismiss) {
        onDismiss();
      }
    };

    useEffect(() => {
      if (budget) {
        console.log("budget in modal: ", budget);
        const requiredFields = {
          name: budget.name,
          goal: budget.goal,
          date: budget.goalTime,
          //start: budget.start,
          color: budget.color,
        };

        for (const [key, value] of Object.entries(requiredFields)) {
          if (value === null || value === undefined) {
            console.error(`Missing or null budget field: "${key}"`);
          }
        }

        const initialForm = {
          title: budget.name,
          goal: budget.goal,
          goalTime: new Date(budget.goalTime),
          started: new Date(), // TODO: FIX THIS IMMEDIATELY. we should not be using todays date. budget.started is somehow undefined. this error goes back to budgets.jsx
          repeating: false,
          repeatingFrequency: null,
          color: budget.color,
        };
        setBudgetForm(initialForm);
        setBudgetId(budget.id);
        originalFormRef.current = initialForm;

        setColorDropdownValue(budget.color);
      }
    }, [budget]);

    useEffect(() => {
      const hasChanged = !isFormEqual(budgetForm, originalFormRef.current);
      setChangeDetected(hasChanged);
    }, [budgetForm]);

    useEffect(() => {
      async function deleteB() {
        if (confirmFormReturn) {
          ref.current?.dismiss();
          const response = await deleteBudget(budgetId);
          if (response == true) {
            Alert.alert("Success!", "Successfully deleted your budget");
            if (requireRefresh) {
              requireRefresh();
            } else {
              console.warn(
                "Require refresh function required! Continuting anyway."
              );
            }
            setConfirmFormReturn(false);
          } else {
            Alert.alert("Error", "Something went wrong");
          }
        } else {
          // something else maybe?
        }
      }
      deleteB();
    }, [confirmFormReturn]);

    return (
      <DrawerModal ref={ref} onDismiss={dismissed} backgroundColor="#0d2b45">
        <BottomSheetView className="flex align-center pb-10">
          <View className="w-full items-center justify-center relative">
            <TouchableOpacity
              className="absolute left-5 flex-row gap-2 items-center"
              onPress={async () => {
                confirmFormRef.current?.present();
              }}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color={"gray"}
                className=""
              />
              {/* <Text
                className={`text-lg text-red-500
                `}
              >
                Delete
              </Text> */}
            </TouchableOpacity>
            <Text className="font-psemibold text-white text-xl text-center">
              Edit Budget
            </Text>
            <TouchableOpacity
              className="absolute right-4"
              onPress={() => ref.current?.dismiss()}
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={"gray"}
                className=""
              />
            </TouchableOpacity>
          </View>

          <View className="bg-primary w-full pt-4 px-4 rounded-xl ">
            <DrawerFormField
              title="Title"
              handleChangeText={(e) =>
                setBudgetForm({ ...budgetForm, title: e })
              }
              placeholder={"Give it a title"}
              initialValue={budgetForm.title}
              otherStyles={"mt-5"}
            />

            <DrawerFormField
              title="Goal"
              handleChangeText={(e) =>
                setBudgetForm({ ...budgetForm, goal: parseInt(e) })
              }
              otherStyles={"my-5"}
              inputMode={"numeric"}
              placeholder={"What is the goal"}
              initialValue={
                budgetForm.goal > 0 ? budgetForm.goal.toString() : ""
              }
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
              containerStyles={""}
              zIndex={2000}
            />

            <View className="">
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
              <View className="">
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
                  <View className="ml-2 mt-5">
                    <Text className="text-base text-gray-100 font-pmedium">
                      Choose a due date
                    </Text>
                    <View className="mt-1">{dateTimeCompoenent()}</View>
                  </View>
                )}
              </View>
            </View>

            <View className="mt-5 pt-5 border-t-hairline">
              <CButton
                title={"Save"}
                containerColor={"flex-1 bg-secondary"}
                textColor={"text-primary"}
                handlePress={() => saveChanges()}
              />
            </View>
          </View>
          <ConfirmDrawerModal
            ref={confirmFormRef}
            headerText={"Are you sure you want to delete your budget?"}
            setReturn={setConfirmFormReturn}
          />
        </BottomSheetView>
      </DrawerModal>
    );
  }
);

export default EditBudgetDrawerModal;
