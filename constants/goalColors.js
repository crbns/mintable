export const GOAL_COLORS = [
  { label: "Red", value: "#ffadad" },
  { label: "Orange", value: "#ffd6a5" },
  { label: "Yellow", value: "#fdffb6" },
  { label: "Green", value: "#caffbf" },
  { label: "Blue", value: "#a0c4ff" },
  { label: "Purple", value: "#bdb2ff" },
  { label: "Pink", value: "#ffc6ff" },
];

// First color no existing goal uses, so new goals are told apart without asking
export const pickUnusedColor = (usedColors = []) =>
  (
    GOAL_COLORS.find((c) => !usedColors.includes(c.value)) ??
    GOAL_COLORS[usedColors.length % GOAL_COLORS.length]
  ).value;
