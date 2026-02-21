import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getLearningProgress } from "../../lib/appwrite";
import { queryKeys } from "../../lib/queryKeys";

import images from "../../constants/images";
import XPBar from "../../components/XPBar";
import LessonNode from "../../components/LessonNode";
import LessonDetailModal from "../../components/LessonDetailModal";
import CButton from "../../components/CButton";

// Lesson data structure - in real app, fetch from database
const LESSONS_DATA = [
  {
    id: "1",
    chapter: 1,
    lessonId: "1",
    title: "Learn the basics of budgeting",
    shortTitle: "Budget Basics",
    description:
      "Discover fundamental budgeting concepts and why they matter for your financial health.",
    iconName: "cash-fast",
    maxXP: 250,
  },
  {
    id: "2a",
    chapter: 1,
    lessonId: "2a",
    title: "The 50/20/30 Rule",
    shortTitle: "50/20/30 Rule",
    description:
      "Learn how to split your income: 50% needs, 20% savings, 30% wants.",
    iconName: "percent",
    maxXP: 200,
  },
  {
    id: "2b",
    chapter: 1,
    lessonId: "2b",
    title: "Needs versus Wants",
    shortTitle: "Needs vs. Wants",
    description:
      "Understanding the difference between essential expenses and discretionary spending.",
    iconName: "account",
    maxXP: 200,
  },
  {
    id: "3q",
    chapter: 1,
    lessonId: "3q",
    title: "Budgeting Quiz",
    shortTitle: "Quiz",
    description: "Test your knowledge of budgeting fundamentals.",
    iconName: "list-status",
    maxXP: 400,
  },
];

const Learn = () => {
  const { user, isLoggedIn } = useGlobalContext();
  const queryClient = useQueryClient();

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showLessonDetail, setShowLessonDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user learning progress
  const { data: learningProgress, refetch: refetchProgress } = useQuery({
    queryKey: queryKeys.progress.user(user?.$id),
    queryFn: async () => {
      if (!user) return null;
      return await getLearningProgress(user);
    },
    enabled: !!user && isLoggedIn,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchProgress();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLessonPress = (lessonId) => {
    const lesson = LESSONS_DATA.find((l) => l.id === lessonId);
    if (lesson) {
      setSelectedLesson(lesson);
      setShowLessonDetail(true);
    }
  };

  const handleStartLesson = () => {
    if (!selectedLesson) return;

    setShowLessonDetail(false);
    router.push({
      pathname: "/takeQuiz",
      params: {
        chapter: selectedLesson.chapter,
        lessonId: selectedLesson.lessonId,
      },
    });
  };

  const getLessonStatus = (lessonId) => {
    if (!learningProgress) {
      return {
        isCompleted: false,
        isInProgress: false,
        isSuggested: lessonId === "1", // First lesson is always suggested
        progress: 0,
        previousScore: null,
      };
    }

    const completedLessons = learningProgress.completedLessons || [];
    const lessonScores = learningProgress.lessonScoresJSON
      ? JSON.parse(learningProgress.lessonScoresJSON)
      : [];

    const fullLessonId = lessonId.includes("-") ? lessonId : `1-${lessonId}`;
    const isCompleted = completedLessons.includes(fullLessonId);
    const scoreData = lessonScores.find((s) => s.lessonId === fullLessonId);

    // Determine if lesson is suggested (next one to do)
    const completedCount = completedLessons.length;
    const lessonIndex = LESSONS_DATA.findIndex((l) => l.id === lessonId);
    const isSuggested = lessonIndex === completedCount && !isCompleted;

    return {
      isCompleted,
      isInProgress: !!scoreData && !isCompleted,
      isSuggested,
      progress: scoreData ? scoreData.score / scoreData.maxScore : 0,
      previousScore: scoreData,
    };
  };

  const getPreviousScore = (lessonId) => {
    if (!learningProgress) return null;

    const lessonScores = learningProgress.lessonScoresJSON
      ? JSON.parse(learningProgress.lessonScoresJSON)
      : [];
    const fullLessonId = lessonId.includes("-") ? lessonId : `1-${lessonId}`;
    return lessonScores.find((s) => s.lessonId === fullLessonId) || null;
  };

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <SafeAreaView
        className="bg-primary h-full px-5 pt-5"
        edges={["right", "top", "left"]}
      >
        <View className="flex-1 justify-center items-center gap-10">
          <View>
            <Text className="font-psemibold text-center text-2xl text-white">
              Log in to track your learning progress
            </Text>
            <Text className="font-pregular text-center text-base text-gray-500 mt-5">
              Track your XP, completed lessons, and achievements across all your
              devices.
            </Text>
          </View>
          <View className="w-full">
            <CButton
              title="Log In"
              handlePress={() => router.push("/sign-in")}
            />
            <CButton
              title="Continue as Guest"
              containerStyles="mt-3 border-2 border-gray-600"
              containerColor="bg-primary"
              textColor="text-gray-600"
              handlePress={() => {
                // Allow guest access but don't track progress
                console.log("Guest mode - progress won't be saved");
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const totalXP = learningProgress?.totalXP || 0;
  const completedLessonsCount = learningProgress?.completedLessons?.length || 0;

  return (
    <SafeAreaView
      className="bg-primary h-full pt-5"
      edges={["right", "top", "left"]}
    >
      {/* Header */}
      <View className="flex-row gap-2 px-5 items-center justify-between">
        <View className="flex-row gap-2 items-center">
          <Image
            source={images.logoSmall}
            className="w-[60px] h-[30px]"
            resizeMode="contain"
          />
          <Text className="text-white font-psemibold text-2xl">Learn</Text>
        </View>

        {/* Stats button */}
        <TouchableOpacity
          className="p-2"
          onPress={() => {
            router.push("/stats");
          }}
        >
          <MaterialCommunityIcons name="chart-bar" color="gray" size={28} />
        </TouchableOpacity>
      </View>

      <View className="my-5 border-2 border-alt-100 rounded-md mx-5" />

      {/* XP Bar */}
      <View className="px-5">
        <XPBar totalXP={totalXP} showLevelUp={true} />
      </View>

      {/* Lessons Path */}
      <ScrollView
        className="w-full px-5 mt-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Chapter Title */}
        <View className="justify-center mb-5">
          <Text className="text-white font-psemibold text-left text-4xl">
            Budgeting
          </Text>
          <Text className="text-gray-400 font-pregular text-base mt-2">
            {completedLessonsCount} / {LESSONS_DATA.length} lessons completed
          </Text>
        </View>

        {/* Vertical Lesson Path */}
        <View className="items-center">
          {/* Lesson 1 - Full width */}
          <LessonNode
            lessonId={LESSONS_DATA[0].id}
            title={LESSONS_DATA[0].title}
            shortTitle={LESSONS_DATA[0].shortTitle}
            iconName={LESSONS_DATA[0].iconName}
            maxXP={LESSONS_DATA[0].maxXP}
            {...getLessonStatus(LESSONS_DATA[0].id)}
            onPress={handleLessonPress}
          />

          {/* Path connector */}
          <View className="w-1 h-8 bg-alt-100" />

          {/* Lesson 2a and 2b - Side by side */}
          <View className="flex-row w-full justify-center">
            <View className="flex-1 items-center">
              <LessonNode
                lessonId={LESSONS_DATA[1].id}
                title={LESSONS_DATA[1].title}
                shortTitle={LESSONS_DATA[1].shortTitle}
                iconName={LESSONS_DATA[1].iconName}
                maxXP={LESSONS_DATA[1].maxXP}
                {...getLessonStatus(LESSONS_DATA[1].id)}
                onPress={handleLessonPress}
                size={70}
              />
            </View>
            <View className="flex-1 items-center">
              <LessonNode
                lessonId={LESSONS_DATA[2].id}
                title={LESSONS_DATA[2].title}
                shortTitle={LESSONS_DATA[2].shortTitle}
                iconName={LESSONS_DATA[2].iconName}
                maxXP={LESSONS_DATA[2].maxXP}
                {...getLessonStatus(LESSONS_DATA[2].id)}
                onPress={handleLessonPress}
                size={70}
              />
            </View>
          </View>

          {/* Path connector */}
          <View className="w-1 h-8 bg-alt-100" />

          {/* Lesson 3 - Quiz */}
          <LessonNode
            lessonId={LESSONS_DATA[3].id}
            title={LESSONS_DATA[3].title}
            shortTitle={LESSONS_DATA[3].shortTitle}
            iconName={LESSONS_DATA[3].iconName}
            maxXP={LESSONS_DATA[3].maxXP}
            {...getLessonStatus(LESSONS_DATA[3].id)}
            onPress={handleLessonPress}
          />

          {/* End of budgeting section */}
          <View className="border-[1px] border-dotted border-alt-100 w-full my-8" />

          <Text className="text-center text-alt-100 font-psemibold text-2xl mt-5">
            More lessons coming soon!
          </Text>

          <Text className="text-center text-alt-100 font-pregular text-base mt-3 mb-10">
            We're constantly adding new lessons to help you master budgeting and
            financial literacy.
          </Text>
        </View>
      </ScrollView>

      {/* Lesson Detail Modal */}
      <LessonDetailModal
        visible={showLessonDetail}
        onClose={() => setShowLessonDetail(false)}
        onStartLesson={handleStartLesson}
        lesson={selectedLesson}
        previousScore={
          selectedLesson ? getPreviousScore(selectedLesson.id) : null
        }
        isCompleted={
          selectedLesson
            ? getLessonStatus(selectedLesson.id).isCompleted
            : false
        }
      />
    </SafeAreaView>
  );
};

export default Learn;
