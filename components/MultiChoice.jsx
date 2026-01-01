import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import OutlineButton from "./OutlineButton";
import {
  CorrectAnswerAnimation,
  WrongAnswerAnimation,
} from "./LottieAnimation";

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
  isShowingFeedback,
}) => {
  // const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showWrongAnimation, setShowWrongAnimation] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(null);

  useEffect(() => {
    if (reset) {
      setAnswered(false);
      setSelectedIndex(null);
      setShowCorrectAnimation(false);
      setShowWrongAnimation(false);
      setAnimationIndex(null);
    }
  }, [reset]);

  return (
    <View className={`${containerStyles}`}>
      <View className={`flex-row gap-2 flex-1`}>
        <View className="relative flex-1">
          <OutlineButton
            title={titles[0]}
            handlePress={() => {
              setAnswered(true);
              setSelectedIndex(0);
              setAnimationIndex(0);
              const isCorrect = correctIndex === 0;
              if (isCorrect) {
                setShowCorrectAnimation(true);
                onCorrect();
              } else {
                setShowWrongAnimation(true);
                onIncorrect();
              }
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
          {/* Animation overlay */}
          {isShowingFeedback && animationIndex === 0 && (
            <View className="absolute inset-0 items-center justify-center">
              {showCorrectAnimation && <CorrectAnswerAnimation size="medium" />}
              {showWrongAnimation && <WrongAnswerAnimation size="small" />}
            </View>
          )}
        </View>
        <View className="relative flex-1">
          <OutlineButton
            title={titles[1]}
            handlePress={() => {
              setAnswered(true);
              setSelectedIndex(1);
              setAnimationIndex(1);
              const isCorrect = correctIndex === 1;
              if (isCorrect) {
                setShowCorrectAnimation(true);
                onCorrect();
              } else {
                setShowWrongAnimation(true);
                onIncorrect();
              }
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
          {/* Animation overlay */}
          {isShowingFeedback && animationIndex === 1 && (
            <View className="absolute inset-0 items-center justify-center">
              {showCorrectAnimation && <CorrectAnswerAnimation size="medium" />}
              {showWrongAnimation && <WrongAnswerAnimation size="small" />}
            </View>
          )}
        </View>
      </View>
      <View className={`flex-row gap-2 mt-2 flex-1`}>
        <View className="relative flex-1">
          <OutlineButton
            title={titles[2]}
            handlePress={() => {
              setAnswered(true);
              setSelectedIndex(2);
              setAnimationIndex(2);
              const isCorrect = correctIndex === 2;
              if (isCorrect) {
                setShowCorrectAnimation(true);
                onCorrect();
              } else {
                setShowWrongAnimation(true);
                onIncorrect();
              }
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
          {/* Animation overlay */}
          {isShowingFeedback && animationIndex === 2 && (
            <View className="absolute inset-0 items-center justify-center">
              {showCorrectAnimation && <CorrectAnswerAnimation size="medium" />}
              {showWrongAnimation && <WrongAnswerAnimation size="small" />}
            </View>
          )}
        </View>
        <View className="relative flex-1">
          <OutlineButton
            title={titles[3]}
            handlePress={() => {
              setAnswered(true);
              setSelectedIndex(3);
              setAnimationIndex(3);
              const isCorrect = correctIndex === 3;
              if (isCorrect) {
                setShowCorrectAnimation(true);
                onCorrect();
              } else {
                setShowWrongAnimation(true);
                onIncorrect();
              }
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
          {/* Animation overlay */}
          {isShowingFeedback && animationIndex === 3 && (
            <View className="absolute inset-0 items-center justify-center">
              {showCorrectAnimation && <CorrectAnswerAnimation size="medium" />}
              {showWrongAnimation && <WrongAnswerAnimation size="small" />}
            </View>
          )}
        </View>
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
