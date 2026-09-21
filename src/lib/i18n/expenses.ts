export const expensesTranslations = {
  en: {
    searchPlaceholder: "Search expenses...",
    deleteExpense: "Delete expense",
    descriptionPlaceholder: "What was this expense for?",
  },
  ar: {
    searchPlaceholder: "ابحث في المصروفات...",
    deleteExpense: "حذف المصروف",
    descriptionPlaceholder: "ما سبب هذا المصروف؟",
  },
} as const

export type ExpensesTranslations =
  (typeof expensesTranslations)[keyof typeof expensesTranslations]
