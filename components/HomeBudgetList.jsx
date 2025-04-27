import { View, Text } from "react-native";
import React, { useState, useEffect } from "react";

const HomeBudgetList = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
  }, []);

  if (isLoading) {
    return (
      <Text className="text-gray-500 text-regular font-pregular mt-5 text-center">
        Your budgets will appear here once you create one!
      </Text>
    );
  }
  return <View></View>;
};

export default HomeBudgetList;
