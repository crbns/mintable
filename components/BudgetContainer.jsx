import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import * as Progress from "react-native-progress";

const BudgetContainer = ({
  containerStyles,
  progress,
  name,
  emoji,
  color,
  goal,
  start,
  end,
  onPress,
  buttonDisabled,
  noMargin,
  date,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeUntil(end));

  const progressPercent = progress / goal;

  function timeUntil(isoDate) {
    const targetDate = new Date(isoDate);
    const now = new Date();

    // Reset both dates to midnight to avoid partial day issues
    targetDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const difference = now.getTime() - targetDate.getTime();
    const daysPassed = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (daysPassed === 0) {
      return "Today!";
    } else if (daysPassed === 1) {
      return "1 day ago";
    } else if (daysPassed > 1) {
      return `${daysPassed} days ago`;
    } else {
      // future date
      return `in ${Math.abs(daysPassed)} day${
        Math.abs(daysPassed) === 1 ? "" : "s"
      }`;
    }
  }

  useEffect(() => {
    setTimeLeft(timeUntil(end));
  }, [timeUntil(end)]);

  // className={`flex-row ${noMargin ? "" : "mt-3"} ${
  //           end ? "mb-1" : "mb-5"
  //         } justify-center items-center ${containerStyles}`}

  return (
    <>
      <TouchableOpacity
        onPressOut={() => {
          console.log("BudgetContainer onPressOut called");
          onPress();
        }}
        activeOpacity={0.8}
      >
        <View
          className={`flex-row justify-center items-center mt-2 ${containerStyles}`}
        >
          <Text className="flex-1 text-white font-psemibold text-xl">
            {name ?? "New Budget"}
          </Text>

          {/* <Text className="text-right text-xl flex-1">{emoji ?? "💰"}</Text> */}
        </View>

        <View className="flex-row my-2 justify-center">
          <Text className=" text-white font-pregular text-rg">
            {"$" + progress + " / $" + goal}
          </Text>
          {date && (
            <Text className="flex-1 text-white font-pregular text-right">
              {timeUntil(date)}
            </Text>
          )}
        </View>

        {/* {end && (
          <Text className="text-white font-pregular text-center mb-3">
            Due: {timeLeft}
          </Text>
        )} */}
        <Progress.Bar
          progress={progressPercent}
          width={null}
          color={color}
          borderWidth={1}
        />

        <View className="border-t-2 border-alt-100 mt-2" />
      </TouchableOpacity>
    </>
  );
};

export default BudgetContainer;
