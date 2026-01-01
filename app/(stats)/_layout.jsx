import { Stack } from "expo-router";

export default function StatsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="stats"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
