import { View, Text, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Bar, CartesianChart } from "victory-native";
import { useFont, LinearGradient, vec } from "@shopify/react-native-skia";
import pregular from "../assets/fonts/Poppins-Regular.ttf";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CACHE_KEYS, loadFromCache, storeToCache } from "../lib/cacheUtil";
import eventBus from "../lib/eventBus";
import CButton from "./CButton";
import { useFocusEffect } from "expo-router";
import { getWeekNumber } from "../lib/dateUtil";
import { BUDGET_CONTRIBUTIONS_JSON_SCHEMA_VERSION } from "../constants/constants";

const BudgetContributionGraph = () => {
  const [balanceContributions, setBalanceContributions] = useState(null);
  const [barData, setBarData] = useState([]);
  const [changeFromLast, setChangeFromLast] = useState(0);
  const font = useFont(pregular, 12);

  const isValidBudgetData = (data) => {
    if (data.version !== BUDGET_CONTRIBUTIONS_JSON_SCHEMA_VERSION) {
      return false;
    } else {
      return true;
    }
  };

  const initializeContributions = async () => {
    console.log("initializeContributions");
    const cached = await loadFromCache(CACHE_KEYS.budgetContributions);
    let parsedData;

    const defaultData = {
      version: BUDGET_CONTRIBUTIONS_JSON_SCHEMA_VERSION,
      values: Array(7).fill("0"),
      last: "0",
      lastWeekNumber: getWeekNumber().toString(),
    };

    if (!cached) {
      console.log("No cache found. Initializing.");
      await storeToCache(
        CACHE_KEYS.budgetContributions,
        JSON.stringify(defaultData)
      );
      parsedData = defaultData;
    } else {
      try {
        parsedData = JSON.parse(cached);

        if (!isValidBudgetData(parsedData)) {
          throw new Error("Cache schema mismatch. Resetting to default.");
        }
      } catch (e) {
        console.warn(
          "Invalid or corrupted cache. Resetting. Reason:",
          e.message
        );
        await storeToCache(
          CACHE_KEYS.budgetContributions,
          JSON.stringify(defaultData)
        );
        parsedData = defaultData;
      }
    }

    await updateOnNewWeek(parsedData);
  };

  const updateOnNewWeek = async (data) => {
    const currentWeek = getWeekNumber();
    console.log("currentWek: " + currentWeek);
    const lastStoredWeek = parseInt(data.lastWeekNumber || "-1", 10);

    if (lastStoredWeek !== currentWeek) {
      const bCTotal = data.values.reduce(
        (sum, val) => sum + parseInt(val, 10),
        0
      );

      const updated = {
        ...data,
        last: bCTotal.toString(),
        values: Array(7).fill("0"),
        lastWeekNumber: currentWeek.toString(),
      };

      await storeToCache(
        CACHE_KEYS.budgetContributions,
        JSON.stringify(updated)
      );
      setBalanceContributions(updated); // or return updated
    } else {
      setBalanceContributions(data);
    }
  };

  const reloadGraphData = (data) => {
    console.log("Reloading graph with data:", data);

    const sanitizedValues = data.values.map((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    });

    const total = sanitizedValues.reduce((sum, val) => sum + val, 0);
    const diff = total - parseInt(data.last || "0", 10);
    setChangeFromLast(diff);

    const formatted = sanitizedValues.map((val, i) => ({
      day: i + 1,
      amount: val,
    }));

    setBarData(formatted);
    console.log("sanitized: " + sanitizedValues);
  };

  useEffect(() => {
    const sub = eventBus.addListener("newContribution", (newContrib) => {
      const parsed = JSON.parse(newContrib);
      storeToCache(CACHE_KEYS.budgetContributions, newContrib);
      setBalanceContributions(parsed);
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (balanceContributions) {
      reloadGraphData(balanceContributions);
    }
  }, [balanceContributions]);

  useFocusEffect(
    useCallback(() => {
      initializeContributions();
    }, [])
  );

  if (!font || barData.length === 0) {
    return <ActivityIndicator />; // Or a loading indicator
  }

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
          xKey="day"
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
