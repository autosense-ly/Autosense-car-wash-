export type ServicesFormTranslations = {
  title: string
  description: string
  addService: string
  loading: string
  noServices: string
  addFirstService: string
  uncategorized: string
  edit: string
  deleteLabel: string
  price: string
  duration: string
  active: string
  disabled: string
  editService: string
  addServiceTitle: string
  name: string
  category: string
  fixedPrice: string
  pricePerUnit: string
  customPrice: string
  durationMinutes: string
  cancel: string
  saving: string
  saveChanges: string
  minutesShort: string
  categoryPlaceholder: string
  unitNamePlaceholder: string
  errors: {
    load: string
    nameRequired: string
    notLoggedIn: string
    businessNotFound: string
    save: string
    update: string
    delete: string
  }
  success: {
    updated: string
    added: string
    deleted: string
  }
}

export const servicesFormTranslations: Record<
  "en" | "ar",
  ServicesFormTranslations
> = {
  en: {
    title: "Services",
    description: "Configure the services your car wash offers.",
    addService: "Add Service",
    loading: "Loading services...",
    noServices: "No services yet",
    addFirstService: "Add your first service to get started.",
    uncategorized: "Uncategorized",
    edit: "Edit",
    deleteLabel: "Delete",
    price: "Price",
    duration: "Duration",
    active: "Active",
    disabled: "Disabled",
    editService: "Edit service",
    addServiceTitle: "Add service",
    name: "Name",
    category: "Category",
    fixedPrice: "Fixed price",
    pricePerUnit: "Price per unit",
    customPrice: "Custom (set per job)",
    durationMinutes: "Duration (minutes)",
    cancel: "Cancel",
    saving: "Saving...",
    saveChanges: "Save changes",
    minutesShort: "min",
    categoryPlaceholder: "e.g. Wash, Detailing, Maintenance",
    unitNamePlaceholder: "e.g. liter, item",
    errors: {
      load: "Couldn't load services",
      nameRequired: "Service name is required",
      notLoggedIn: "Not logged in",
      businessNotFound: "Couldn't find your business",
      save: "Couldn't save",
      update: "Couldn't update",
      delete: "Couldn't delete",
    },
    success: {
      updated: "Service updated",
      added: "Service added",
      deleted: "Service deleted",
    },
  },

  ar: {
    title: "الخدمات",
    description: "قم بإعداد الخدمات التي تقدمها مغسلة السيارات.",
    addService: "إضافة خدمة",
    loading: "جارٍ تحميل الخدمات...",
    noServices: "لا توجد خدمات بعد",
    addFirstService: "أضف أول خدمة للبدء.",
    uncategorized: "غير مصنفة",
    edit: "تعديل",
    deleteLabel: "حذف",
    price: "السعر",
    duration: "المدة",
    active: "نشطة",
    disabled: "معطلة",
    editService: "تعديل الخدمة",
    addServiceTitle: "إضافة خدمة",
    name: "الاسم",
    category: "الفئة",
    fixedPrice: "سعر ثابت",
    pricePerUnit: "السعر لكل وحدة",
    customPrice: "مخصص (يُحدد لكل مهمة)",
    durationMinutes: "المدة (بالدقائق)",
    cancel: "إلغاء",
    saving: "جارٍ الحفظ...",
    saveChanges: "حفظ التغييرات",
    minutesShort: "دقيقة",
    categoryPlaceholder: "مثال: غسيل، تلميع، صيانة",
    unitNamePlaceholder: "مثال: لتر، قطعة",
    errors: {
      load: "تعذر تحميل الخدمات",
      nameRequired: "اسم الخدمة مطلوب",
      notLoggedIn: "لم يتم تسجيل الدخول",
      businessNotFound: "تعذر العثور على نشاطك التجاري",
      save: "تعذر الحفظ",
      update: "تعذر التحديث",
      delete: "تعذر الحذف",
    },
    success: {
      updated: "تم تحديث الخدمة",
      added: "تمت إضافة الخدمة",
      deleted: "تم حذف الخدمة",
    },
  },
}
