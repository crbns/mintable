import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Bar, CartesianChart, Line } from "victory-native";
import { useFont, LinearGradient, vec } from "@shopify/react-native-skia";
import pregular from "../assets/fonts/Poppins-Regular.ttf";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CACHE_KEYS, loadFromCache, storeToCache } from "../lib/cacheUtil";
import eventBus from "../lib/eventBus";
import CButton from "./CButton";

const BudgetContributionGraph = () => {
  const [balanceContributions, setBalanceContributions] = useState(null);
  const [barData, setBarData] = useState(
    Array.from({ length: 7 }, (_, index) => ({
      day: index + 1,
      amount: 0,
    }))
  );
  const [changeFromLast, setchangeFromLast] = useState(0);
  const loadBarData = async () => {
    const balanceContributionss = await loadFromCache(
      CACHE_KEYS.budgetContributions
    );

    if (!balanceContributionss) {
      // if no balance contributions in cache, initialize the json
      const jsonString =
        '{"values": ["0","0","0","0","0","0","0"],"last": "0","lastDate": "0"}';
      await storeToCache(CACHE_KEYS.budgetContributions, jsonString);
      setBalanceContributions(JSON.parse(jsonString));
    } else {
      setBalanceContributions(JSON.parse(balanceContributionss));
    }

    reloadBarData();
  };

  const reloadBarData = () => {
    const bCTotal = balanceContributions.values.reduce(
      (partialSum, a) => partialSum + parseInt(a),
      0
    );

    setchangeFromLast(bCTotal - parseInt(balanceContributions.last));

    setBarData(
      Array.from({ length: 7 }, (_, index) => ({
        day: index + 1,
        amount: parseInt(balanceContributions.values[index]),
      }))
    );
  };

  const font = useFont(pregular, 12);

  useEffect(() => {
    loadBarData();

    const sub = eventBus.addListener("newContribution", (newContrib) => {
      setBalanceContributions(JSON.parse(newContrib));
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (balanceContributions) {
      reloadBarData();
    }
  }, [balanceContributions]);

  return (
    <>
      <Text className="text-white font-psemibold text-left text-2xl mt-3">
        Your budget contributions this week
      </Text>
      <View className="flex-row my-2 items-center">
        <Text className="text-white mr-1">Change from last week:</Text>
        <Text
          className={`${
            changeFromLast >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ${Math.abs(changeFromLast)}
        </Text>
        <MaterialCommunityIcons
          name={changeFromLast >= 0 ? "arrow-top-right" : "arrow-bottom-right"}
          size={15}
          color={`${changeFromLast >= 0 ? "#16a34a" : "#dc2626"}`}
        />
      </View>
      <View style={{ height: 200 }}>
        <CartesianChart
          data={barData}
          /**
           * 👇 the xKey should map to the property on data of you want on the x-axis
           */
          xKey="day"
          /**
           * 👇 the yKey is an array of strings that map to the data you want
           * on the y-axis. In this case we only want the listenCount, but you could
           * add additional if you wanted to show multiple song listen counts.
           */
          yKeys={["amount"]}
          domainPadding={{ left: 25, right: 25, top: 0 }}
          axisOptions={{
            font,
            formatXLabel: (value) => {
              const date = new Date(2023, 0, value);
              return date.toLocaleString("default", { weekday: "short" });
            },
            formatYLabel: (value) => {
              return "$" + value;
            },
            lineWidth: 0,
            labelColor: "#6b7280",
          }}
        >
          {({ points, chartBounds }) => (
            <Bar
              chartBounds={chartBounds} // 👈 chartBounds is needed to know how to draw the bars
              points={points.amount} // 👈 points is an object with a property for each yKey
              roundedCorners={{
                topLeft: 5,
                topRight: 5,
              }}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 300)}
                colors={["#ffaa5e", "#ffaa5e60"]}
              />
            </Bar>
          )}
        </CartesianChart>
      </View>
    </>
  );
};

export default BudgetContributionGraph;
