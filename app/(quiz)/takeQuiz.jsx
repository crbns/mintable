import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MultiChoice from "../../components/MultiChoice";
import CButton from "../../components/CButton";
import { router, useLocalSearchParams } from "expo-router";
import { getChapterLessonIdQuiz, getChapterQuiz } from "../../lib/appwrite";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TakeQuiz = () => {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const { chapter, lessonId } = useLocalSearchParams();

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

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color="#ffaa5e"
        className="justify-center items-center h-full bg-primary"
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <SafeAreaView className="bg-primary p-5 mt-">
        <View className="h-full items-center justify-center">
          <Text className="text-white font-psemibold text-3xl">
            Failed to load lesson
          </Text>
          <CButton
            title={"Go back"}
            handlePress={() => router.back()}
            containerStyles={"w-full mt-48"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="">
        <TouchableOpacity className="p-5" onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" color={"#203c56"} size={50} />
        </TouchableOpacity>
        {data && index < length ? (
          <>
            <View className="flex flex-col h-4/5  px-4">
              <View className="flex-1 w-full flex items-center justify-center">
                <Text className="text-white font-psemibold text-4xl text-center">
                  {data[index].question_text}
                </Text>
              </View>
              <MultiChoice
                titles={[
                  data[index].answers[0],
                  data[index].answers[1],
                  data[index].answers[2],
                  data[index].answers[3],
                ]}
                correctIndex={data[index].correct_answer_index}
                onCorrect={() => setScore(score + 1)}
                onIncorrect={() => console.log("wrong")}
                showCorrect={true}
                containerStyles={"flex-1"}
                answered={answered}
                setAnswered={setAnswered}
              />
            </View>
            <CButton
              title={"Next"}
              containerStyles={"mt-8"}
              handlePress={() => {
                setIndex(index + 1);
                setAnswered(false);
              }}
            />
          </>
        ) : (
          <View className="">
            <Text className="text-white text-center font-pregular text-2xl">
              You scored
            </Text>
            <Text className="text-secondary text-center font-psemibold text-4xl mt-2">
              {score} / {length}
            </Text>
            <CButton
              title={"Go Back"}
              containerStyles={""}
              handlePress={() => {
                router.back();
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default TakeQuiz;
