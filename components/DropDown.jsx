import { View, Text } from "react-native";
import React from "react";
import DropDownPicker from "react-native-dropdown-picker";

const DropDown = ({
  open,
  value,
  items,
  setOpen,
  setValue,
  setItems,
  title,
  placeholder,
  containerStyles,
  zIndex,
}) => {
  return (
    <View className={`${containerStyles}`}>
      <Text className="text-base text-gray-100 font-pmedium mx-2">{title}</Text>
      <DropDownPicker
        zIndex={zIndex}
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder={placeholder ?? ""}
        placeholderStyle={{ color: "#7b7b8b" }}
        dropDownContainerStyle={{
          backgroundColor: "#203c56",
          borderWidth: 0,
        }}
        style={{
          backgroundColor: "#203c56",
          borderWidth: 0,
          borderRadius: 6,
        }}
        labelStyle={{ color: "#ffffff" }}
        listItemContainerStyle={{
          borderTopWidth: 1,
          borderTopColor: "#1a3045",
        }}
        textStyle={{
          color: "#ffffff",
          fontFamily: "Poppins-Regular",
          paddingLeft: 4,
        }}
        arrowIconStyle={{ tintColor: "#7b7b8b" }}
        tickIconStyle={{ tintColor: "#fff" }}
      />
    </View>
  );
};

export default DropDown;
