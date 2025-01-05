import { View, Text } from "react-native";
import { Tabs } from "expo-router";

import { MaterialIcons } from "@expo/vector-icons";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <MaterialIcons name={icon} color={color} size={32} />
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
            height: 84,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => {
              <TabIcon
                icon={"home"}
                color={color}
                name="Home"
                focused={focused}
              />;
            },
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
