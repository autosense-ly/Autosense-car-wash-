export const oilChangeTranslations = {
  en: {
    title: "Oil Change Details",
    description: "Enter the actual oil used for this vehicle.",
    oilBrand: "Oil Brand",
    oilBrandPlaceholder: "e.g. Castrol",
    oilGrade: "Oil Grade",
    oilGradePlaceholder: "e.g. 5W-30",
    quantityLiter: "Quantity (liter)",
    quantityPlaceholder: "e.g. 2",
    pricePerLiter: "Price per Liter (LYD)",
    pricePerLiterPlaceholder: "e.g. 30",
    oilTotal: "Oil total",
    confirm: "Confirm Oil Details",
  },
  ar: {
    title: "تفاصيل تغيير الزيت",
    description: "أدخل الزيت المستخدم فعليًا لهذه المركبة.",
    oilBrand: "ماركة الزيت",
    oilBrandPlaceholder: "مثال: Castrol",
    oilGrade: "درجة الزيت",
    oilGradePlaceholder: "مثال: 5W-30",
    quantityLiter: "الكمية (لتر)",
    quantityPlaceholder: "مثال: 2",
    pricePerLiter: "السعر لكل لتر (LYD)",
    pricePerLiterPlaceholder: "مثال: 30",
    oilTotal: "إجمالي الزيت",
    confirm: "تأكيد تفاصيل الزيت",
  },
} as const

export type OilChangeTranslations =
  (typeof oilChangeTranslations)[keyof typeof oilChangeTranslations]
