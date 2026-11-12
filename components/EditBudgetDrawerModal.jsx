import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import DrawerModal from "./DrawerModal";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DrawerFormField from "./DrawerFormField";
import CButton from "./CButton";
import ColorSwatches from "./ColorSwatches";
import TargetDateField from "./TargetDateField";
import SheetHeader from "./SheetHeader";
import { editBudget } from "../lib/appwrite";
import { useMoneyMoveBusy } from "../lib/useMoneyMoveBusy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { useGlobalContext } from "../context/GlobalProvider";
import ConfirmDrawerModal from "./ConfirmDrawerModal";
import { formatMoney } from "../lib/format";

// `onDelete(budget)` hands the delete to the screen, which owns the refund,
// the failure alerts and clearing any Undo that points at this goal
const EditBudgetDrawerModal = forwardRef(
  ({ onDismiss, onDelete, budget }, ref) => {
    const { user } = useGlobalContext();
    const queryClient = useQueryClient();
    const moneyBusy = useMoneyMoveBusy();
    const insets = useSafeAreaInsets();

    const originalFormRef = useRef(null);
    const confirmFormRef = useRef(null);
    const [changeDetected, setChangeDetected] = useState(false);

    const [budgetForm, setBudgetForm] = useState({
      title: null,
      goal: null,
      goalTime: null,
      repeating: false,
      color: null,
    });
    const [budgetId, setBudgetId] = useState(null);

    const isFormEqual = (a, b) => {
      if (!a || !b) return false;
      return (
        a.title === b.title &&
        a.goal === b.goal &&
        a.repeating === b.repeating &&
        a.color === b.color &&
        a.goalTime?.toISOString() === b.goalTime?.toISOString()
      );
    };

    const editBudgetMutation = useMutation({
      mutationFn: async (budgetData) => editBudget(budgetId, budgetData),
      onSuccess: () => {
        // an edit never touches the balance, so the goal list is all that
        // needs refetching
        queryClient.invalidateQueries({
          queryKey: queryKeys.budgets.all,
        });
        ref.current?.dismiss();
      },
      onError: (error) => {
        console.error("[MUTATION] Failed to edit budget:", error);
        Alert.alert(
          "Couldn't save your changes",
          "Check your connection and try again.",
        );
      },
    });

    const saveChanges = () => {
      editBudgetMutation.mutate({
        title: budgetForm.title.trim(),
        goal: budgetForm.goal,
        goalTime: budgetForm.goalTime,
        repeating: budgetForm.repeating,
        color: budgetForm.color,
        started: budgetForm.started,
        accountId: user.accountId,
      });
    };

    useEffect(() => {
      if (budget) {
        const initialForm = {
          title: budget.name,
          goal: budget.goal,
          // the target date is optional; keep null instead of 1970
          goalTime: budget.goalTime ? new Date(budget.goalTime) : null,
          // budget.jsx maps the db `started` field to `start`
          started: budget.start ? new Date(budget.start) : new Date(),
          repeating: false,
          color: budget.color,
        };
        setBudgetForm(initialForm);
        setBudgetId(budget.id);
        originalFormRef.current = initialForm;
      }
    }, [budget]);

    useEffect(() => {
      const hasChanged = !isFormEqual(budgetForm, originalFormRef.current);
      setChangeDetected(hasChanged);
    }, [budgetForm]);

    // a target below what's already saved would strand the difference
    const saved = budget?.progress ?? 0;
    const goalBelowSaved = budgetForm.goal > 0 && budgetForm.goal < saved;
    const formValid =
      (budgetForm.title ?? "").trim().length > 0 &&
      budgetForm.goal > 0 &&
      !goalBelowSaved;
    const canSave =
      changeDetected && formValid && !editBudgetMutation.isPending;

    const confirmDelete = () => {
      const target = budget;
      ref.current?.dismiss();
      if (target) onDelete?.(target);
    };

    // closing without saving throws the edits away, so reopening the same
    // goal starts from what's saved
    const handleDismiss = () => {
      if (originalFormRef.current) {
        setBudgetForm(originalFormRef.current);
      }
      onDismiss?.();
    };

    return (
      // opened as a handoff from Allocate / ReadyGoal / GoalActions, so
      // `replace` dismisses that sheet instead of restoring it after Edit
      <DrawerModal
        ref={ref}
        withInput
        stackBehavior="replace"
        onDismiss={handleDismiss}
        backgroundColor="#0d2b45"
      >
        {/* sizes to the form and scrolls on short screens so Save and
            Delete stay reachable */}
        <BottomSheetScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-3">
            <SheetHeader
              title="Edit goal"
              onClose={() => ref.current?.dismiss()}
            />
          </View>

          <View className="bg-primary w-full pt-4 px-4 rounded-xl ">
            <DrawerFormField
              title="Name"
              handleChangeText={(e) =>
                setBudgetForm((prev) => ({ ...prev, title: e }))
              }
              placeholder={"New headphones"}
              initialValue={budgetForm.title}
              otherStyles={"mt-5"}
            />

            <DrawerFormField
              title="Goal amount"
              handleChangeText={(e) => {
                // digits only, like Create: a pasted "1,000" is 1000, not 1
                const digits = e.replace(/[^0-9]/g, "");
                setBudgetForm((prev) => ({
                  ...prev,
                  goal: digits ? parseInt(digits, 10) : NaN,
                }));
              }}
              otherStyles={"mt-5"}
              inputMode={"numeric"}
              placeholder={"0"}
              // controlled: the field always shows the cleaned number that
              // will be saved, even when stripping a "," leaves it unchanged
              value={
                Number.isFinite(budgetForm.goal)
                  ? budgetForm.goal.toString()
                  : ""
              }
              otherChildren={
                <View className="items-center justify-center h-full mr-1">
                  <Text className="font-pregular text-secondary text-2xl">
                    $
                  </Text>
                </View>
              }
            />
            <Text
              className={`font-pregular text-sm mx-2 mt-2 mb-5 ${
                goalBelowSaved ? "text-red-300" : "text-muted"
              }`}
              accessibilityLiveRegion="polite"
            >
              {goalBelowSaved
                ? `You've already saved ${formatMoney(saved)}, so the target can't be lower.`
                : saved > 0
                  ? `${formatMoney(saved)} saved so far.`
                  : " "}
            </Text>

            <ColorSwatches
              value={budgetForm.color}
              onChange={(color) =>
                setBudgetForm((prev) => ({ ...prev, color }))
              }
            />

            <TargetDateField
              value={budgetForm.goalTime}
              onChange={(goalTime) =>
                setBudgetForm((prev) => ({ ...prev, goalTime }))
              }
              containerStyles={"mt-4"}
            />

            <View className="mt-5 pt-5 border-t-hairline">
              <CButton
                title={"Save"}
                containerColor={"flex-1 bg-secondary"}
                textColor={"text-primary"}
                disabledd={!canSave}
                isWorking={editBudgetMutation.isPending}
                handlePress={() => saveChanges()}
              />
              {/* destructive action lives at the bottom, away from Close */}
              <TouchableOpacity
                onPress={() => confirmFormRef.current?.present()}
                disabled={moneyBusy}
                accessibilityRole="button"
                accessibilityState={{ disabled: moneyBusy }}
                className="mt-3 min-h-[48px] items-center justify-center"
              >
                <Text className="text-red-400 font-pmedium text-base">
                  Delete goal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <ConfirmDrawerModal
            ref={confirmFormRef}
            destructive
            headerText={`Delete ${budget?.name ?? "this goal"}?`}
            description={
              budget?.progress > 0
                ? `The ${formatMoney(budget.progress)} saved in it goes back to your balance.`
                : "This can't be undone."
            }
            confirmText="Delete"
            cancelText="Keep"
            onConfirm={confirmDelete}
          />
        </BottomSheetScrollView>
      </DrawerModal>
    );
  },
);

export default EditBudgetDrawerModal;
