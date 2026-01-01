export const queryKeys = {
  users: {
    all: ["users"],
    current: () => [...queryKeys.users.all, "current"],
  },
  budgets: {
    all: ["budgets"],
    list: (userId) => [...queryKeys.budgets.all, "list", userId],
    detail: (budgetId) => [...queryKeys.budgets.all, "detail", budgetId],
  },
  virtualBalance: {
    all: ["virtualBalance"],
    current: (userId) => [...queryKeys.virtualBalance.all, "current", userId],
  },
  preferences: {
    all: ["preferences"],
    current: () => [...queryKeys.preferences.all, "current"],
  },
  lessons: {
    all: ["lessons"],
    chapter: (chapter) => [...queryKeys.lessons.all, "chapter", chapter],
    chapterLesson: (chapter, lessonId) => [
      ...queryKeys.lessons.all,
      "chapterLesson",
      chapter,
      lessonId,
    ],
  },
  progress: {
    all: ["progress"],
    user: (userId) => [...queryKeys.progress.all, "user", userId],
  },
};
