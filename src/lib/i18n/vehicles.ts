export const vehiclesTranslations = {
  en: {
    searchPlaceholder: "Search plate, vehicle or owner...",
    noOwnerSet: "No owner set",
  },
  ar: {
    searchPlaceholder: "ابحث عن اللوحة أو المركبة أو المالك...",
    noOwnerSet: "لا يوجد مالك محدد",
  },
} as const

export type VehiclesTranslations =
  (typeof vehiclesTranslations)[keyof typeof vehiclesTranslations]
