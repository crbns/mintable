export const getWeekNumber = (date = new Date()) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);

  const pastDaysOfYear = Math.floor((date - startOfYear) / 86400000);

  const startDay = startOfYear.getDay();

  const weekNo = Math.floor((pastDaysOfYear + startDay) / 7) + 1;

  return weekNo;
};

export const getDaysUntilNextUpdate = (updateFreq) => {
  const now = new Date();
  let nextDate;

  if (updateFreq === "monthly") {
    nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (updateFreq === "quarterly") {
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const nextQuarter = (currentQuarter % 4) + 1;
    const nextQuarterStartMonth = (nextQuarter - 1) * 3;
    nextDate = new Date(now.getFullYear(), nextQuarterStartMonth, 1);
    // If next quarter is Q1, it's next year
    if (nextQuarter === 1) {
      nextDate.setFullYear(now.getFullYear() + 1);
    }
  } else if (updateFreq === "yearly") {
    nextDate = new Date(now.getFullYear() + 1, 0, 1);
  } else {
    return null; // unknown frequency
  }

  const diffTime = nextDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
