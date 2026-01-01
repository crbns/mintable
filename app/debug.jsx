import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CorrectAnswerAnimation,
  WrongAnswerAnimation,
  LessonCompleteAnimation,
  PerfectScoreAnimation,
  TrophyAnimation,
  XPCounterAnimation,
  LevelUpAnimation,
  LoadingAnimation,
  ProgressUpdateAnimation,
  UnlockAnimation,
} from "../components/LottieAnimation";

const animations = [
  { name: "Correct Answer", component: CorrectAnswerAnimation },
  { name: "Wrong Answer", component: WrongAnswerAnimation },
  { name: "Lesson Complete", component: LessonCompleteAnimation },
  { name: "Perfect Score", component: PerfectScoreAnimation },
  { name: "Trophy", component: TrophyAnimation },
  {
    name: "XP Counter",
    component: XPCounterAnimation,
    props: { xpAmount: 50 },
  },
  { name: "Level Up", component: LevelUpAnimation, props: { level: 2 } },
  { name: "Loading", component: LoadingAnimation },
  { name: "Progress Update", component: ProgressUpdateAnimation },
  { name: "Unlock", component: UnlockAnimation },
];

const Debug = () => {
  return (
    <SafeAreaView
      className="bg-primary h-full px-5 pt-5"
      edges={["right", "top", "left"]}
    >
      <ScrollView className="h-full" showsVerticalScrollIndicator={false}>
        <View className="justify-center">
          <Text className="text-white font-psemibold text-center text-3xl mb-5">
            Animation Debug
          </Text>
          {animations.map((anim, index) => (
            <View
              key={index}
              className="mb-10 items-center bg-alt-100 rounded-md p-5"
            >
              <Text className="text-white font-psemibold text-lg mb-2">
                {anim.name}
              </Text>
              <anim.component loop={true} {...(anim.props || {})} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Debug;
