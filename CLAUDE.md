# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Delegation: use Orca orchestration

Delegate multi-agent work (reviews, parallel fixes, verification passes) through **Orca orchestration**, not the built-in Agent/subagent tool. Load the orchestration skill and its guide (`orca skills get orchestration`) before running commands, then follow the supervised loop: `run-create` → `worker-start --spec ... --worktree current` → `check --wait` → validate each `worker_done` → `worker-release`.

- Give each worker a self-contained spec with disjoint file ownership. Reviewers are read-only and write reports to the scratchpad.
- Claude workers can take more than 60s to start because of SessionStart hooks; pass `--timeout-ms 180000` to `worker-start`.
- Keep verification separate from authoring: dispatch a separate reviewer worker after fix workers settle.

## Commands

```bash
# Start development server
yarn start

# Run on specific platform
yarn ios
yarn android
yarn web

# Build with EAS
eas build --profile development       # Dev build on device
eas build --profile simulator         # Dev build on iOS simulator
eas build --profile preview           # Internal distribution build
eas build --profile production        # Production build (auto-increments version)
```

There is no test suite configured — no Jest, no testing libraries in `package.json`.

## Architecture Overview

**Mintable** is a React Native / Expo personal finance app with budgeting and financial literacy features. It uses Expo Router for file-based navigation and Appwrite as its BaaS.

### Navigation (Expo Router file-based)

```
app/
├── index.jsx           # Entry point / auth redirect
├── (auth)/             # Sign-in, sign-up
├── (tabs)/             # Bottom tab navigator: home, budget, learn
├── (quiz)/             # Quiz flow (takeQuiz.jsx)
├── (settings)/         # Settings screens
├── (history)/          # Budget history (stub, not linked from UI)
└── (demo)/             # Budget demo mode (guest, local state only)
```

`(tabs)/_layout.jsx` uses `expo-router/unstable-native-tabs`; `(tabs)/__layout.jsx` is the old JS-tabs layout, kept but unused.

### State Management

Two-tier system:
- **`context/GlobalProvider.js`** — global auth state (`user`, `isLoggedIn`, `isLoading`). Accessed via `useGlobalContext()`.
- **TanStack Query (`@tanstack/react-query`)** — all server state. Query client is configured in `lib/queryClient.js` with 5-minute stale time and app-focus/network-aware refetching.

### Backend: Appwrite

Most Appwrite interactions live in `lib/appwrite.js`; Google OAuth is in `services/auth.js` (+ `services/userService.ts`). Collections:
- `users` — user profile (`accountId`, `email`, `username`, `virtualBalanceId`)
- `lessons` — quiz questions (`chapter`, `lessonId`, `question_text`, `answers[4]`, `correct_answer_index`)
- `budgets` — savings goals (`title`, `goal`, `progress`, `goalTime`, `started`, `color`, `accountId`); per-user doc permissions
- `virtualBalance` — simulated balance (`balance`, `updateFreq`, `updateAmount`)

User preferences (`budgetOnboardComplete`, `startAmount`) are Appwrite **account prefs** (`account.getPrefs/updatePrefs`), not a collection. Account deletion and Apple sign-in go through Appwrite Functions (IDs hardcoded in `lib/appwrite.js`).

Config constants (collection IDs, database ID) are in `appwriteConfig` at the top of `lib/appwrite.js`. The `EXPO_PUBLIC_APPWRITE_ENDPOINT` env var must be set.

### Local-only data

- Weekly budget-contribution graph data lives in SecureStore (`CACHE_KEYS.budgetContributions` in `lib/cacheUtil.js`), not Appwrite. Schema is versioned by `BUDGET_CONTRIBUTIONS_JSON_SCHEMA_VERSION`; resets each week. `lib/eventBus.js` (`newContribution`) pushes updates from the budget tab to the home graph.
- Review-prompt counters live in AsyncStorage (`lib/useReviewPrompter.ts`).

### Styling

NativeWind v4 (Tailwind CSS for React Native). Custom theme colors:
- `primary` → `#0d2b45` (dark navy, main background)
- `secondary` / `secondary-100` → orange tones
- `alt-100`, `alt-200` → slightly lighter navies for cards

Custom fonts: Poppins variants accessed via `font-pthin`, `font-pregular`, `font-psemibold`, etc.

### Query Keys

All TanStack Query keys are centralized in `lib/queryKeys.js`. Always use these rather than inline strings to avoid cache invalidation bugs.

### Learn / Quiz Feature

- On `master`, lessons are hardcoded `RoundLessonContainer` elements in `app/(tabs)/learn.jsx`, linking to `/takeQuiz?chapter=…&lessonId=…`.
- Quiz questions are fetched from Appwrite's `lessons` collection by `chapter` + `lessonId`. Scores are shown but **not persisted**.
- The `reworked-learn-page` / `budget-ui-rework` branches add XP tracking (`learningProgress`, `lessonScores` collections, `updateLessonProgress()`, `LESSONS_DATA`, `(stats)/` route). None of that exists on `master` yet.

### Key Component Patterns

- **`CButton`** — primary button component (`isWorking` shows a spinner; note the prop is spelled `disabledd`)
- **`Modal`** — prop-driven (`isOpen`) wrapper around `@gorhom/bottom-sheet`'s `BottomSheetModal`
- **`DrawerModal`** — ref-driven (`ref.current.present()/dismiss()`) bottom sheet; used by `EditBudgetDrawerModal`, `ConfirmDrawerModal`
- **`DropDown`** — picker that opens its own stacked `BottomSheetModal`
- **`FormField` / `DrawerFormField` / `BottomSheetFormField`** — text inputs for screens / drawers (local state) / bottom sheets (keyboard tracking via `animatedKeyboardState`)
- Lottie is used directly via `LottieView` (e.g. `AllocateModal` coin animation)

### App Variants

Three variants controlled by `APP_VARIANT` env var: `development`, `preview`, production (default). Debug mode via `EXPO_PUBLIC_DEBUG_MODE=true`.

### Provider Nesting Order

`QueryClientProvider` → `SafeAreaProvider` → `GestureHandlerRootView` → `GlobalProvider` → `BottomSheetModalProvider` → `NetworkProvider` → `ForceUpdateGate`
