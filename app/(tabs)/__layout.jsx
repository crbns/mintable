import { View, Text, Image } from "react-native";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import images from "../../constants/images";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-1">
      <View
        className={`border-2 ${
          focused ? " border-secondary rounded-md" : " border-secondary/0"
        }`}
      >
        <Image
          source={icon}
          className="w-[32px] h-[32px]"
          resizeMode="contain"
        />
      </View>
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ textAlign: "center", width: 60, color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          animation: "shift",
          transitionSpec: {
            animation: "spring",
            config: {
              duration: 100,
            },
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#ffaa5e",
          tabBarInactiveTintColor: "#d08159",
          tabBarStyle: {
            backgroundColor: "#1a3045",
            // borderTopWidth: 3,
            // borderTopColor: "#203c56",
            height: 90,
            paddingTop: 15,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={images.home}
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: "Budget",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={images.wallet}
                color={color}
                name="Budget"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: "Learn",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={images.cap}
                color={color}
                name="Learn"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
