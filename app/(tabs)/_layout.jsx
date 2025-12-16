import {
  NativeTabs,
  Icon,
  Label,
  Badge,
} from "expo-router/unstable-native-tabs";

const TabsLayout = () => {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Label selectedStyle={{ color: "#ffaa5e" }}>Home</Label>
        <Icon
          sf={{ default: "house", selected: "house.fill" }}
          selectedColor={"#ffaa5e"}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="budget">
        <Label selectedStyle={{ color: "#ffaa5e" }}>Budget</Label>
        <Icon
          sf={{ default: "wallet.bifold", selected: "wallet.bifold.fill" }}
          selectedColor={"#ffaa5e"}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="learn">
        <Label selectedStyle={{ color: "#ffaa5e" }}>Learn</Label>
        <Icon
          sf={{ default: "graduationcap", selected: "graduationcap.fill" }}
          selectedColor={"#ffaa5e"}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
