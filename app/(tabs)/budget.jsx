import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetContainer from "../../components/BudgetContainer";
import CButton from "../../components/CButton";
import IconButton from "../../components/IconButton";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import DropDownPicker from "react-native-dropdown-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DropDown from "../../components/DropDown";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useIsFetching,
} from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import {
  createBudget as createBudgetDb,
  deleteBudget,
  getBudgetByDocId,
  getBudgets,
  getCurrentUser,
  getPreferences,
  getVirtualBalance,
  updateBudget,
  updatePreferences,
  updateVirtualBalance,
} from "../../lib/appwrite";
import images from "../../constants/images";
import ContentLoader, { Facebook, Rect } from "react-content-loader/native";
import SmallError from "../../components/SmallError";
import BudgetSetup from "../../components/BudgetSetup";
import { loadFromCache, storeToCache, CACHE_KEYS } from "../../lib/cacheUtil";
import eventBus from "../../lib/eventBus";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useIsFocused } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import DrawerModal from "../../components/DrawerModal";
import EditBudgetDrawerModal from "../../components/EditBudgetDrawerModal";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { events, logEvent } from "../../lib/appsflyer";
import * as SecureStore from "expo-secure-store";

const Budget = () => {
  console.log("Budget component render start");
  const { user, isLoggedIn } = useGlobalContext();
  console.log("Budget render: isLoggedIn =", isLoggedIn, "user =", !!user);
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();

  // Log user state changes
  useEffect(() => {
    console.log("User state changed:", {
      isLoggedIn,
      userExists: !!user,
      userId: user?.$id,
    });
  }, [user, isLoggedIn]);

  // Auto-refetch when screen becomes focused
  useEffect(() => {
    if (isFocused && user) {
      console.log("📱 [FOCUS] Screen focused, checking if refetch needed...");
      // Check if query exists and is stale
      const queryState = queryClient.getQueryState(
        queryKeys.budgets.list(user.$id)
      );
      const isStale = queryState?.isStale || false;

      if (isStale) {
        console.log("📱 [FOCUS] Query is stale, triggering refetch...");
        refetch();
      } else {
        console.log("📱 [FOCUS] Query is fresh, no refetch needed");
      }
    }
  }, [isFocused, user]);

  // All state
  const [progress, setProgress] = useState(0);
  const [virtualBalance, setVirtualBalance] = useState(0);
  const [items, setItems] = useState([]);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    title: null,
    goal: null,
    goalTime: new Date(),
    started: new Date(),
    repeating: false,
    repeatingFrequency: null,
    color: null,
  });

  // Create modal
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [colorDropdownValue, setColorDropdownValue] = useState(null);
  const [colorDropDownItems, setColorDropDownItems] = useState([
    {
      label: "Red",
      value: "#ffadad",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#ffadad"} size={16} />
      ),
    },
    {
      label: "Orange",
      value: "#ffd6a5",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#ffd6a5"} size={16} />
      ),
    },
    {
      label: "Yellow",
      value: "#fdffb6",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#fdffb6"} size={16} />
      ),
    },
    {
      label: "Green",
      value: "#caffbf",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#caffbf"} size={16} />
      ),
    },
    {
      label: "Blue",
      value: "#a0c4ff",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#a0c4ff"} size={16} />
      ),
    },
    {
      label: "Purple",
      value: "#bdb2ff",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#bdb2ff"} size={16} />
      ),
    },
    {
      label: "Pink",
      value: "#ffc6ff",
      icon: () => (
        <MaterialCommunityIcons name="circle" color={"#ffc6ff"} size={16} />
      ),
    },
  ]);

  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);
  const [frequencyDropdownValue, setFrequencyDropdownValue] = useState(null);
  const [frequencyDropdownItems, setFrequencyDropdownItems] = useState([
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ]);

  const [dateTimePickerShown, setDateTimePickerShown] = useState(false);
  const dateTimeCompoenent = Platform.select({
    ios: () => (
      <RNDateTimePicker
        testID="dateTimePicker"
        value={budgetForm.goalTime}
        minimumDate={new Date()}
        mode="date"
        onChange={(e, selectedDate) => {
          if (e.type == "set") {
            const currentDate = selectedDate;
            setDateTimePickerShown(false);
            budgetForm.goalTime = currentDate;
          }
        }}
        textColor="gray"
        accentColor="orange"
      />
    ),
    android: () => (
      <>
        <TouchableOpacity
          onPress={() => setDateTimePickerShown(true)}
          className="flex-row gap-2"
          activeOpacity={0.8}
        >
          <Text className="text-gray-100 font-pregular text-lg bg-alt-100 rounded-md p-2">
            Select a Date
          </Text>
          <Text className="text-gray-100 font-pregular text-lg bg-alt-100 rounded-md p-2">
            {budgetForm.goalTime.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {dateTimePickerShown && (
          <RNDateTimePicker
            testID="dateTimePicker"
            value={budgetForm.goalTime}
            minimumDate={new Date()}
            mode="date"
            onChange={(e, selectedDate) => {
              const currentDate = selectedDate;
              setDateTimePickerShown(false);
              budgetForm.goalTime = currentDate;
            }}
          />
        )}
      </>
    ),
  });

  const [refreshing, setRefreshing] = useState(false);

  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocateAmount, setAllocateAmount] = useState(0);
  const [isAllocateMode, setIsAllocateMode] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const editDrawerModal = useRef(null);
  const [editDrawerData, setEditDrawerData] = useState(null);
  const [editModalSelectedId, setEditModalSelectedId] = useState(-1);
  const [deleteOptionChecked, setDeleteOptionChecked] = useState(false);

  const [setupComplete, setSetupComplete] = useState(false);
  console.log("Budget render: setupComplete =", setupComplete);

  // animation refs
  const selectBudgetAnimationRef = useRef(null);

  // Functions
  const checkBudgetSetup = async () => {
    const response = await getPreferences();
    // if cache key doesn't exist, call db and store value to cache
    if (response.budgetOnboardComplete === null) {
      setSetupComplete(false);
      response.budgetOnboardComplete = false;
      await updatePreferences(response);
    } else if (response.budgetOnboardComplete === true) {
      setSetupComplete(true);
    } else if (response.budgetOnboardComplete === false) {
      setSetupComplete(false);
    }
  };

  const onFirstRefresh = async () => {
    console.log("onFirstRefresh called");
    setRefreshing(true);

    try {
      const vBal = await getVirtualBalance(user);
      console.log("Virtual balance loaded:", vBal[0].balance);
      setVirtualBalance(vBal[0].balance);
    } catch (error) {
      console.error("Error loading virtual balance:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    console.log("🔄 [REFRESH] Manual refresh triggered");
    setRefreshing(true);

    try {
      console.log("🔄 [REFRESH] Calling refetch...");
      const result = await refetch();
      console.log("🔄 [REFRESH] Refetch completed:", {
        success: !!result.data,
        dataLength: result.data?.length || 0,
        isStale: result.isStale,
      });

      const freshBudgets = result.data;
      const vBal = await getVirtualBalance(user);

      const filteredItems = freshBudgets
        .filter((b) => b.progress < b.goal)
        .map((b) => ({
          id: b.$id,
          name: b.title,
          color: b.color,
          progress: b.progress,
          goal: b.goal,
          start: b.started,
          end: b.end,
          goalTime: b.goalTime,
        }));

      console.log("🔄 [REFRESH] Updating UI with filtered items:", {
        originalCount: freshBudgets?.length || 0,
        filteredCount: filteredItems.length,
      });

      setItems(filteredItems);
      setVirtualBalance(vBal[0].balance);
    } catch (error) {
      console.error("❌ [REFRESH] Error in onRefresh:", error);
    } finally {
      setRefreshing(false);
      console.log("🔄 [REFRESH] Manual refresh completed");
    }
  };

  const createBudget = async () => {
    if (!budgetForm.title || !budgetForm.goal || colorDropdownValue === null) {
      console.warn(budgetForm.title);
      console.warn(budgetForm.goal);
      console.warn(colorDropdownValue);

      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    const budgetData = {
      ...budgetForm,
      color: colorDropdownValue,
    };

    console.log("🎯 [UI] Creating budget with data:", {
      title: budgetData.title,
      goal: budgetData.goal,
      color: budgetData.color,
      userId: user?.$id,
    });

    // Use the mutation instead of direct API call
    createBudgetMutation.mutate(budgetData);
  };

  const allocateMode = async (id) => {
    console.log("allocateMode called with id:", id);
    if (items.length === 0) {
      Alert.alert(
        "Error",
        "You need to have at least one budget to allocate money to!"
      );
      setIsAllocateMode(false);
      // reset allocate amount saving myself from future bugs
      setAllocateAmount(0);
      return;
    }

    // get budget from db instead of relying on possibly outdated ui data
    console.log("Fetching budget from DB for allocation:", id);
    const budgetFromDb = await getBudgetByDocId(user, id);
    console.log("Budget from DB:", budgetFromDb);
    // update progress and goal accoring to databse
    const progress = budgetFromDb.progress;
    const goal = budgetFromDb.goal;

    let newProgress = progress + allocateAmount;
    let excessAllocated = false;
    let amountToSubtract = allocateAmount;
    try {
      if (progress + amountToSubtract > goal) {
        // excess money, give it back to the user
        excessAllocated = true;
        amountToSubtract = goal - progress;
        newProgress = goal;
      }

      const result = await updateBudget(id, newProgress);
      // edit amount to allocate
      const newVB = await updateVirtualBalance(
        virtualBalance - amountToSubtract
      );

      if (excessAllocated) {
        Alert.alert(
          "Your budget is overflowing with money!",
          "The extra amount allocated to your budget as been deposted back into your virtual balance."
        );
      }

      if (!result) {
        Alert.alert("Error", "Something went wrong");
      } else {
        // update budget contribution grpah
        const today = new Date().getDay();

        const budgetContributions = JSON.parse(
          await loadFromCache(CACHE_KEYS.budgetContributions)
        );
        const before = parseInt(budgetContributions.values[today]);
        const newAmount = before + amountToSubtract;
        budgetContributions.values[today] = newAmount.toString();
        const budgetContributionsString = JSON.stringify(budgetContributions);
        await storeToCache(
          CACHE_KEYS.budgetContributions,
          budgetContributionsString
        );
        eventBus.emit("newContribution", budgetContributionsString);
        // Alert.alert(
        //   "Success",
        //   "Be sure to refresh the page to see the changes!"
        // );

        setTimeout(() => {
          onRefresh();
        }, 1);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
      console.error(error);
    } finally {
      setIsAllocateMode(false);
      // reset allocate amount saving myself from future bugs
      setAllocateAmount(0);
    }
  };

  const editBudget = async (item) => {
    console.log("editBudget called with item:", item);
    setEditDrawerData(item);
    editDrawerModal.current?.present();
    // router.navigate({
    //   pathname: "/budgets/[budgetId]",
    //   params: { budgetId: id },
    // });
    // setEditModalOpen(true);
    // setEditModalSelectedId(id);
  };

  const addItem = (id, name, color, progress, goal, start, end) => {
    setItems([
      ...items,
      {
        id: id,
        name: name,
        color: color,
        progress: progress,
        goal: goal,
        start: start,
        end: end,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const setSetupCompleteTrue = () => {
    console.log("Setup completed, setting setupComplete to true");
    setSetupComplete(true);
  };

  const {
    data: budgets,
    refetch,
    error,
    isFetching,
    isStale,
  } = useQuery({
    queryKey: queryKeys.budgets.list(user?.$id),
    queryFn: async () => {
      console.log(
        "🔄 [QUERY] Fetching budgets with react-query for user",
        user?.$id
      );
      if (!user) {
        console.error("ERROR: user is null/undefined in budget query");
        throw new Error("User is not available");
      }
      const result = await getBudgets(user);
      console.log("🔄 [QUERY] Budgets fetched successfully:", {
        count: result?.length || 0,
        userId: user?.$id,
        timestamp: new Date().toISOString(),
      });
      return result;
    },
    enabled: !!user, // Only run query when user is available
    // Add more debugging info
    notifyOnChangeProps: ["data", "error", "isFetching", "isStale"],
  });

  // Create mutation for budget creation with automatic invalidation
  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData) => {
      console.log("🚀 [MUTATION] Creating budget with data:", {
        title: budgetData.title,
        goal: budgetData.goal,
        userId: user?.$id,
      });

      const result = await createBudgetDb(
        budgetData.title,
        budgetData.goal,
        budgetData.goalTime,
        user,
        budgetData.repeating,
        budgetData.repeatingFrequency,
        budgetData.color,
        budgetData.started
      );

      console.log("🚀 [MUTATION] Budget created successfully:", {
        budgetId: result?.$id,
        title: result?.title,
      });

      return result;
    },
    onSuccess: (newBudget) => {
      console.log("✅ [MUTATION] Budget created, invalidating queries...");
      // Invalidate budgets query to trigger automatic refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.list(user?.$id),
      });

      logEvent(events.CREATE_BUDGET);
      setIsBudgetOpen(false);

      console.log("✅ [MUTATION] Query invalidation triggered successfully");
    },
    onError: (error) => {
      console.error("❌ [MUTATION] Budget creation failed:", error);
      Alert.alert("Error", "Failed to create budget. Please try again.");
    },
  });

  // Extract mutation state for UI
  const { isPending: createBudgetLoading } = createBudgetMutation;

  // Log query state changes
  useEffect(() => {
    console.log("📊 [QUERY STATE] Budgets query state changed:", {
      hasData: !!budgets,
      dataLength: budgets?.length || 0,
      isFetching,
      isStale,
      error: error?.message || null,
      user: user?.$id,
      timestamp: new Date().toISOString(),
    });
  }, [budgets, error, user, isFetching, isStale]);

  // Log query state changes
  useEffect(() => {
    console.log("Query budgets state changed:", {
      data: budgets,
      error,
      user: user?.$id,
    });
  }, [budgets, error, user]);

  // startup functions
  useEffect(() => {
    // trigger function to check if setup has been completed
    checkBudgetSetup();

    // trigger reload function on start to populate budget data
    onFirstRefresh();
  }, []);

  useEffect(() => {
    onFirstRefresh();
  }, [setupComplete]);

  useEffect(() => {
    if (budgets) {
      console.log("Setting items from budgets", budgets.length);
      const newItems = budgets
        .filter((element) => element.progress < element.goal)
        .map((element) => ({
          id: element.$id,
          name: element.title,
          color: element.color,
          progress: element.progress,
          goal: element.goal,
          start: element.started,
          end: element.end,
          goalTime: element.goalTime,
        }));
      setItems(newItems);
    } else {
      console.log("Budgets is null/undefined, not setting items");
    }
  }, [budgets]);

  // Add error boundary check
  useEffect(() => {
    if (error) {
      console.error("Budget query error:", error);
      Alert.alert("Error", "Failed to load budgets. Please try again.");
    }
  }, [error]);

  // Early returns
  if (!isLoggedIn) {
    console.log("Early return: not logged in");
    return (
      <SafeAreaView
        className="bg-primary h-full px-5 pt-5"
        edges={["right", "top", "left"]}
      >
        <View className="flex-1 justify-center items-center gap-10">
          <View>
            <Text className="font-psemibold text-center text-2xl text-white">
              Log in to Mintable to create budgets.
            </Text>
            <Text className="font-pregular text-center text-rg text-gray-500 mt-5">
              We ask you to log in to securely save and sync your budget data
              across devices. We never share your information.
            </Text>
          </View>
          <View className="w-full">
            <CButton
              title={"Log In"}
              handlePress={() => router.push("/sign-in")}
            />
            <CButton
              title={"Try as Guest"}
              containerStyles={"mt-3 border-2 border-gray-600"}
              containerColor={"bg-primary"}
              textColor={"text-gray-600"}
              handlePress={() => router.push("/budgetDemo")}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!setupComplete) {
    console.log(
      "Early return: setup not complete, setupComplete =",
      setupComplete
    );
    return <BudgetSetup update={setSetupCompleteTrue} />;
  }

  console.log(
    "Rendering main budget screen with setupComplete:",
    setupComplete
  );
  return (
    <SafeAreaView
      className="bg-primary h-full  pt-5"
      edges={["right", "top", "left"]}
    >
      <ScrollView
        className="px-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              console.log("Manual refresh triggered");
              setRefreshing(true);
              setTimeout(() => {
                onRefresh();
              }, 100);
            }}
          />
        }
      >
        <View className="flex-row flex-1 items-center gap-2">
          <Image
            source={images.logoSmall}
            className="w-[60px] h-[30px]"
            resizeMode="contain"
          />
          <Text className="text-white font-psemibold text-2xl flex-1">
            Your Budgets
          </Text>
          <TouchableOpacity
            className="items-end mr-2"
            onPress={() => {
              console.log("Settings button pressed");
              router.push("settings");
            }}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              color={"gray"}
              size={28}
            />
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={() => router.push("history")}>
            <MaterialCommunityIcons name="history" size={32} color={"gray"} />
          </TouchableOpacity> */}
          {/* TODO: Will be implemented later on */}
        </View>
        <View className="border-2 border-b-4 border-alt-100 p-3 rounded-xl mt-3">
          <Text className="text-white font-psemibold">Virtual Balance</Text>
          {refreshing ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-5xl font-plight text-white pt-3">
              ${virtualBalance}
            </Text>
          )}
          <CButton
            title={"Allocate"}
            containerColor={"bg-alt-100"}
            textColor={"text-white"}
            textWeight={"font-pregular"}
            handlePress={() => {
              console.log("Allocate button pressed, items:", items.length);
              if (items.length === 0) {
                Alert.alert(
                  "Error",
                  "You need to have at least one budget to allocate money to!"
                );
              } else if (!isAllocateMode) {
                setAllocateModalOpen(true);
              }
            }}
          />
        </View>

        {/* Allocate Modal */}
        <Modal
          isOpen={allocateModalOpen}
          withInput
          onRequestClose={() => setAllocateModalOpen(false)}
        >
          <View className="flex align-center pb-10 w-full">
            <View className="items-center justify-center relative flex-row">
              <Text className="font-psemibold text-white text-xl text-center">
                Allocate Money
              </Text>
              <TouchableOpacity
                className="absolute right-4"
                onPress={() => {
                  console.log("Allocate modal close button pressed");
                  setAllocateModalOpen(false);
                  setIsAllocateMode(false);
                }}
              >
                <MaterialCommunityIcons name="close" size={22} color={"gray"} />
              </TouchableOpacity>
            </View>

            <View className="bg-primary w-full pt-4 px-4 rounded-xl ">
              <Text className="font-pregular text-md text-white">
                {`You have $${virtualBalance} to allocate.`}
              </Text>

              <FormField
                title={"Set amount to allocate"}
                handleChangeText={(e) => setAllocateAmount(parseInt(e))}
                otherStyles={"mt-1"}
                placeholder={"Set amount"}
                inputMode={"numeric"}
                otherChildren=<View className="items-center justify-center h-full mr-1">
                  <Text className="font-pregular text-secondary text-2xl">
                    $
                  </Text>
                </View>
              />

              {virtualBalance - allocateAmount < 0 && (
                <SmallError text={"Number cannot excede amount to allocate"} />
              )}

              {allocateAmount && (
                <Text className="font-pregular text-md text-white mt-1">
                  You will have $
                  {virtualBalance - allocateAmount < 0
                    ? 0
                    : virtualBalance - allocateAmount}{" "}
                  remaining.
                </Text>
              )}

              <CButton
                title={"Select Budget"}
                containerStyles={"mt-3"}
                handlePress={() => {
                  if (virtualBalance - allocateAmount >= 0) {
                    selectBudgetAnimationRef.current?.play();
                    setTimeout(() => {
                      setAllocateModalOpen(false);
                    }, 1000);
                    setIsAllocateMode(true);
                  }
                }}
              />
            </View>

            <LottieView
              source={require("../../assets/animations/coins_explode.json")}
              ref={selectBudgetAnimationRef}
              style={{
                width: 200,
                height: 200,
                position: "absolute",
                bottom: -60,
                alignSelf: "center",
                zIndex: 10,
                pointerEvents: "none",
              }}
              autoPlay={false}
              loop={false}
            />
          </View>
        </Modal>

        {isAllocateMode && (
          <Text className="mt-5 text-white font-psemibold">
            Click on a budget to allocate your money!
          </Text>
        )}

        <View className="mt-3">
          {refreshing ? (
            <ActivityIndicator />
          ) : (
            items.map((item) => (
              <BudgetContainer
                key={item.id}
                name={item.name}
                color={item.color}
                progress={item.progress}
                goal={item.goal}
                start={item.start}
                end={item.end}
                date={item.goalTime}
                //buttonDisabled={!isAllocateMode} NOT USED
                onPress={() => {
                  console.log(
                    "BudgetContainer onPress called for item:",
                    item.id
                  );
                  if (isAllocateMode) {
                    allocateMode(item.id);
                  } else {
                    editBudget(item);
                  }
                }}
              />
            ))
          )}
        </View>

        {/* <CButton
          title={"another one"}
          handlePress={() => addItem(<BudgetContainer progress={progress} />)}
        /> */}

        {/* <View className="flex-row mt-10">
          <CButton
            handlePress={() => setProgress(progress + 0.1)}
            containerStyles={"flex-1"}
            title={"add"}
          />
          <CButton
            handlePress={() => setProgress(progress - 0.1)}
            containerStyles={"flex-1"}
            title={"subtract"}
          />
        </View> */}

        <Text className="text-white text-center font-pregular text-lg mt-10">
          Create a new budget
        </Text>
        <IconButton
          iconName={"plus"}
          containerColor={"bg-alt-100"}
          containerStyles={"mt-3 mb-10"}
          handlePress={() => setIsBudgetOpen(true)}
        />

        {/* Create Budget Modal */}
        <Modal
          isOpen={isBudgetOpen}
          withInput
          onRequestClose={() => {
            console.log("Create budget modal closed");
            setIsBudgetOpen(false);
          }}
        >
          <View className="flex align-center pb-10 w-full">
            <View className="items-center justify-center relative flex-row">
              <Text className="font-psemibold text-white text-xl text-center">
                Create Budget
              </Text>
              <TouchableOpacity
                className="absolute right-4"
                onPress={() => setIsBudgetOpen(false)}
              >
                <MaterialCommunityIcons name="close" size={22} color={"gray"} />
              </TouchableOpacity>
            </View>

            <View className="bg-primary w-full pt-4 px-4 rounded-xl ">
              <FormField
                title="Title"
                handleChangeText={(e) =>
                  setBudgetForm({ ...budgetForm, title: e })
                }
                otherStyles={"my-1"}
                placeholder={"Give it a title"}
              />

              <FormField
                title="Goal"
                handleChangeText={(e) =>
                  setBudgetForm({ ...budgetForm, goal: parseInt(e) })
                }
                otherStyles={"my-1"}
                inputMode={"numeric"}
                placeholder={"What is the goal"}
                otherChildren=<View className="items-center justify-centerh-full mr-1">
                  <Text className="font-pregular text-secondary text-2xl">
                    $
                  </Text>
                </View>
              />

              <DropDown
                open={colorDropdownOpen}
                value={colorDropdownValue}
                items={colorDropDownItems}
                setOpen={setColorDropdownOpen}
                setValue={setColorDropdownValue}
                setItems={setColorDropDownItems}
                title={"Color"}
                placeholder={"Select a Color"}
                containerStyles={"my-1"}
                zIndex={10000}
              />

              <View className="flex-row w-full my-1 h-20">
                {/* <View className="items-center justify-center mx-2">
                <Text className="text-gray-100 font-pmedium text-base mb-1">
                  Repeating?
                </Text>
                <BouncyCheckbox
                  className="mt-1"
                  onPress={(checked) =>
                    setBudgetForm({ ...budgetForm, repeating: checked })
                  }
                />
              </View> */}
                <View className="flex-1 ml-2">
                  {budgetForm.repeating ? (
                    <DropDown
                      open={frequencyDropdownOpen}
                      value={frequencyDropdownValue}
                      items={frequencyDropdownItems}
                      setOpen={setFrequencyDropdownOpen}
                      setValue={setFrequencyDropdownValue}
                      setItems={setFrequencyDropdownItems}
                      placeholder={"How often?"}
                      title={"Frequency"}
                      zIndex={1999}
                    />
                  ) : (
                    <>
                      <Text className="text-base text-gray-100 font-pmedium">
                        Choose a due date
                      </Text>
                      <View className="flex-1 justify-center items-start">
                        {dateTimeCompoenent()}
                      </View>
                    </>
                  )}
                </View>
              </View>

              <CButton
                containerStyles={"mt-2"}
                title={"Create"}
                handlePress={createBudget}
                isWorking={createBudgetLoading}
              />
            </View>
          </View>
        </Modal>

        {/* Edit modal */}
        <Modal
          isOpen={editModalOpen}
          onRequestClose={() => {
            console.log("Edit modal closed");
            setEditModalOpen(false);
            setDeleteOptionChecked(false);
          }}
        >
          <View className="bg-primary w-full p-4 rounded-md">
            <View className="flex-row align-middle items-center">
              <Text className="flex-1 text-white font-psemibold text-xl px-1">
                Edit Budget
              </Text>
              <TouchableOpacity
                className="items-end"
                onPress={() => {
                  setEditModalOpen(false);
                  setDeleteOptionChecked(false);
                }}
              >
                <MaterialCommunityIcons name="close" color={"gray"} size={32} />
              </TouchableOpacity>
            </View>
            <View className="flex-row mt-1 items-center justify-evenly">
              <TouchableOpacity
                className="items-center justify-center border-2 rounded-md p-2 border-alt-100"
                activeOpacity={0.8}
              >
                <Image
                  source={images.pencil}
                  className="w-[50px] h-[50px]"
                  resizeMode="contain"
                />
                <Text className="text-white">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center justify-center border-2 rounded-md p-2 border-alt-100"
                activeOpacity={0.8}
                onPress={() => setDeleteOptionChecked(!deleteOptionChecked)}
              >
                <Image
                  source={images.trash}
                  className="w-[50px] h-[50px]"
                  resizeMode="contain"
                />
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
            </View>
            {deleteOptionChecked && (
              // TODO: could be animated here
              <View className="mt-2">
                <Text className="text-white font-psemibold mb-5 pt-2 mt-2 border-t-hairline">
                  Are you sure?
                </Text>
                <View className="flex-row justify-evenly gap-5">
                  <CButton
                    title={"Yes"}
                    containerColor={"flex-1 bg-red-500"}
                    handlePress={async () => {
                      // Get the budget to retrieve progress
                      const budget = await getBudgetByDocId(
                        user,
                        editModalSelectedId
                      );
                      const progress = budget.progress;
                      const response = await deleteBudget(editModalSelectedId);
                      if (response == true) {
                        // Get current virtual balance
                        const vBal = await getVirtualBalance(user);
                        // const newBalance = vBal[0].balance + progress;
                        // Update virtual balance
                        await updateVirtualBalance(virtualBalance + progress);
                        setEditModalOpen(false);
                        setDeleteOptionChecked(false);
                        Alert.alert(
                          "Success!",
                          "Successfully deleted your budget"
                        );
                        onRefresh();
                      } else {
                        Alert.alert("Error", "Something went wrong");
                      }
                    }}
                  />
                  <CButton
                    title={"No"}
                    containerColor={"flex-1 border-2 rounded-md border-alt-100"}
                    textColor={"text-gray-500"}
                    handlePress={() => {
                      setDeleteOptionChecked(false);
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </Modal>
      </ScrollView>
      <EditBudgetDrawerModal
        ref={editDrawerModal}
        budget={editDrawerData}
        requireRefresh={() => {
          console.log("EditBudgetDrawerModal calling onRefresh");
          onRefresh();
        }}
      />
    </SafeAreaView>
  );
};

export default Budget;
