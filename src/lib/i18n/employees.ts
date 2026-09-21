export const employeesTranslations = {
  en: {
    searchPlaceholder: "Search employees...",
    payType: "Pay type",
  },
  ar: {
    searchPlaceholder: "ابحث عن الموظفين...",
    payType: "نوع الدفع",
  },
} as const

export type EmployeesTranslations =
  (typeof employeesTranslations)[keyof typeof employeesTranslations]
