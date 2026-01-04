import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef, useMemo, useEffect } from "react";

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
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => [], []);

  useEffect(() => {
    if (open) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [open]);

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
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: "#203c56" }}
        handleIndicatorStyle={{ backgroundColor: "#7b7b8b" }}
        onDismiss={() => setOpen(false)}
        stackBehavior="push"
        containerStyle={{ zIndex: 10000 }}
        enableDynamicSizing
      >
        <BottomSheetView className="flex-1 p-4">
          <Text className="text-2xl font-psemibold text-white mb-4 border-b-hairline pb-2 border-secondary">
            Select {title}:
          </Text>
          <FlatList
            data={items}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
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
            )}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

export default DropDown;
