import {
  deleteBudget,
  getBudgetByDocId,
  getVirtualBalance,
  getVirtualBalanceByDocId,
  setVirtualBalanceAmount,
  updateBudget,
} from "./appwrite";

// Every money move touches two documents (a goal and the virtual balance).
// Appwrite has no client-side transactions, so each move runs its writes in
// order and, if one fails, reverses the ones that already landed.
// Not crash-safe: if the app is killed between writes nothing reverses it.
//
// A failed request doesn't always prove the write didn't land. Only an
// Appwrite rejection (an HTTP status >= 400 the server sent back) is treated
// as definitely not landed; then the earlier steps are reversed and the move
// reports "unchanged". Any other failure (network drop, timeout) re-reads the
// doc: if the write is there the move carries on, and if it isn't the server
// may still commit it, so nothing is reversed and the move reports "partial".
//
// Writes set absolute values, so two moves running at once could overwrite
// each other. Every move therefore goes through one queue and runs alone,
// reading fresh values only after the previous move has finished.

let queueTail = Promise.resolve();
let pendingMoves = 0;
const busyListeners = new Set();

const notifyBusy = () => {
  const busy = pendingMoves > 0;
  busyListeners.forEach((listener) => listener(busy));
};

export const isMoneyMoveBusy = () => pendingMoves > 0;

export const subscribeMoneyMoveBusy = (listener) => {
  busyListeners.add(listener);
  return () => busyListeners.delete(listener);
};

const serialized =
  (move) =>
  (...args) => {
    pendingMoves += 1;
    notifyBusy();
    const run = queueTail.then(() => move(...args));
    // a failed move must not block the ones queued behind it
    queueTail = run.catch(() => {});
    return run.finally(() => {
      pendingMoves -= 1;
      notifyBusy();
    });
  };

export class MoneyMoveError extends Error {
  // outcome: "unchanged" (nothing landed, or everything was reversed)
  //          "partial"   (a write may have landed and couldn't be reversed
  //                       or confirmed; the user should check their balances)
  constructor(outcome, cause) {
    super(`Money move failed (${outcome}): ${cause?.message ?? cause}`);
    this.outcome = outcome;
    this.cause = cause;
  }
}

// The server answered and refused the write, so it can't land later
const isServerRejection = (error) =>
  typeof error?.code === "number" && error.code >= 400;

// Each step is { apply, revert, landed }. `landed` re-reads the doc and
// resolves true if apply's write is on the server, false if it isn't (yet).
const runWithRollback = async (steps) => {
  const applied = [];
  for (const step of steps) {
    try {
      await step.apply();
      applied.push(step);
    } catch (error) {
      if (!isServerRejection(error)) {
        // the request failed in transit, so the write may have landed
        let landed;
        try {
          if (!step.landed) throw new Error("No way to check this write");
          landed = await step.landed();
        } catch (checkError) {
          console.error("Money move check failed:", checkError);
          throw new MoneyMoveError("partial", error);
        }
        if (landed) {
          applied.push(step);
          continue;
        }
        // the server may still be processing it, so reversing the earlier
        // steps now could leave the books off once it commits
        throw new MoneyMoveError("partial", error);
      }

      for (const done of applied.reverse()) {
        try {
          await done.revert();
        } catch (revertError) {
          console.error("Money move rollback failed:", revertError);
          throw new MoneyMoveError("partial", error);
        }
      }
      throw new MoneyMoveError("unchanged", error);
    }
  }
};

// Writes only `balance`, to the exact doc that was read
const setBalance = (balanceDoc, amount) =>
  setVirtualBalanceAmount(balanceDoc.$id, amount);

const goalProgressIs = (user, goalId, progress) => async () =>
  (await getBudgetByDocId(user, goalId)).progress === progress;

const balanceIs = (balanceDoc, balance) => async () =>
  (await getVirtualBalanceByDocId(balanceDoc.$id)).balance === balance;

// A 404 means the delete landed; any other error leaves the state unknown
const goalIsGone = (user, goalId) => async () => {
  try {
    await getBudgetByDocId(user, goalId);
    return false;
  } catch (error) {
    if (error?.code === 404) return true;
    throw error;
  }
};

// Reads fresh values for a goal and the balance; failures here change nothing
const readState = async (user, goalId) => {
  try {
    const [budget, balanceDocs] = await Promise.all([
      getBudgetByDocId(user, goalId),
      getVirtualBalance(user, { throwOnError: true }),
    ]);
    if (!balanceDocs?.[0]) throw new Error("Virtual balance not found");
    return { budget, balanceDoc: balanceDocs[0] };
  } catch (error) {
    throw new MoneyMoveError("unchanged", error);
  }
};

// Moves up to `requested` from the balance into a goal, clamped to what the
// balance holds and what the goal still needs. Returns amount 0 if neither allows it.
export const allocateToGoal = serialized(async (user, goalId, requested) => {
  const { budget, balanceDoc } = await readState(user, goalId);
  const amount = Math.min(
    requested,
    budget.goal - budget.progress,
    balanceDoc.balance,
  );
  if (amount <= 0) return { budget, balanceDoc, amount: 0 };

  await runWithRollback([
    {
      apply: () => updateBudget(goalId, budget.progress + amount),
      revert: () => updateBudget(goalId, budget.progress),
      landed: goalProgressIs(user, goalId, budget.progress + amount),
    },
    {
      apply: () => setBalance(balanceDoc, balanceDoc.balance - amount),
      revert: () => setBalance(balanceDoc, balanceDoc.balance),
      landed: balanceIs(balanceDoc, balanceDoc.balance - amount),
    },
  ]);
  return { budget, balanceDoc, amount };
});

// Reverses an allocation. Takes back at most what the goal still holds and
// credits exactly that amount, so money is never created or lost.
export const returnFromGoal = serialized(async (user, goalId, amount) => {
  const { budget, balanceDoc } = await readState(user, goalId);
  const taken = Math.min(amount, budget.progress);
  if (taken <= 0) return { budget, amount: 0 };

  await runWithRollback([
    {
      apply: () => updateBudget(goalId, budget.progress - taken),
      revert: () => updateBudget(goalId, budget.progress),
      landed: goalProgressIs(user, goalId, budget.progress - taken),
    },
    {
      apply: () => setBalance(balanceDoc, balanceDoc.balance + taken),
      revert: () => setBalance(balanceDoc, balanceDoc.balance),
      landed: balanceIs(balanceDoc, balanceDoc.balance + taken),
    },
  ]);
  return { budget, amount: taken };
});

// Deletes a goal and refunds what it held. The delete runs last because it is
// the one write that cannot be reversed.
export const deleteGoalWithRefund = serialized(async (user, goalId) => {
  const { budget, balanceDoc } = await readState(user, goalId);
  const refund = budget.progress || 0;

  await runWithRollback([
    ...(refund > 0
      ? [
          {
            apply: () => setBalance(balanceDoc, balanceDoc.balance + refund),
            revert: () => setBalance(balanceDoc, balanceDoc.balance),
            landed: balanceIs(balanceDoc, balanceDoc.balance + refund),
          },
        ]
      : []),
    {
      apply: () => deleteBudget(goalId),
      revert: async () => {},
      landed: goalIsGone(user, goalId),
    },
  ]);
  return { budget, refund };
});

// "I bought it": removes a full goal; the money in it counts as spent. With
// returnExtra, anything saved past the target goes back to the balance first.
// Reads fresh values and runs as one queued move, so the extra is never
// credited twice. The delete runs last because it cannot be reversed.
export const completeGoal = serialized(
  async (user, goalId, { returnExtra = false } = {}) => {
    const { budget, balanceDoc } = await readState(user, goalId);
    const returned = returnExtra
      ? Math.max((budget.progress || 0) - budget.goal, 0)
      : 0;

    await runWithRollback([
      ...(returned > 0
        ? [
            {
              apply: () => setBalance(balanceDoc, balanceDoc.balance + returned),
              revert: () => setBalance(balanceDoc, balanceDoc.balance),
              landed: balanceIs(balanceDoc, balanceDoc.balance + returned),
            },
          ]
        : []),
      {
        apply: () => deleteBudget(goalId),
        revert: async () => {},
        landed: goalIsGone(user, goalId),
      },
    ]);
    return { budget, returned, kept: (budget.progress || 0) - returned };
  },
);
