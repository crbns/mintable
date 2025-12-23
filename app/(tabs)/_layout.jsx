import { useNavigation } from "expo-router";
import {
  NativeTabs,
  Icon,
  Label,
  Badge,
} from "expo-router/unstable-native-tabs";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";

const TabsLayout = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("state", (e) => {
      Haptics.selectionAsync();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <NativeTabs
      backgroundColor={"#0d2b45"}
      disableTransparentOnScrollEdge
      indicatorColor={"#203c56"}
    >
      <NativeTabs.Trigger name="home">
        <Label selectedStyle={{ color: "#ffaa5e" }}>Home</Label>
        <Icon
          sf={{ default: "house", selected: "house.fill" }}
          androidSrc={require("../../assets/icons/icons8-home-mono.png")}
          selectedColor={"#ffaa5e"}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="budget">
        <Label selectedStyle={{ color: "#ffaa5e" }}>Budget</Label>
        <Icon
          sf={{ default: "wallet.bifold", selected: "wallet.bifold.fill" }}
          androidSrc={require("../../assets/icons/icons8-coins-mono.png")}
          selectedColor={"#ffaa5e"}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="learn">
        <Label selectedStyle={{ color: "#ffaa5e" }}>Learn</Label>
        <Icon
          sf={{ default: "graduationcap", selected: "graduationcap.fill" }}
          androidSrc={require("../../assets/icons/icons8-graduation-cap-mono.png")}
          selectedColor={"#ffaa5e"}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
