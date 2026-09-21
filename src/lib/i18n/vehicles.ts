export type VehiclesTranslations = {
  title: string
  description: string
  addVehicle: string
  searchPlaceholder: string
  loading: string
  noVehiclesYet: string
  noVehiclesFound: string
  addFirstVehicle: string
  tryDifferentSearch: string
  unnamedVehicle: string
  yearNotSet: string
  owner: string
  visits: string
  clickToEdit: string
  editVehicle: string
  addVehicleTitle: string
  plateNumber: string
  make: string
  model: string
  year: string
  color: string
  noOwnerSet: string
  noCustomersHint: string
  cancel: string
  saving: string
  saveChanges: string
  errors: {
    load: string
    plateRequired: string
    notLoggedIn: string
    businessNotFound: string
    save: string
  }
  success: {
    updated: string
    added: string
  }
}

export const vehiclesTranslations: Record<"en" | "ar", VehiclesTranslations> = {
  en: {
    title: "Vehicles",
    description: "Vehicles registered with your car wash.",
    addVehicle: "Add Vehicle",
    searchPlaceholder: "Search plate, vehicle or owner...",
    loading: "Loading vehicles...",
    noVehiclesYet: "No vehicles yet",
    noVehiclesFound: "No vehicles found",
    addFirstVehicle: "Add your first vehicle to get started.",
    tryDifferentSearch: "Try changing your search.",
    unnamedVehicle: "Unnamed vehicle",
    yearNotSet: "Year not set",
    owner: "Owner",
    visits: "Visits",
    clickToEdit: "Click to edit vehicle",
    editVehicle: "Edit vehicle",
    addVehicleTitle: "Add vehicle",
    plateNumber: "Plate number",
    make: "Make",
    model: "Model",
    year: "Year",
    color: "Color",
    noOwnerSet: "No owner set",
    noCustomersHint:
      "No customers yet — add one on the Customers page first if you want to link an owner.",
    cancel: "Cancel",
    saving: "Saving...",
    saveChanges: "Save changes",
    errors: {
      load: "Couldn't load vehicles",
      plateRequired: "Plate number is required",
      notLoggedIn: "Not logged in",
      businessNotFound: "Couldn't find your business",
      save: "Couldn't save",
    },
    success: {
      updated: "Vehicle updated",
      added: "Vehicle added",
    },
  },

  ar: {
    title: "المركبات",
    description: "المركبات المسجلة لدى مغسلة السيارات الخاصة بك.",
    addVehicle: "إضافة مركبة",
    searchPlaceholder: "ابحث عن اللوحة أو المركبة أو المالك...",
    loading: "جارٍ تحميل المركبات...",
    noVehiclesYet: "لا توجد مركبات بعد",
    noVehiclesFound: "لم يتم العثور على مركبات",
    addFirstVehicle: "أضف أول مركبة للبدء.",
    tryDifferentSearch: "جرّب تغيير البحث.",
    unnamedVehicle: "مركبة بدون اسم",
    yearNotSet: "السنة غير محددة",
    owner: "المالك",
    visits: "الزيارات",
    clickToEdit: "اضغط لتعديل المركبة",
    editVehicle: "تعديل المركبة",
    addVehicleTitle: "إضافة مركبة",
    plateNumber: "رقم اللوحة",
    make: "الصانع",
    model: "الموديل",
    year: "السنة",
    color: "اللون",
    noOwnerSet: "لا يوجد مالك محدد",
    noCustomersHint:
      "لا يوجد عملاء بعد — أضف عميلاً من صفحة العملاء أولاً إذا كنت تريد ربط مالك بالمركبة.",
    cancel: "إلغاء",
    saving: "جارٍ الحفظ...",
    saveChanges: "حفظ التغييرات",
    errors: {
      load: "تعذر تحميل المركبات",
      plateRequired: "رقم اللوحة مطلوب",
      notLoggedIn: "لم يتم تسجيل الدخول",
      businessNotFound: "تعذر العثور على نشاطك التجاري",
      save: "تعذر الحفظ",
    },
    success: {
      updated: "تم تحديث المركبة",
      added: "تمت إضافة المركبة",
    },
  },
}
