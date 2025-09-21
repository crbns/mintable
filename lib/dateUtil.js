export const getWeekNumber = (date = new Date()) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);

  const pastDaysOfYear = Math.floor((date - startOfYear) / 86400000);

  const startDay = startOfYear.getDay();

  const weekNo = Math.floor((pastDaysOfYear + startDay) / 7) + 1;

  return weekNo;
};
