import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import OutlineButton from "./OutlineButton";

const MultiChoice = ({
  containerStyles,
  titles,
  correctIndex,
  onCorrect,
  onIncorrect,
  showCorrect,
  reset,
  answered,
  setAnswered,
}) => {
  // const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    if (reset) {
      setAnswered(false);
    }
  });

  return (
    <View className={`${containerStyles}`}>
      <View className={`flex-row gap-2 flex-1`}>
        <OutlineButton
          title={titles[0]}
          handlePress={() => {
            setAnswered(true);
            setSelectedIndex(0);
            correctIndex === 0 ? onCorrect() : onIncorrect();
          }}
          containerStyles={
            answered && showCorrect
              ? 0 === correctIndex
                ? "border-green-400"
                : "border-red-400"
              : null
          }
          textStyles={`p-6 ${
            answered && showCorrect
              ? 0 === correctIndex
                ? "text-green-400"
                : "text-red-400"
              : null
          }`}
        />
        <OutlineButton
          title={titles[1]}
          handlePress={() => {
            setAnswered(true);
            setSelectedIndex(1);
            correctIndex === 1 ? onCorrect() : onIncorrect();
          }}
          containerStyles={
            answered && showCorrect
              ? 1 === correctIndex
                ? "border-green-400"
                : "border-red-400"
              : null
          }
          textStyles={`p-6 ${
            answered && showCorrect
              ? 1 === correctIndex
                ? "text-green-400"
                : "text-red-400"
              : null
          }`}
        />
      </View>
      <View className={`flex-row gap-2 mt-2 flex-1`}>
        <OutlineButton
          title={titles[2]}
          handlePress={() => {
            setAnswered(true);
            setSelectedIndex(2);
            correctIndex === 2 ? onCorrect() : onIncorrect();
          }}
          containerStyles={
            answered && showCorrect
              ? 2 === correctIndex
                ? "border-green-400"
                : "border-red-400"
              : null
          }
          textStyles={`p-6 ${
            answered && showCorrect
              ? 2 === correctIndex
                ? "text-green-400"
                : "text-red-400"
              : null
          }`}
        />
        <OutlineButton
          title={titles[3]}
          handlePress={() => {
            setAnswered(true);
            setSelectedIndex(3);
            correctIndex === 3 ? onCorrect() : onIncorrect();
          }}
          containerStyles={
            answered && showCorrect
              ? 3 === correctIndex
                ? "border-green-400"
                : "border-red-400"
              : null
          }
          textStyles={`p-6 ${
            answered && showCorrect
              ? 3 === correctIndex
                ? "text-green-400"
                : "text-red-400"
              : null
          }`}
        />
      </View>
      {/* <OutlineButton
        title={"reset"}
        handlePress={() => {
          setAnswered(false);
          setSelectedIndex(null);
        }}
      /> */}
    </View>
  );
};

export default MultiChoice;
