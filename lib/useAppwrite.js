import { useState, useEffect } from "react";
import { Alert } from "react-native";

const useAppwrite = (fn, ...params) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (...params) => {
    setIsLoading(true);

    try {
      const response = await fn(...params);

      setData(response);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(...params);
  }, []);

  const refetch = (...params) => fetchData(...params);

  return { data, isLoading, refetch };
};

export default useAppwrite;
