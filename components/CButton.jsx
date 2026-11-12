import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";

const CButton = ({
  title,
  handlePress,
  containerStyles,
  containerColor,
  textStyles,
  textColor,
  textWeight,
  disabledd,
  isWorking,
}) => {
  const fill = containerColor ?? "bg-secondary";
  // a faded orange reads as muddy brown on navy, so disabled buttons go flat
  // navy instead. Working buttons keep their fill behind the spinner.
  const flat = disabledd && !isWorking;
  const onOrange = fill.includes("bg-secondary");
  // swap only the background so layout classes like flex-1 survive
  const flatFill = fill
    .split(" ")
    .filter((c) => c && !c.startsWith("bg-"))
    .concat("bg-alt-100")
    .join(" ");

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`${
        flat ? flatFill : fill
      } rounded-xl justify-center min-h-[50px] items-center ${containerStyles}`}
      disabled={disabledd}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabledd, busy: !!isWorking }}
    >
      {isWorking ? (
        <ActivityIndicator color={onOrange ? "#0d2b45" : "#ffffff"} />
      ) : (
        <Text
          className={`${flat ? "text-muted" : (textColor ?? "text-primary")} ${
            textWeight ?? "font-psemibold"
          } text-lg ${textStyles}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CButton;
