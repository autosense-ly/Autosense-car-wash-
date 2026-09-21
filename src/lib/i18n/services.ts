export const servicesFormTranslations = {
  en: {
    categoryPlaceholder: "e.g. Wash, Detailing, Maintenance",
    unitNamePlaceholder: "e.g. liter, item",
  },
  ar: {
    categoryPlaceholder: "مثال: غسيل، تلميع، صيانة",
    unitNamePlaceholder: "مثال: لتر، قطعة",
  },
} as const

export type ServicesFormTranslations =
  (typeof servicesFormTranslations)[keyof typeof servicesFormTranslations]
