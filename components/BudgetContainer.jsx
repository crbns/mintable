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
}) => {
  const [expanded, setExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeUntil(end));

  const progressPercent = progress / goal;

  function timeUntil(isoDate) {
    const targetDate = new Date(isoDate);
    const now = new Date();

    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return "Now!";
    }

    // const seconds = Math.floor((difference / 1000) % 60);
    // const minutes = Math.floor((difference / (1000 * 60)) % 60);
    // const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    // math.ceil to round up bc of 23 hour 59 minute 59 second bs
    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (days === 1) {
      return `in 1 Day`;
    } else if (days !== 0) {
      return `in ${days} Days`;
    } else {
      return "Today!";
    }
  }

  useEffect(() => {
    setTimeLeft(timeUntil(end));
  }, [timeUntil(end)]);

  return (
    <>
      <TouchableOpacity onPress={onPress} disabled={buttonDisabled}>
        <View
          className={`flex-row ${noMargin ? "" : "mt-3"} ${
            end ? "mb-1" : "mb-5"
          } justify-center items-center ${containerStyles}`}
        >
          <Text className="flex-1 text-white font-pregular text-xl">
            {name ?? "New Budget"}
          </Text>
          <Text className=" text-white font-pregular text-sm">
            {"$" + progress + " / $" + goal}
          </Text>
          <Text className="text-right text-xl flex-1">{emoji ?? "💰"}</Text>
        </View>

        {end && (
          <Text className="text-white font-pregular text-center mb-3">
            Due: {timeLeft}
          </Text>
        )}
        <Progress.Bar
          progress={progressPercent}
          width={null}
          color={color}
          borderWidth={2}
        />

        <View className="border-t-2 border-alt-100 mt-3" />
      </TouchableOpacity>
    </>
  );
};

export default BudgetContainer;
