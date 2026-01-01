import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getLearningProgress } from "../../lib/appwrite";
import { queryKeys } from "../../lib/queryKeys";
import * as Progress from "react-native-progress";
import { TrophyAnimation } from "../../components/LottieAnimation";

const Stats = () => {
  const { user, isLoggedIn } = useGlobalContext();

  // Fetch user learning progress
  const { data: learningProgress, isLoading } = useQuery({
    queryKey: queryKeys.progress.user(user?.$id),
    queryFn: async () => {
      if (!user) return null;
      return await getLearningProgress(user);
    },
    enabled: !!user && isLoggedIn,
  });

  if (!isLoggedIn) {
    return (
      <SafeAreaView
        className="bg-primary h-full px-5 pt-5"
        edges={["right", "top", "left"]}
      >
        <View className="flex-1 justify-center items-center">
          <Text className="font-psemibold text-2xl text-white text-center">
            Log in to view your stats
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalXP = learningProgress?.totalXP || 0;
  const completedLessons = learningProgress?.completedLessons || [];
  const lessonScores = learningProgress?.lessonScoresJSON
    ? JSON.parse(learningProgress.lessonScoresJSON)
    : [];

  // Calculate statistics
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const perfectScores = lessonScores.filter(
    (s) => s.score === s.maxScore
  ).length;

  const averageScore =
    lessonScores.length > 0
      ? lessonScores.reduce((acc, s) => acc + (s.score / s.maxScore) * 100, 0) /
        lessonScores.length
      : 0;

  const totalQuestions = lessonScores.reduce((acc, s) => acc + s.maxScore, 0);
  const totalCorrect = lessonScores.reduce((acc, s) => acc + s.score, 0);

  return (
    <SafeAreaView
      className="bg-primary h-full pt-5"
      edges={["right", "top", "left"]}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 mb-5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" color="white" size={28} />
        </TouchableOpacity>
        <Text className="text-white font-psemibold text-2xl">
          Your Progress
        </Text>
      </View>

      <View className="border-2 border-alt-100 rounded-md mx-5 mb-5" />

      <ScrollView className="px-5">
        {/* XP and Level Overview */}
        <View className="bg-alt-200 rounded-xl p-5 mb-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="fire" color="#ffaa5e" size={32} />
              <View className="ml-3">
                <Text className="text-secondary font-psemibold text-3xl">
                  {totalXP?.toLocaleString()}
                </Text>
                <Text className="text-white font-pregular text-sm">
                  Total XP
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-secondary font-psemibold text-3xl">
                {currentLevel}
              </Text>
              <Text className="text-white font-pregular text-sm">Level</Text>
            </View>
          </View>

          {/* Progress to next level */}
          <View className="mt-2">
            <Text className="text-white font-pregular text-sm mb-2">
              Progress to Level {currentLevel + 1}
            </Text>
            <Progress.Bar
              progress={(totalXP % 1000) / 1000}
              width={null}
              color="#ffaa5e"
              borderWidth={1}
              height={8}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-alt-200 rounded-xl p-4">
            <MaterialCommunityIcons
              name="book-check"
              color="#caffbf"
              size={24}
            />
            <Text className="text-white font-psemibold text-2xl mt-2">
              {completedLessons.length}
            </Text>
            <Text className="text-gray-400 font-pregular text-xs">
              Lessons Completed
            </Text>
          </View>

          <View className="flex-1 bg-alt-200 rounded-xl p-4">
            <MaterialCommunityIcons name="trophy" color="#ffd700" size={24} />
            <Text className="text-white font-psemibold text-2xl mt-2">
              {perfectScores}
            </Text>
            <Text className="text-gray-400 font-pregular text-xs">
              Perfect Scores
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-alt-200 rounded-xl p-4">
            <MaterialCommunityIcons
              name="chart-line"
              color="#a0c4ff"
              size={24}
            />
            <Text className="text-white font-psemibold text-2xl mt-2">
              {Math.round(averageScore)}%
            </Text>
            <Text className="text-gray-400 font-pregular text-xs">
              Average Score
            </Text>
          </View>

          <View className="flex-1 bg-alt-200 rounded-xl p-4">
            <MaterialCommunityIcons
              name="check-circle"
              color="#bdb2ff"
              size={24}
            />
            <Text className="text-white font-psemibold text-2xl mt-2">
              {totalCorrect}/{totalQuestions}
            </Text>
            <Text className="text-gray-400 font-pregular text-xs">
              Questions Correct
            </Text>
          </View>
        </View>

        {/* Recent Activity */}
        <Text className="text-white font-psemibold text-xl mb-3">
          Recent Activity
        </Text>

        {lessonScores.length === 0 ? (
          <View className="bg-alt-200 rounded-xl p-5 items-center justify-center">
            <MaterialCommunityIcons
              name="book-open-variant"
              color="#666"
              size={48}
            />
            <Text className="text-gray-400 font-pregular text-base mt-3 text-center">
              No lessons completed yet.{"\n"}Start learning to see your progress
              here!
            </Text>
          </View>
        ) : (
          <View className="mb-10">
            {lessonScores
              .sort(
                (a, b) => new Date(b.lastAttempted) - new Date(a.lastAttempted)
              )
              .slice(0, 10)
              .map((lessonScore, index) => {
                const percentage = Math.round(
                  (lessonScore.score / lessonScore.maxScore) * 100
                );
                const isPerfect = lessonScore.score === lessonScore.maxScore;

                return (
                  <View
                    key={`${lessonScore.lessonId}-${index}`}
                    className="bg-alt-200 rounded-xl p-4 mb-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-white font-psemibold text-base">
                          Lesson {lessonScore.lessonId}
                        </Text>
                        <Text className="text-gray-400 font-pregular text-sm mt-1">
                          {new Date(
                            lessonScore.lastAttempted
                          ).toLocaleDateString()}
                        </Text>
                      </View>

                      <View className="items-end">
                        <View className="flex-row items-center">
                          {isPerfect && (
                            <MaterialCommunityIcons
                              name="trophy"
                              color="#ffd700"
                              size={16}
                              style={{ marginRight: 4 }}
                            />
                          )}
                          <Text
                            className={`font-psemibold text-lg ${
                              percentage >= 90
                                ? "text-green-400"
                                : percentage >= 70
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {percentage}%
                          </Text>
                        </View>
                        <Text className="text-secondary font-pregular text-sm">
                          +{lessonScore.xpEarned} XP
                        </Text>
                      </View>
                    </View>

                    {/* Progress bar */}
                    <Progress.Bar
                      progress={percentage / 100}
                      width={null}
                      color={
                        percentage >= 90
                          ? "#caffbf"
                          : percentage >= 70
                          ? "#ffd6a5"
                          : "#ffadad"
                      }
                      borderWidth={0}
                      height={4}
                      className="mt-3"
                    />
                  </View>
                );
              })}
          </View>
        )}

        {/* Achievement Preview (Future Enhancement) */}
        {/* <Text className="text-white font-psemibold text-xl mb-3">
          Achievements
        </Text>
        <View className="bg-alt-200 rounded-xl p-5 items-center justify-center mb-10">
          <TrophyAnimation size="medium" />
          <Text className="text-gray-400 font-pregular text-base mt-3 text-center">
            Achievement system coming soon!
          </Text>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Stats;
