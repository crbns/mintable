import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  Platform,
  StyleSheet,
  AccessibilityInfo,
  AppState,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BudgetContainer from "../../components/BudgetContainer";
import BudgetVirtualBalance from "../../components/BudgetVirtualBalance";
import CButton from "../../components/CButton";
import IconButton from "../../components/IconButton";
import PlatformIconButton from "../../components/PlatformIconButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import {
  createBudget as createBudgetDb,
  getBudgets,
  getPreferences,
  getVirtualBalance,
} from "../../lib/appwrite";
import images from "../../constants/images";
import BudgetSetup from "../../components/BudgetSetup";
import { loadFromCache, storeToCache, CACHE_KEYS } from "../../lib/cacheUtil";
import { getWeekNumber } from "../../lib/dateUtil";
import { BUDGET_CONTRIBUTIONS_JSON_SCHEMA_VERSION } from "../../constants/constants";
import eventBus from "../../lib/eventBus";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useIsFocused } from "@react-navigation/native";
import EditBudgetDrawerModal from "../../components/EditBudgetDrawerModal";
import AllocateModal from "../../components/AllocateModal";
import CreateBudgetModal from "../../components/CreateBudgetModal";
import UndoBanner from "../../components/UndoBanner";
import { events, logEvent } from "../../lib/appsflyer";
import { formatMoney, formatMonthYear } from "../../lib/format";
import {
  MoneyMoveError,
  allocateToGoal as moveToGoal,
  completeGoal as completeGoalMove,
  deleteGoalWithRefund,
  returnFromGoal,
} from "../../lib/moneyMoves";
import { addAchievedGoal, loadAchievedGoals } from "../../lib/achievedGoals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReadyGoalSheet from "../../components/ReadyGoalSheet";
import GoalActionsSheet from "../../components/GoalActionsSheet";
import CoachTip from "../../components/CoachTip";
import { useMoneyMoveBusy } from "../../lib/useMoneyMoveBusy";
import ContentLoader, { Rect } from "react-content-loader/native";

const GoalListSkeleton = () => {
  const reduceMotion = useReducedMotion();
  return (
  <ContentLoader
    accessibilityLabel="Loading goals"
    animate={!reduceMotion}
    speed={1.2}
    width="100%"
    height={210}
    backgroundColor="#203c56"
    foregroundColor="#2c4c6b"
  >
    {[0, 70, 140].map((y) => (
      <React.Fragment key={y}>
        <Rect x="0" y={y + 8} rx="6" ry="6" width="55%" height="20" />
        <Rect x="0" y={y + 38} rx="4" ry="4" width="100%" height="8" />
      </React.Fragment>
    ))}
  </ContentLoader>
  );
};

const SectionHeader = ({ title }) => (
  <Text
    className="text-white font-psemibold text-xl mt-8 mb-1"
    accessibilityRole="header"
  >
    {title}
  </Text>
);

// Lesson nudges, one per milestone. Each is dismissed for good once hidden.
const COACH_TIPS = {
  firstGoal: {
    message: "Your first goal is set. Adding even a little each week is how it fills.",
    lessonTitle: "Budget Basics",
    cta: "Try Budget Basics",
    href: "/takeQuiz?chapter=1&lessonId=1",
  },
  firstSave: {
    message: "Saving before you spend is called paying yourself first. See where it fits in a full budget.",
    lessonTitle: "The 50/20/30 Rule",
    cta: "Learn the 50/20/30 rule",
    href: "/takeQuiz?chapter=1&lessonId=2a",
  },
  firstWin: {
    message: "Goal done. Before you pick the next one, sort out what you need from what you want.",
    lessonTitle: "Needs vs. Wants",
    cta: "Try Needs vs. Wants",
    href: "/takeQuiz?chapter=1&lessonId=2b",
  },
};
const coachKey = (userId) => `coachTipsDismissed:${userId}`;
const ACHIEVED_VISIBLE = 5;

const toItem = (budget) => ({
  id: budget.$id,
  name: budget.title,
  color: budget.color,
  progress: budget.progress,
  goal: budget.goal,
  start: budget.started,
  end: budget.end,
  goalTime: budget.goalTime,
});

const activeItems = (budgets) =>
  budgets.filter((budget) => budget.progress < budget.goal).map(toItem);

const reachedItems = (budgets) =>
  budgets.filter((budget) => budget.progress >= budget.goal).map(toItem);

// Adds `delta` to a bar on the home contribution graph: today's for a new
// allocation, or the `at` ({ day, week }) it was recorded on for an undo.
// Returns where it landed, or null if there was nothing to change.
const recordContribution = async (delta, at = null) => {
  const currentWeek = getWeekNumber();
  // last week's bars are gone, so there's nothing left to take back
  if (at && at.week !== currentWeek) return null;
  const day = at ? at.day : new Date().getDay();

  const freshWeek = (last = "0") => ({
    version: BUDGET_CONTRIBUTIONS_JSON_SCHEMA_VERSION,
    values: Array(7).fill("0"),
    last,
    lastWeekNumber: currentWeek.toString(),
  });

  // cache is only seeded when the home graph mounts, so it may not exist yet;
  // a bad or outdated cache resets, the same as the graph does
  const cachedContributions = await loadFromCache(
    CACHE_KEYS.budgetContributions,
  );
  let budgetContributions = null;
  try {
    budgetContributions = cachedContributions
      ? JSON.parse(cachedContributions)
      : null;
  } catch {
    budgetContributions = null;
  }
  if (
    budgetContributions?.version !== BUDGET_CONTRIBUTIONS_JSON_SCHEMA_VERSION ||
    !Array.isArray(budgetContributions.values)
  ) {
    budgetContributions = freshWeek();
  }

  // roll a stale week over before writing, like the graph's updateOnNewWeek,
  // so a new week never starts with last week's bars
  const storedWeek = parseInt(budgetContributions.lastWeekNumber || "-1", 10);
  if (storedWeek !== currentWeek) {
    // an undo has nothing to subtract from a week it wasn't recorded in
    if (at) return null;
    const lastTotal = budgetContributions.values.reduce(
      (sum, val) => sum + (parseInt(val, 10) || 0),
      0,
    );
    budgetContributions = freshWeek(lastTotal.toString());
  }

  const before = parseInt(budgetContributions.values[day], 10) || 0;
  budgetContributions.values[day] = Math.max(before + delta, 0).toString();
  const budgetContributionsString = JSON.stringify(budgetContributions);
  await storeToCache(CACHE_KEYS.budgetContributions, budgetContributionsString);
  eventBus.emit("newContribution", budgetContributionsString);
  return { day, week: currentWeek };
};

// The graph is a local nicety; a cache failure must never read as a failed transfer
const recordContributionSafely = async (delta, at = null) => {
  try {
    return await recordContribution(delta, at);
  } catch (error) {
    console.error("Couldn't update the contribution graph:", error);
    return null;
  }
};

// Failure copy that matches what actually happened to the money
const alertMoneyMoveFailure = (error, unchangedTitle, unchangedMessage) => {
  console.error(error);
  if (error instanceof MoneyMoveError && error.outcome === "partial") {
    Alert.alert(
      "Something went wrong mid-transfer",
      "Pull down to refresh, then check this goal and your balance.",
    );
  } else {
    Alert.alert(unchangedTitle, unchangedMessage);
  }
};

const Budget = () => {
  const { user, isLoggedIn } = useGlobalContext();
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const reduceMotion = useReducedMotion();
  // true while any allocate/undo/delete is queued or running
  const moneyBusy = useMoneyMoveBusy();

  const [refreshing, setRefreshing] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [allocateTarget, setAllocateTarget] = useState({
    open: false,
    goalId: null,
  });
  const [isAllocating, setIsAllocating] = useState(false);
  const [lastAllocation, setLastAllocation] = useState(null);
  // "coins" after any allocation, "confetti" when it completes a goal
  const [celebration, setCelebration] = useState(null);

  const editDrawerModal = useRef(null);
  const [editDrawerData, setEditDrawerData] = useState(null);

  // full goal whose "bought it?" sheet is open
  const [readyGoal, setReadyGoal] = useState(null);
  // Android: goal whose overflow actions are open
  const [actionsGoal, setActionsGoal] = useState(null);
  // "I bought it" waits out the Undo window before anything is deleted
  const [pendingCompletion, setPendingCompletion] = useState(null);
  const pendingCompletionRef = useRef(null);
  pendingCompletionRef.current = pendingCompletion;
  const committedAtRef = useRef(new Set());

  const [achieved, setAchieved] = useState([]);
  const [dismissedTips, setDismissedTips] = useState(null);

  const {
    data: budgets,
    refetch,
    error,
  } = useQuery({
    queryKey: queryKeys.budgets.list(user?.$id),
    queryFn: async () => {
      if (!user) {
        throw new Error("User is not available");
      }
      return getBudgets(user);
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (
      lastAllocation &&
      budgets &&
      !budgets.some((budget) => budget.$id === lastAllocation.goalId)
    ) {
      setLastAllocation(null);
    }
  }, [budgets, lastAllocation]);

  const items = useMemo(() => (budgets ? activeItems(budgets) : []), [budgets]);
  const reached = useMemo(
    () =>
      budgets
        ? reachedItems(budgets).filter(
            (item) => item.id !== pendingCompletion?.item.id,
          )
        : [],
    [budgets, pendingCompletion],
  );

  useEffect(() => {
    if (!user?.$id) return;
    let cancelled = false;
    loadAchievedGoals(user.$id).then((list) => {
      if (!cancelled) setAchieved(list);
    });
    AsyncStorage.getItem(coachKey(user.$id))
      .then((raw) => {
        const parsed = raw ? JSON.parse(raw) : [];
        if (!cancelled) setDismissedTips(Array.isArray(parsed) ? parsed : []);
      })
      .catch(() => {
        if (!cancelled) setDismissedTips([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.$id]);

  // Auto-refetch when screen becomes focused
  useEffect(() => {
    if (isFocused && user) {
      const queryState = queryClient.getQueryState(
        queryKeys.budgets.list(user.$id),
      );
      if (queryState?.isStale) {
        refetch();
      }
    }
  }, [isFocused, user]);

  // Shared with the home tab's preferences query
  const {
    data: preferences,
    error: preferencesError,
    refetch: refetchPreferences,
  } = useQuery({
    queryKey: queryKeys.preferences.current(user?.$id),
    queryFn: getPreferences,
    enabled: isLoggedIn && !!user,
  });

  // "unknown" until prefs load, so a returning user never flashes through
  // onboarding, and a failed load offers a retry instead of onboarding
  const setupStatus = preferences
    ? preferences.budgetOnboardComplete === true
      ? "done"
      : "needed"
    : preferencesError
      ? "error"
      : "unknown";

  // Keyed by user, so a different account never sees the last balance
  const {
    data: balanceDoc,
    error: balanceError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: queryKeys.virtualBalance.current(user?.$id),
    queryFn: async () => {
      const docs = await getVirtualBalance(user);
      if (!docs?.[0]) throw new Error("Virtual balance not found");
      return docs[0];
    },
    enabled: !!user && setupStatus === "done",
  });
  // "loading" until the first fetch lands, so a failed load never reads as $0
  const balanceStatus = balanceDoc
    ? "ready"
    : balanceError
      ? "error"
      : "loading";
  const virtualBalance = balanceDoc?.balance ?? 0;

  // pull-to-refresh only; shows the spinner
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchBalance()]);
    } finally {
      setRefreshing(false);
    }
  };

  // after a money move: refetch goals and balance quietly, no spinner
  const refreshInBackground = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.list(user?.$id),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.virtualBalance.current(user?.$id),
      }),
    ]);

  const createBudgetMutation = useMutation({
    mutationFn: ({ title, goal, color, goalTime }) =>
      createBudgetDb(
        title,
        goal,
        goalTime,
        user,
        false,
        null,
        color,
        new Date(),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.budgets.list(user?.$id),
      });
      logEvent(events.CREATE_BUDGET);
      setIsCreateOpen(false);
    },
    onError: (error) => {
      console.error("Budget creation failed:", error);
      Alert.alert(
        "Couldn't create your goal",
        "Check your connection and try again. What you typed is still there.",
      );
    },
  });

  const allocateToGoal = async (goalId, requested) => {
    setIsAllocating(true);
    if (pendingCompletionRef.current) {
      commitCompletion(pendingCompletionRef.current);
    }
    try {
      // reads fresh values so a stale screen can't move more than exists,
      // and reverses the goal write if the balance write fails
      const { budget, balanceDoc, amount } = await moveToGoal(
        user,
        goalId,
        requested,
      );
      if (amount <= 0) {
        Alert.alert(
          "Nothing to add",
          balanceDoc.balance <= 0
            ? "Your balance is empty right now."
            : `${budget.title} is already full.`,
        );
        refreshInBackground();
        return;
      }

      // where the bar went, so an undo takes it back from the same day
      const contribution = await recordContributionSafely(amount);

      const completed = budget.progress + amount >= budget.goal;
      setAllocateTarget({ open: false, goalId: null });
      setLastAllocation({
        goalId,
        name: budget.title,
        amount,
        total: budget.goal,
        completed,
        contribution,
        at: Date.now(),
      });
      // celebrate only once the money has actually moved
      if (!reduceMotion) setCelebration(completed ? "confetti" : "coins");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      AccessibilityInfo.announceForAccessibility(
        completed
          ? `Goal reached. ${formatMoney(budget.goal)} saved for ${budget.title}. Undo available.`
          : `Added ${formatMoney(amount)} to ${budget.title}. Undo available.`,
      );
      refreshInBackground();
    } catch (error) {
      alertMoneyMoveFailure(
        error,
        "Couldn't add the money",
        "Nothing moved. Check your connection and try again.",
      );
    } finally {
      setIsAllocating(false);
    }
  };

  const undoAllocation = async (last = lastAllocation) => {
    if (!last) return;
    setLastAllocation(null);
    try {
      const { amount } = await returnFromGoal(user, last.goalId, last.amount);
      // skipped if the graph never got the bar, or its week has rolled over
      if (last.contribution) {
        await recordContributionSafely(-amount, last.contribution);
      }
      refreshInBackground();
    } catch (error) {
      if (error instanceof MoneyMoveError && error.outcome === "unchanged") {
        console.error(error);
        Alert.alert(
          "Couldn't undo",
          `The ${formatMoney(last.amount)} is still in ${last.name}.`,
          [
            { text: "Leave it", style: "cancel" },
            { text: "Try again", onPress: () => undoAllocation(last) },
          ],
        );
      } else {
        alertMoneyMoveFailure(
          error,
          "Couldn't undo",
          "Pull down to refresh, then check this goal and your balance.",
        );
      }
      refreshInBackground();
    }
  };

  // Runs once the Undo window closes: hands back any extra (if chosen), then
  // removes the goal and keeps a record of the win on this device
  const commitCompletion = async (pending) => {
    // blur, backgrounding, unmount and the banner can all fire for one window
    if (committedAtRef.current.has(pending.at)) return;
    committedAtRef.current.add(pending.at);
    if (pendingCompletionRef.current?.at === pending.at) {
      pendingCompletionRef.current = null;
    }
    setPendingCompletion((current) =>
      current?.at === pending.at ? null : current,
    );
    const { item, returnExtra } = pending;
    // queued before the first await, so it runs ahead of any move that
    // triggered this commit
    const move = completeGoalMove(user, item.id, { returnExtra });
    try {
      // keep it off the list while the delete is in flight, so it can't be
      // reopened and marked bought twice; the refetch restores it on failure.
      // An in-flight refetch is cancelled first, or its response would land
      // after the filter and bring the goal back.
      const listKey = queryKeys.budgets.list(user?.$id);
      await queryClient.cancelQueries({ queryKey: listKey });
      queryClient.setQueryData(listKey, (old) =>
        old?.filter((budget) => budget.$id !== item.id),
      );
      const { kept } = await move;
      const list = await addAchievedGoal(user.$id, {
        id: item.id,
        name: item.name,
        amount: kept,
        color: item.color,
        at: new Date().toISOString(),
      });
      setAchieved(list);
    } catch (error) {
      if (error instanceof MoneyMoveError && error.outcome === "partial") {
        alertMoneyMoveFailure(error);
      } else {
        console.error(error);
        Alert.alert(
          "Couldn't mark it done",
          `${item.name} is still on your list. Check your connection and try again.`,
        );
      }
    } finally {
      refreshInBackground();
    }
  };

  // latest version, so the cleanups below never run a stale closure
  const commitCompletionRef = useRef(commitCompletion);
  commitCompletionRef.current = commitCompletion;

  // A bought goal is committed once the user leaves: on blur, on backgrounding
  // (screen readers get no Undo timeout), and on unmount
  useEffect(() => {
    if (!isFocused && pendingCompletionRef.current) {
      commitCompletionRef.current(pendingCompletionRef.current);
    }
  }, [isFocused]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      // only a real backgrounding; iOS goes "inactive" for Control Center,
      // Notification Center and Face ID, and the user is still here
      if (state === "background" && pendingCompletionRef.current) {
        commitCompletionRef.current(pendingCompletionRef.current);
      }
    });
    return () => {
      subscription.remove();
      if (pendingCompletionRef.current) {
        commitCompletionRef.current(pendingCompletionRef.current);
      }
    };
  }, []);

  const markBought = (item, { returnExtra }) => {
    setReadyGoal(null);
    if (pendingCompletionRef.current) {
      commitCompletion(pendingCompletionRef.current);
    }
    setLastAllocation(null);
    setPendingCompletion({ item, returnExtra, at: Date.now() });
    if (!reduceMotion) setCelebration("confetti");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    AccessibilityInfo.announceForAccessibility(
      `Nice work. ${item.name} is done. Undo available.`,
    );
  };

  const undoCompletion = () => {
    const pending = pendingCompletionRef.current;
    // cleared now, not on the next render, and marked settled, so a commit
    // fired in the same frame (backgrounding, the banner timer) returns early
    pendingCompletionRef.current = null;
    if (pending) committedAtRef.current.add(pending.at);
    setPendingCompletion(null);
    if (pending) {
      AccessibilityInfo.announceForAccessibility(
        `${pending.item.name} is back under Ready to buy.`,
      );
    }
  };

  const deleteGoal = async (item) => {
    // its Undo would have nothing to take back from
    setLastAllocation((last) => (last?.goalId === item.id ? null : last));
    try {
      // refunds what the goal holds, then deletes it
      await deleteGoalWithRefund(user, item.id);
      AccessibilityInfo.announceForAccessibility(`${item.name} deleted.`);
    } catch (error) {
      alertMoneyMoveFailure(
        error,
        "Couldn't delete this goal",
        "Nothing changed. Check your connection and try again.",
      );
    } finally {
      refreshInBackground();
    }
  };

  const confirmDeleteGoal = (item) => {
    setActionsGoal(null);
    Alert.alert(
      `Delete ${item.name}?`,
      item.progress > 0
        ? `The ${formatMoney(item.progress)} saved in it goes back to your balance.`
        : "This can't be undone.",
      [
        { text: "Keep", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteGoal(item) },
      ],
    );
  };

  const openActions = (item) => setActionsGoal(item);

  // newest milestone wins: a finished goal, then money saved, then a first goal
  const coachTipId = !dismissedTips
    ? null
    : achieved.length > 0
      ? "firstWin"
      : items.some((item) => item.progress > 0)
        ? "firstSave"
        : items.length > 0
          ? "firstGoal"
          : null;
  const coachTip =
    coachTipId && !dismissedTips.includes(coachTipId)
      ? COACH_TIPS[coachTipId]
      : null;

  const dismissCoachTip = () => {
    const next = [...(dismissedTips ?? []), coachTipId];
    setDismissedTips(next);
    AsyncStorage.setItem(coachKey(user.$id), JSON.stringify(next)).catch(
      (error) => console.error("Couldn't save tip state:", error),
    );
  };

  const editBudget = (item) => {
    setEditDrawerData(item);
    editDrawerModal.current?.present();
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView
        className="bg-primary h-full px-5 pt-5"
        edges={["right", "top", "left"]}
      >
        <View className="flex-1 justify-center items-center gap-10">
          <View>
            <Text className="font-psemibold text-center text-2xl text-white">
              Log in to Mintable to start saving.
            </Text>
            <Text className="font-pregular text-center text-rg text-muted mt-5">
              We ask you to log in to securely save and sync your goals across
              devices. We never share your information.
            </Text>
          </View>
          <View className="w-full">
            <CButton
              title={"Log In"}
              handlePress={() => router.push("/sign-in")}
            />
            <CButton
              title={"Try as Guest"}
              containerStyles={"mt-3 border-2 border-muted"}
              containerColor={"bg-primary"}
              textColor={"text-muted"}
              handlePress={() => router.push("/budgetDemo")}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (setupStatus === "unknown") {
    return (
      <SafeAreaView
        className="bg-primary h-full px-5 pt-5"
        edges={["right", "top", "left"]}
      >
        <GoalListSkeleton />
      </SafeAreaView>
    );
  }

  if (setupStatus === "error") {
    return (
      <SafeAreaView
        className="bg-primary h-full px-5 pt-5"
        edges={["right", "top", "left"]}
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-white font-psemibold text-xl text-center">
            Couldn't load your goals
          </Text>
          <Text className="text-gray-100 font-pregular text-base text-center mt-2">
            Check your connection and try again.
          </Text>
          <CButton
            title={"Try again"}
            containerStyles={"mt-6 self-stretch"}
            handlePress={() => refetchPreferences()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (setupStatus === "needed") {
    return (
      <BudgetSetup
        update={() =>
          queryClient.setQueryData(
            queryKeys.preferences.current(user?.$id),
            (prev) => ({ ...prev, budgetOnboardComplete: true }),
          )
        }
      />
    );
  }

  return (
    <SafeAreaView
      className="bg-primary h-full  pt-5"
      edges={["right", "top", "left"]}
    >
      <ScrollView
        className="px-5"
        // keeps the last rows clear of the translucent iOS tab bar
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 96 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row flex-1 items-center gap-2">
          <Image
            source={images.logoSmall}
            className="w-[60px] h-[30px]"
            resizeMode="contain"
          />
          <Text
            className="text-white font-psemibold text-2xl flex-1"
            accessibilityRole="header"
          >
            Your Goals
          </Text>
          <PlatformIconButton
            icon="settings"
            accessibilityLabel="Settings"
            onPress={() => router.push("settings")}
          />
          {/* iOS puts the add action in the top bar; Android uses a FAB */}
          {Platform.OS === "ios" && (
            <PlatformIconButton
              icon="add"
              color="#ffaa5e"
              accessibilityLabel="New goal"
              onPress={() => setIsCreateOpen(true)}
            />
          )}
        </View>

        <BudgetVirtualBalance
          loading={balanceStatus === "loading"}
          error={balanceStatus === "error"}
          onRetry={() => refetchBalance()}
          virtualBalance={virtualBalance}
          refill={
            balanceDoc && {
              amount: balanceDoc.updateAmount,
              freq: balanceDoc.updateFreq,
            }
          }
          buttonTitle={"Add to a goal"}
          disabled={items.length === 0 || moneyBusy || virtualBalance <= 0}
          hint={
            balanceStatus === "ready" && virtualBalance <= 0 && items.length > 0
              ? "Nothing to add until your next refill."
              : null
          }
          onPress={() => setAllocateTarget({ open: true, goalId: null })}
        />

        {coachTip && (
          <CoachTip
            message={coachTip.message}
            lessonTitle={coachTip.lessonTitle}
            cta={coachTip.cta}
            onOpenLesson={() => router.push(coachTip.href)}
            onDismiss={dismissCoachTip}
          />
        )}

        <View>
          {error && !budgets ? (
            <View className="py-6 items-center">
              <Text className="text-white font-pregular text-base text-center">
                Couldn't load your goals.
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                accessibilityRole="button"
                className="min-h-[44px] justify-center px-4"
              >
                <Text className="text-secondary font-psemibold text-base">
                  Try again
                </Text>
              </TouchableOpacity>
            </View>
          ) : !budgets ? (
            <GoalListSkeleton />
          ) : items.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-white font-psemibold text-xl text-center">
                {reached.length > 0
                  ? "What's next?"
                  : "What are you saving for?"}
              </Text>
              <Text className="text-gray-100 font-pregular text-base text-center mt-2">
                {reached.length > 0
                  ? "Every goal you've set is reached. Pick a new one."
                  : "Set a goal, then add money to it whenever you can."}
              </Text>
              <CButton
                title={
                  reached.length > 0
                    ? "Start a new goal"
                    : "Create your first goal"
                }
                containerStyles={"mt-5 self-stretch"}
                handlePress={() => setIsCreateOpen(true)}
              />
            </View>
          ) : (
            <>
              <SectionHeader title="Saving for" />
              {items.map((item) => (
                <BudgetContainer
                  key={item.id}
                  name={item.name}
                  color={item.color}
                  progress={item.progress}
                  goal={item.goal}
                  date={item.goalTime}
                  onPress={() =>
                    setAllocateTarget({ open: true, goalId: item.id })
                  }
                  onEdit={() => editBudget(item)}
                  onDelete={() => confirmDeleteGoal(item)}
                  onMore={() => openActions(item)}
                />
              ))}
            </>
          )}
        </View>

        {reached.length > 0 && (
          <View>
            <SectionHeader title="Ready to buy" />
            {reached.map((item) => (
              <BudgetContainer
                key={item.id}
                name={item.name}
                color={item.color}
                progress={item.progress}
                goal={item.goal}
                completed
                onPress={() => setReadyGoal(item)}
                onEdit={() => editBudget(item)}
                onDelete={() => confirmDeleteGoal(item)}
                onMore={() => openActions(item)}
              />
            ))}
          </View>
        )}

        {achieved.length > 0 && (
          <View>
            <SectionHeader title="Achieved" />
            {achieved.slice(0, ACHIEVED_VISIBLE).map((entry) => (
              <View
                key={entry.id}
                accessible
                accessibilityLabel={`${entry.name}, ${formatMoney(
                  entry.amount,
                )}, ${formatMonthYear(entry.at)}`}
                className="flex-row items-center py-2"
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color={entry.color ?? "#ffaa5e"}
                />
                <Text
                  className="flex-1 text-gray-100 font-pregular text-base ml-3"
                  numberOfLines={1}
                >
                  {entry.name}
                </Text>
                <Text className="text-muted font-pregular text-sm ml-3">
                  {`${formatMoney(entry.amount)} · ${formatMonthYear(entry.at)}`}
                </Text>
              </View>
            ))}
            {achieved.length > ACHIEVED_VISIBLE && (
              <Text className="text-muted font-pregular text-sm mt-1">
                {`and ${achieved.length - ACHIEVED_VISIBLE} more`}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {celebration && (
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <LottieView
            source={
              celebration === "confetti"
                ? require("../../assets/animations/confetti.json")
                : require("../../assets/animations/coins_explode.json")
            }
            autoPlay
            loop={false}
            onAnimationFinish={() => setCelebration(null)}
            style={
              celebration === "confetti"
                ? StyleSheet.absoluteFill
                : { width: 220, height: 220, alignSelf: "center", marginTop: 80 }
            }
          />
        </View>
      )}

      {pendingCompletion ? (
        <UndoBanner
          key={pendingCompletion.at}
          message={`Nice work. ${pendingCompletion.item.name} is done.${
            pendingCompletion.returnExtra
              ? ` The extra ${formatMoney(
                  pendingCompletion.item.progress - pendingCompletion.item.goal,
                )} goes back to your balance.`
              : ""
          }`}
          onUndo={undoCompletion}
          onDismiss={() => commitCompletion(pendingCompletion)}
        />
      ) : lastAllocation && (
        <UndoBanner
          key={lastAllocation.at}
          message={
            lastAllocation.completed
              ? `Goal reached! ${formatMoney(lastAllocation.total)} saved for ${lastAllocation.name}. Tap it under Ready to buy once you've bought it.`
              : `Added ${formatMoney(lastAllocation.amount)} to ${lastAllocation.name}`
          }
          onUndo={() => undoAllocation()}
          disabled={moneyBusy}
          onDismiss={() => setLastAllocation(null)}
        />
      )}

      {Platform.OS === "android" && (
        <View className="absolute bottom-4 right-4">
          <IconButton
            iconName={"plus"}
            iconSize={28}
            containerColor={"bg-secondary"}
            containerStyles={"w-14 h-14 rounded-2xl"}
            style={{ elevation: 6 }}
            accessibilityLabel={"New goal"}
            handlePress={() => setIsCreateOpen(true)}
          />
        </View>
      )}

      <AllocateModal
        isOpen={allocateTarget.open}
        initialGoalId={allocateTarget.goalId}
        onClose={() => setAllocateTarget({ open: false, goalId: null })}
        virtualBalance={virtualBalance}
        items={items}
        onConfirm={allocateToGoal}
        onEditGoal={(item) => {
          setAllocateTarget({ open: false, goalId: null });
          editBudget(item);
        }}
        isWorking={isAllocating || moneyBusy}
      />

      <CreateBudgetModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(data) => createBudgetMutation.mutate(data)}
        isWorking={createBudgetMutation.isPending}
        usedColors={items.map((item) => item.color)}
      />

      <ReadyGoalSheet
        goal={readyGoal}
        onClose={() => setReadyGoal(null)}
        onBought={markBought}
        onRaiseTarget={(item) => {
          setReadyGoal(null);
          editBudget(item);
        }}
      />

      {Platform.OS === "android" && (
        <GoalActionsSheet
          goal={actionsGoal}
          onClose={() => setActionsGoal(null)}
          onEdit={(item) => {
            setActionsGoal(null);
            editBudget(item);
          }}
          onDelete={confirmDeleteGoal}
        />
      )}

      <EditBudgetDrawerModal
        ref={editDrawerModal}
        budget={editDrawerData}
        // the drawer confirms first, so this goes straight to the delete
        onDelete={deleteGoal}
        // cleared on close, so reopening the same goal re-reads it
        onDismiss={() => setEditDrawerData(null)}
      />
    </SafeAreaView>
  );
};

export default Budget;
