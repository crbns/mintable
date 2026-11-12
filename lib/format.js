// Whole-dollar amounts with thousands separators, e.g. 1355 -> "$1,355"
export const formatMoney = (value) => {
  const amount = Math.round(Number(value) || 0);
  return "$" + amount.toLocaleString("en-US");
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Short month and year, e.g. "Mar 2025"
export const formatMonthYear = (value) => {
  const date = new Date(value);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};
