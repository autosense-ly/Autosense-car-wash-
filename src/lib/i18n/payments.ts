export const paymentsTranslations = {
  en: {
    searchPlaceholder: "Search payments...",
    noJobsFound: "No jobs found",
  },
  ar: {
    searchPlaceholder: "ابحث في المدفوعات...",
    noJobsFound: "لم يتم العثور على مهام",
  },
} as const

export type PaymentsTranslations =
  (typeof paymentsTranslations)[keyof typeof paymentsTranslations]
