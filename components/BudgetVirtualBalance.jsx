import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useReducedMotion } from "react-native-reanimated";
import ContentLoader, { Rect } from "react-content-loader/native";
import CButton from "./CButton";
import { getDaysUntilNextUpdate } from "../lib/dateUtil";
import { formatMoney } from "../lib/format";

const FREQUENCY_WORDS = {
  monthly: "every month",
  quarterly: "every quarter",
  yearly: "every year",
};

// "+$50 every month · next in 3 days", or null when the schedule is unknown
const refillLine = (refill) => {
  if (!refill?.amount || !FREQUENCY_WORDS[refill.freq]) return null;
  const days = getDaysUntilNextUpdate(refill.freq);
  const when =
    days === 1
      ? "next refill tomorrow"
      : days > 1
        ? `next refill in ${days} days`
        : null;
  return [
    `+${formatMoney(refill.amount)} ${FREQUENCY_WORDS[refill.freq]}`,
    when,
  ]
    .filter(Boolean)
    .join(" · ");
};

const BudgetVirtualBalance = ({
  loading,
  error,
  onRetry,
  virtualBalance,
  refill,
  onPress,
  buttonTitle,
  disabled,
  hint,
  containerStyles = "",
}) => {
  const reduceMotion = useReducedMotion();
  const refillText = refillLine(refill);

  return (
    <View
      className={`border-2 border-b-4 border-alt-100 p-3 rounded-xl mt-3 ${containerStyles}`}
    >
      <Text className="text-white font-pregular">Virtual balance</Text>

      {error ? (
        <View className="pt-3 pb-2">
          <Text className="text-white font-pregular text-base">
            Couldn't load your balance.
          </Text>
          <TouchableOpacity
            onPress={onRetry}
            accessibilityRole="button"
            className="self-start min-h-[44px] justify-center"
          >
            <Text className="text-secondary font-psemibold text-base">
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <ContentLoader
          accessibilityLabel="Loading balance"
          animate={!reduceMotion}
          speed={1.2}
          width={160}
          height={64}
          backgroundColor="#203c56"
          foregroundColor="#2c4c6b"
        >
          <Rect x="0" y="16" rx="8" ry="8" width="160" height="44" />
        </ContentLoader>
      ) : (
        <>
          <Text
            className="text-5xl font-plight text-white pt-3"
            accessibilityLabel={`Virtual balance, ${formatMoney(virtualBalance)}`}
          >
            {formatMoney(virtualBalance)}
          </Text>
          {refillText && (
            <Text className="text-muted font-pregular text-sm mb-1">
              {refillText}
            </Text>
          )}
        </>
      )}

      <CButton
        title={buttonTitle ?? "Allocate"}
        containerStyles={"mt-3"}
        disabledd={disabled || loading || error}
        handlePress={onPress}
      />
      {hint && (
        <Text className="text-muted font-pregular text-sm text-center mt-2">
          {hint}
        </Text>
      )}
    </View>
  );
};

export default BudgetVirtualBalance;
