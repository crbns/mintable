import { useSyncExternalStore } from "react";
import { isMoneyMoveBusy, subscribeMoneyMoveBusy } from "./moneyMoves";

// True while any money move is queued or running
export const useMoneyMoveBusy = () =>
  useSyncExternalStore(subscribeMoneyMoveBusy, isMoneyMoveBusy);
