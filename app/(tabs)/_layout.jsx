import { View, Text } from "react-native";
import { Tabs } from "expo-router";

import { MaterialCommunityIcons } from "@expo/vector-icons";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-1">
      <MaterialCommunityIcons name={icon} color={color} size={28} />
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
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#ffaa5e",
          tabBarInactiveTintColor: "#d08159",
          tabBarStyle: {
            backgroundColor: "#0d2b45",
            borderTopWidth: 1,
            borderTopColor: "#232533",
            height: 80,
            paddingTop: 5,
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
                icon="home"
                color={color}
                name="Home"
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
                icon="school"
                color={color}
                name="Learn"
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
                icon="cash-multiple"
                color={color}
                name="Budget"
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
