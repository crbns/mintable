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
        <Label>Home</Label>
        <Icon sf={{ default: "house", selected: "house.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="budget">
        <Label>Budget</Label>
        <Icon
          sf={{ default: "wallet.bifold", selected: "wallet.bifold.fill" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="learn">
        <Label>Learn</Label>
        <Icon
          sf={{ default: "graduationcap", selected: "graduationcap.fill" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
