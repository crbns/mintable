import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MultiChoice from "../../components/MultiChoice";
import CButton from "../../components/CButton";
import { router, useLocalSearchParams } from "expo-router";
import useAppwrite from "../../lib/useAppwrite";
import { getChapterLessonIdQuiz, getChapterQuiz } from "../../lib/appwrite";
import { CACHE_KEYS, loadFromCache, storeToCache } from "../../lib/cacheUtil";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TakeQuiz = () => {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // cache loading
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { chapter, lessonId } = useLocalSearchParams();

  // key of cache, fn: appwrite function in appwrite.js
  const loadData = async (key, fn) => {
    setIsLoading(true);
    const cachedData = await loadFromCache(key);
    // if data already exists, load that and dont make call to db
    // if (cachedData) {
    //   console.log("loading cached data");
    //   setData(cachedData);
    //   setIsLoading(false);
    //   return;
    // }

    // data isnt cached already so make call to appwrite db
    console.log("loading db data");
    const dbData = await fn(parseInt(chapter), lessonId);
    await storeToCache(key, dbData);

    setData(dbData);
    setIsLoading(false);
  };
  let length = null;
  if (data !== null) {
    length = data.length;
  }

  useEffect(() => {
    loadData(`${chapter}${lessonId}`, getChapterLessonIdQuiz);
  }, []);

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color="#ffaa5e"
        className="justify-center items-center h-full bg-primary"
      />
    );
  }

  if (data[0] === undefined || data === undefined) {
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
        {index < length ? (
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
