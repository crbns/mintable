import { View, Text, TouchableOpacity } from "react-native";
import Modal from "./Modal";

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
    <View className={`${containerStyles}`} style={{ zIndex }}>
      <Text className="text-base text-gray-100 font-pmedium mx-2">{title}</Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{ backgroundColor: "#203c56", borderRadius: 6, padding: 8 }}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View className="flex-row items-center">
          {value &&
            items.find((item) => item.value === value)?.icon &&
            items.find((item) => item.value === value).icon()}
          <Text
            className="text-white font-pregular ml-2"
            style={{ color: value ? "#ffffff" : "#7b7b8b" }}
          >
            {value
              ? items.find((item) => item.value === value)?.label
              : placeholder ?? ""}
          </Text>
        </View>
      </TouchableOpacity>
      {/* push keeps a parent sheet mounted underneath; scrollable caps the
          list at the screen height on small phones / large text */}
      <Modal
        isOpen={open}
        onRequestClose={() => setOpen(false)}
        scrollable
        stackBehavior="push"
        backgroundStyle={{ backgroundColor: "#203c56" }}
        containerStyle={{ zIndex: 10000 }}
      >
        <View className="px-1 pb-4">
          <Text className="text-2xl font-psemibold text-white mb-4 border-b-hairline pb-2 border-secondary">
            Select {title}:
          </Text>
          {items.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => {
                setValue(item.value);
                setOpen(false);
              }}
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#1a3045",
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.label}`}
            >
              <View className="flex-row items-center">
                {item.icon && item.icon()}
                <Text className="text-white font-pregular ml-2">
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
};

export default DropDown;
