import { View, Text, TouchableOpacity, Platform } from "react-native";
import React from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";

const DateTimePicker = ({ visible, form }) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const dateTimeCompoenent = Platform.select({
    ios: () => (
      <RNDateTimePicker
        testID="dateTimePicker"
        value={form}
        minimumDate={new Date()}
        mode="date"
        onChange={(e, selectedDate) => {
          if (e.type == "set") {
            const currentDate = selectedDate;
            setIsVisible(false);
            form = currentDate;
          }
        }}
        textColor="gray"
        accentColor="orange"
      />
    ),
    android: () => (
      <>
        <TouchableOpacity
          onPress={() => setIsVisible(true)}
          className="flex-row gap-2"
          activeOpacity={0.8}
        >
          <Text className="text-gray-100 font-pregular text-lg bg-alt-100 rounded-md p-2">
            Select a Date
          </Text>
          <Text className="text-gray-100 font-pregular text-lg bg-alt-100 rounded-md p-2">
            {form.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {isVisible && (
          <RNDateTimePicker
            testID="dateTimePicker"
            value={form}
            minimumDate={new Date()}
            mode="date"
            onChange={(e, selectedDate) => {
              const currentDate = selectedDate;
              setIsVisible(false);
              form = currentDate;
            }}
          />
        )}
      </>
    ),
  });

  return <dateTimeCompoenent />;
};

export default DateTimePicker;
