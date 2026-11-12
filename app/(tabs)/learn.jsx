import { View, Text, Image, ScrollView } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import OutlineButton from "../../components/OutlineButton";
import MultiChoice from "../../components/MultiChoice";
import CButton from "../../components/CButton";
import { router } from "expo-router";

import { loadFromCache } from "../../lib/cacheUtil";
import LessonContainer from "../../components/LessonContainer";
import RoundLessonContainer from "../../components/RoundLessonContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import images from "../../constants/images";

const Learn = () => {
  const [active, setActive] = useState(null);

  return (
    <SafeAreaView
      className="bg-primary h-full pt-5"
      edges={["right", "top", "left"]}
    >
      {/* <View className="p-5 flex-row bg-primary border-alt-100 border-b-2">
        <View className="flex-row p-3 border-alt-100 border-2 border-b-4 rounded-xl items-center justify-center">
          <MaterialCommunityIcons name="heart" color="red" size={25} />
          <Text className="text-white font-pregular px-2 text-xl">1000</Text>
          <MaterialCommunityIcons name="fire" color="orange" size={25} />
          <Text className="text-white font-pregular px-2 text-xl">1000</Text>
        </View>
        <View className="flex-1 items-end">
          <Image
            source={images.logoSmall}
            className="w-[70px] h-[40px] flex-1 "
            resizeMode="contain"
          />
        </View>
      </View> */}

      <View className="flex-row gap-2 px-5">
        <View className="flex-row gap-2 items-center">
          <Image
            source={images.logoSmall}
            className="w-[60px] h-[30px]"
            resizeMode="contain"
          />
          <Text className="text-white font-psemibold text-2xl">Learn</Text>
        </View>
        {/* <View className="flex-row ml-5 p-3 border-alt-100 border-2 border-b-4 rounded-xl items-center justify-center flex-1">
          <MaterialCommunityIcons name="heart" color="red" size={25} />
          <Text className="text-white font-pregular px-2 text-xl">1000</Text>
          <MaterialCommunityIcons name="fire" color="orange" size={25} />
          <Text className="text-white font-pregular px-2 text-xl">1000</Text>
        </View> */}
      </View>
      <View className="my-5 border-2 border-alt-100 rounded-md" />
      <ScrollView
        className="w-full px-5"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="justify-center">
          <Text className="text-white font-psemibold text-left text-4xl">
            Budgeting
          </Text>

          <RoundLessonContainer
            id={"1"}
            active={active}
            setActive={setActive}
            title={"Learn the basics of budgeting"}
            shortTitle={"Budget Basics"}
            iconName={"cash-fast"}
            href={"/takeQuiz?chapter=1&lessonId=1"}
          />
          <View className="flex-row">
            <RoundLessonContainer
              id={"2a"}
              active={active}
              setActive={setActive}
              containerStyles={"flex-1"}
              href={"/takeQuiz?chapter=1&lessonId=2a"}
              iconName={"percent"}
              shortTitle={"50/20/30 Rule"}
              title={"The 50/20/30 Rule"}
            />
            <RoundLessonContainer
              id={"2b"}
              active={active}
              setActive={setActive}
              containerStyles={"flex-1"}
              href={"/takeQuiz?chapter=1&lessonId=2b"}
              iconName={"account"}
              shortTitle={"Needs vs. Wants"}
              title={"Needs versus wants"}
            />
          </View>
        </View>
        <RoundLessonContainer
          id={"3q"}
          active={active}
          setActive={setActive}
          href={"/takeQuiz?chapter=1&lessonId=3q"}
          iconName={"list-status"}
          shortTitle={"Quiz"}
          title={"Budgeting Quiz"}
        />
        {/* End of budgeting section */}

        {/* FIND A FIX FOR TS */}
        {/* <View
          className=""
          style={{
            borderTopWidth: 1,
            borderStyle: "dashed",
            borderColor: "#0d2b45",
          }}
        /> */}
        <View className="border-[1px] border-dotted border-alt-100 w-full" />

        <Text className="text-center text-alt-100 font-psemibold text-2xl mt-5">
          More lessons coming soon!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Learn;
