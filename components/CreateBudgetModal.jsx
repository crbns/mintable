import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  TextInput,
  Keyboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Modal from "./Modal";
import FormField from "./FormField";
import DropDown from "./DropDown";
import CButton from "./CButton";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import BottomSheetFormField from "./BottomSheetFormField";

const CreateBudgetModal = ({
  isOpen,
  onClose,
  budgetForm,
  setBudgetForm,
  colorDropdownOpen,
  setColorDropdownOpen,
  colorDropdownValue,
  setColorDropdownValue,
  colorDropDownItems,
  setColorDropDownItems,
  frequencyDropdownOpen,
  setFrequencyDropdownOpen,
  frequencyDropdownValue,
  setFrequencyDropdownValue,
  frequencyDropdownItems,
  setFrequencyDropdownItems,
  dateTimePickerShown,
  setDateTimePickerShown,
  createBudget,
  createBudgetLoading,
}) => {
  const dateTimeComponent = Platform.select({
    ios: () => (
      <RNDateTimePicker
        testID="dateTimePicker"
        value={budgetForm.goalTime}
        minimumDate={new Date()}
        mode="date"
        onChange={(e, selectedDate) => {
          if (e.type == "set") {
            const currentDate = selectedDate;
            setDateTimePickerShown(false);
            setBudgetForm({ ...budgetForm, goalTime: currentDate });
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
              setBudgetForm({ ...budgetForm, goalTime: currentDate });
            }}
          />
        )}
      </>
    ),
  });

  const handleColorDropdownOpen = (open) => {
    if (open) {
      Keyboard.dismiss();
    }
    setColorDropdownOpen(open);
  };

  return (
    <Modal
      isOpen={isOpen}
      withInput
      onRequestClose={onClose}
      snapPoints={["90%"]} // FIX ME: This should adapt to keyboard height
    >
      <View className="flex align-center pb-10 w-full">
        <View className="items-center justify-center relative flex-row">
          <Text className="font-psemibold text-white text-xl text-center">
            Create Budget
          </Text>
          <TouchableOpacity className="absolute right-4" onPress={onClose}>
            <MaterialCommunityIcons name="close" size={22} color={"gray"} />
          </TouchableOpacity>
        </View>

        <View className="bg-primary w-full rounded-xl ">
          <View className="space-y-2 my-1">
            <Text className="text-base text-gray-100 font-pmedium mx-2">
              Title
            </Text>
            <View className="w-full h-14 px-4 focus:border-secondary items-center flex-row border-b-2 border-alt-100">
              {/* Using SheetTextInput to avoid gesture conflicts in bottom sheets. To add new inputs, import SheetTextInput and use it instead of regular TextInput. */}
              <TextInput
                className="flex-1 text-white font-psemibold text-base h-full"
                value={budgetForm.title}
                placeholder="Give it a title"
                placeholderTextColor="#7b7b8b"
                onChangeText={(e) => setBudgetForm({ ...budgetForm, title: e })}
              />
            </View>
          </View>

          <BottomSheetFormField
            title="Goal"
            handleChangeText={(e) =>
              setBudgetForm({ ...budgetForm, goal: parseInt(e) })
            }
            otherStyles={"my-1"}
            inputMode={"numeric"}
            placeholder={"What is the goal"}
            otherChildren={
              <View className="items-center justify-center h-full mr-1">
                <Text className="font-pregular text-secondary text-2xl">$</Text>
              </View>
            }
          />

          <DropDown
            open={colorDropdownOpen}
            value={colorDropdownValue}
            items={colorDropDownItems}
            setOpen={handleColorDropdownOpen}
            setValue={setColorDropdownValue}
            setItems={setColorDropDownItems}
            title={"Color"}
            placeholder={"Select a Color"}
            containerStyles={"my-1"}
            zIndex={10000}
          />

          <View className="flex-row w-full my-1 h-20">
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
                  <Text className="text-base text-gray-100 font-pmedium">
                    Choose a due date
                  </Text>
                  <View className="flex-1 justify-center items-start">
                    {dateTimeComponent()}
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
      </View>
    </Modal>
  );
};

export default CreateBudgetModal;
