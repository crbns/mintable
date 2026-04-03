import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInDown,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import MultiChoice from "../../components/MultiChoice";
import CButton from "../../components/CButton";
import XPAwardScreen from "../../components/XPAwardScreen";
import { router, useLocalSearchParams } from "expo-router";
import {
  getChapterLessonIdQuiz,
  updateLessonProgress,
} from "../../lib/appwrite";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGlobalContext } from "../../context/GlobalProvider";
import { LoadingAnimation } from "../../components/LottieAnimation";
import * as Progress from "react-native-progress";
import images from "../../constants/images";

const TakeQuiz = () => {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [showXPAward, setShowXPAward] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [isPerfectScore, setIsPerfectScore] = useState(false);
  const [isFirstCompletion, setIsFirstCompletion] = useState(false);

  const { chapter, lessonId } = useLocalSearchParams();

  // Auto-progress timer
  useEffect(() => {
    if (answered && !showXPAward) {
      const timer = setTimeout(() => {
        if (index + 1 >= length) {
          handleQuizComplete();
        } else {
          setIndex(index + 1);
          setAnswered(false);
          setIsShowingFeedback(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [answered, index, length, showXPAward]);
  const { user, isLoggedIn } = useGlobalContext();
  const queryClient = useQueryClient();

  // Shuffle function using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Mutation for updating lesson progress
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData) => {
      return await updateLessonProgress(
        progressData.lessonId,
        progressData.score,
        progressData.maxScore,
        progressData.xpEarned
      );
    },
    onSuccess: () => {
      // Invalidate progress queries to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.user(user?.$id),
      });
    },
    onError: (error) => {
      console.error("Failed to update progress:", error);
    },
  });

  // Use React Query for quiz data
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.lessons.chapterLesson(parseInt(chapter), lessonId),
    queryFn: async () => {
      console.log(
        "[QUERY] Fetching quiz data for chapter",
        chapter,
        "lesson",
        lessonId
      );
      const result = await getChapterLessonIdQuiz(parseInt(chapter), lessonId);
      console.log(
        "[QUERY] Quiz data fetched:",
        result?.length || 0,
        "questions"
      );
      return result;
    },
  });

  let length = 0;
  if (data && Array.isArray(data)) {
    length = data.length;
  }

  // Shuffle answers for each question when data loads or index changes
  const shuffledQuestions = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((question) => {
      // Create array of answer objects with original indices
      const answersWithIndices = question.answers.map((answer, idx) => ({
        text: answer,
        originalIndex: idx,
      }));

      // Shuffle the answers
      const shuffled = shuffleArray(answersWithIndices);

      // Find new position of correct answer
      const newCorrectIndex = shuffled.findIndex(
        (item) => item.originalIndex === question.correct_answer_index
      );

      return {
        ...question,
        shuffledAnswers: shuffled.map((item) => item.text),
        shuffledCorrectIndex: newCorrectIndex,
      };
    });
  }, [data]);

  // Calculate XP based on performance
  const calculateXP = (finalScore, totalQuestions) => {
    let xp = finalScore * 10; // 10 XP per correct answer

    // Perfect score bonus
    if (finalScore === totalQuestions) {
      xp += 50;
    }

    // First completion bonus (simplified - in real app, check against stored progress)
    // For now, assume it's first completion
    xp += 100;

    return xp;
  };

  // Handle quiz completion
  const handleQuizComplete = () => {
    const totalQuestions = length;
    const finalScore = score;
    const earnedXP = calculateXP(finalScore, totalQuestions);

    setXpEarned(earnedXP);
    setIsPerfectScore(finalScore === totalQuestions);
    setIsFirstCompletion(true); // Simplified - in real app, check progress

    // Update progress if user is logged in
    if (isLoggedIn && user) {
      updateProgressMutation.mutate({
        lessonId: `${chapter}-${lessonId}`,
        score: finalScore,
        maxScore: totalQuestions,
        xpEarned: earnedXP,
      });
    }

    // Show XP award screen
    setShowXPAward(true);
  };

  // Handle continuing after XP award
  const handleContinue = () => {
    setShowXPAward(false);
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView
        className="bg-primary h-full"
        edges={["right", "top", "left"]}
      >
        <View className="flex-1 items-center justify-center">
          <LoadingAnimation size="large" />
          <Text className="text-white font-pregular text-lg mt-4">
            Loading lesson...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SafeAreaView
        className="bg-primary h-full"
        edges={["right", "top", "left"]}
      >
        <View className="flex-1 items-center justify-center px-5">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            color="#ef4444"
            size={80}
          />
          <Text className="text-white font-psemibold text-2xl text-center mt-5">
            Failed to load lesson
          </Text>
          <Text className="text-gray-400 font-pregular text-base text-center mt-3">
            Please check your connection and try again.
          </Text>
          <CButton
            title="Go Back"
            handlePress={() => router.back()}
            containerStyles="w-full mt-8"
          />
        </View>
      </SafeAreaView>
    );
  }

  const progressPercentage = length > 0 ? (index + 1) / length : 0;

  return (
    <SafeAreaView
      className="bg-primary h-full"
      edges={["right", "top", "left"]}
    >
      {/* Top Bar - Consistent with Budget Screen */}
      <View className="px-5 pt-3 pb-3">
        {/* Header with Logo and Title */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2 flex-1">
            <Image
              source={images.logoSmall}
              className="w-[50px] h-[25px]"
              resizeMode="contain"
            />
            <Text className="text-white font-psemibold text-xl">Quiz</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <MaterialCommunityIcons name="close" color="#9ca3af" size={24} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar with Question Counter */}
        <View className="border-2 border-alt-100 p-3 rounded-xl">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-secondary font-psemibold text-sm">
              Question {index + 1} of {length}
            </Text>
            <Text className="text-white font-pregular text-xs">
              {Math.round(progressPercentage * 100)}%
            </Text>
          </View>
          <Progress.Bar
            progress={progressPercentage}
            width={null}
            height={8}
            color="#ffaa5e"
            unfilledColor="#1f2937"
            borderWidth={0}
            borderRadius={4}
          />
        </View>
      </View>

      {shuffledQuestions && index < length ? (
        <Animated.View
          key={index}
          entering={reduceMotion ? undefined : FadeInRight.duration(300).easing(Easing.out(Easing.cubic))}
          exiting={reduceMotion ? undefined : FadeOutLeft.duration(200).easing(Easing.out(Easing.cubic))}
          className="flex-1 px-5 pt-8"
        >
          {/* Question - Centered and Prominent */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(80).duration(250).easing(Easing.out(Easing.cubic))}
            className="flex-1 justify-center items-center pb-8"
          >
            <Text className="text-white font-psemibold text-4xl text-center leading-tight">
              {shuffledQuestions[index].question_text}
            </Text>
          </Animated.View>

          {/* Answer Choices */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(100).duration(200).easing(Easing.out(Easing.cubic))}
            className="flex-1 pb-5"
          >
            <MultiChoice
              titles={shuffledQuestions[index].shuffledAnswers}
              correctIndex={shuffledQuestions[index].shuffledCorrectIndex}
              onCorrect={() => {
                setScore(score + 1);
                setIsShowingFeedback(true);
              }}
              onIncorrect={() => setIsShowingFeedback(true)}
              showCorrect={true}
              containerStyles="flex-1"
              answered={answered}
              setAnswered={setAnswered}
              isShowingFeedback={isShowingFeedback}
            />
          </Animated.View>
        </Animated.View>
      ) : null}

      {/* XP Award Screen */}
      <XPAwardScreen
        visible={showXPAward}
        onContinue={handleContinue}
        xpEarned={xpEarned}
        score={score}
        maxScore={length}
        isPerfectScore={isPerfectScore}
        isFirstCompletion={isFirstCompletion}
      />
    </SafeAreaView>
  );
};

export default TakeQuiz;
