# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

One product on iOS and Android, each following its own OS's native design language: iOS uses Liquid Glass where available; Android uses Material (Material 3 / Material You). Native chrome and affordances (tabs, sheets, pickers, sign-in buttons) should feel at home on each OS rather than share one cross-platform skin.

## Users

Beginner budgeters of any age: people who have never kept a budget, or tried and bounced off heavier tools. Teens with allowance or part-time income are a large, vocal segment in user feedback, but they are not the exclusive audience.

Typical situation: someone with modest, often irregular income (allowance, part-time job, weekly or biweekly paychecks, gig money) who wants to save toward specific things and learn how budgeting works without a spreadsheet.

## Product Purpose

Mintable helps beginners take control of their money while learning how budgeting works. Users set savings goals, allocate money from their balance into them, watch progress over time, and take short lessons and quizzes on budgeting fundamentals.

Success means a beginner builds a real saving habit: they keep allocating to goals week after week and understand why, not just that they tapped a button.

## Positioning

- **Learn while doing.** Lessons and quizzes sit beside the user's own budgeting, not in a separate course.
- **Goal-first saving.** Budgets are savings goals you fill up (title, target, progress, color), not expense categories to police.
- **Beginner simplicity.** Deliberately far simpler than full-featured trackers; no spreadsheet energy.

## Operating Context

- Mobile, portrait, used in short sessions: check balance, allocate to a goal, glance at this week's contributions, take a lesson.
- Balance today is a **virtual balance** that refills on a schedule (`updateFreq`, `updateAmount`) set during onboarding and editable in settings. Users allocate from it into goals.
- Guests can try a local-only budget demo before signing up.
- Accounts via email/password, Google, or Sign in with Apple.

## Capabilities and Constraints

**Shipped (v1.2.0):**
- Home: virtual balance, weekly budget-contribution graph (stored on-device, resets weekly), change from last week.
- Budget tab: create/edit/delete savings goals with goal amount, due date, color; allocate money into them (coin animation, confetti on completion).
- Learn tab: Chapter 1 lessons (budgeting basics, the 50/30/20 rule, needs vs wants, budgeting quiz). Questions come from Appwrite; scores are shown but not persisted.
- Settings: name, email, password, update amount, update frequency, bug report, account deletion.
- Offline banner, forced-update gate, in-app review prompts.

**Stack:** Expo / React Native with Expo Router, Appwrite backend (BaaS + Functions), NativeWind styling. No test suite.

**Committed direction (not yet built):**
- **Virtual now, real later.** The simulated balance is the starting point; the product is moving toward tracking the user's real money.
- Income flexibility: weekly and biweekly update frequencies; manual income entry for irregular earnings logged whenever they happen; amounts that can vary per pay period instead of one fixed estimate.
- XP / lesson-progress tracking and a stats route exist on unmerged branches (`reworked-learn-page`, `budget-ui-rework`).

**Open decisions:**
- Whether and when to offer bank-account connection (requested in feedback).
- Whether budget due dates should stay required (feedback: "don't make people set due dates for budgets").
- First-run tutorial / onboarding beyond the current balance setup (repeatedly requested).
- More lesson chapters ("More lessons coming soon!").

## Brand Commitments

- **Name:** Mintable. Made by Isaac Robinson (solo developer).
- **Voice:** encouraging coach. Warm, celebrates small wins, guides gently. Never condescending: users explicitly asked not to be treated as if they have no idea how to budget, so encouragement assumes competence and avoids lecturing.
- **Existing assets:** app icon, adaptive icon, splash icons (light/dark), logo marks in `assets/images/` (`logo.png`, `logo-small.png`, `logo-horizontal.png`), onboarding illustrations (`onboard-1.png`, `onboard-2.png`), Lottie animations (`assets/animations/coins_explode.json`, `confetti.json`).
- **Existing taglines:** "Revolutionize the way you budget"; "Your all-in-one app to take control of your money while learning."

## Evidence on Hand

- `Mintable Feedback Form.csv`: 16 real in-app survey responses (Oct 2025 to Oct 2026). Satisfaction and recommend scores mostly 1–4 of 5. Dominant themes: weekly/biweekly pay, irregular/manual income, need for a tutorial, teen-friendliness without condescension, a load failure when changing balance, a bank-link request.
- `questions/chapter0/questions.json`: lesson question source.
- No testimonials, ratings, press, user counts, or partner claims exist. Do not fabricate any.

## Product Principles

1. **Meet real income as it arrives.** Paychecks, allowances, and odd-job money are irregular; the product adapts to the user's income, not the reverse.
2. **Every lesson connects to an action.** Learning lands next to the budgeting it explains.
3. **Goals over guilt.** Frame money as progress toward things you want, celebrated as it grows.
4. **Encourage without condescending.** Beginners are capable; guide and cheer, never lecture.
5. **Simple first, deeper later.** Keep the first-run path minimal; let real-money tracking and advanced features arrive without burying beginners.
