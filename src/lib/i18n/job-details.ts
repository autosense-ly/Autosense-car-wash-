type JobDetailsTranslation = {
  loadingJob: string
  backToJobs: string
  jobNotFound: string
  jobNotFoundDescription: string
  jobDescription: string
  jobNumber: string
  vehicle: string
  unnamedVehicle: string
  plateNumber: string
  noPlate: string
  customer: string
  walkIn: string
  phone: string
  color: string
  status: string
  waiting: string
  inProgress: string
  ready: string
  completed: string
  cancelled: string
  services: string
  noServices: string
  quantity: string
  each: string
  subtotal: string
  total: string
  payment: string
  unpaid: string
  partial: string
  paid: string
  paidAmount: string
  remaining: string
  paymentHistory: string
  cash: string
  bankTransfer: string
  jobInformation: string
  worker: string
  notAssigned: string
  notes: string
  notLoggedIn: string
  businessProfileNotFound: string
  loadJobError: string
  loadPaymentsError: string
  currency: string
}

export const jobDetailsTranslations: Record<
  "en" | "ar",
  JobDetailsTranslation
> = {
  en: {
    loadingJob: "Loading job...",
    backToJobs: "Back to Jobs",
    jobNotFound: "Job not found",
    jobNotFoundDescription:
      "This job could not be found in your business.",
    jobDescription:
      "View vehicle, services, status and payment information.",
    jobNumber: "Job",
    vehicle: "Vehicle",
    unnamedVehicle: "Unnamed vehicle",
    plateNumber: "Plate Number",
    noPlate: "No plate",
    customer: "Customer",
    walkIn: "Walk-in",
    phone: "Phone",
    color: "Color",
    status: "Status",
    waiting: "Waiting",
    inProgress: "In Progress",
    ready: "Ready",
    completed: "Completed",
    cancelled: "Cancelled",
    services: "Services",
    noServices: "No services recorded.",
    quantity: "Qty",
    each: "each",
    subtotal: "Subtotal",
    total: "Total",
    payment: "Payment",
    unpaid: "Unpaid",
    partial: "Partial",
    paid: "Paid",
    paidAmount: "Paid",
    remaining: "Remaining",
    paymentHistory: "Payment History",
    cash: "Cash",
    bankTransfer: "Bank Transfer",
    jobInformation: "Job Information",
    worker: "Worker",
    notAssigned: "Not assigned",
    notes: "Notes",
    notLoggedIn: "You are not logged in",
    businessProfileNotFound:
      "Couldn't find your business profile",
    loadJobError: "Couldn't load job",
    loadPaymentsError: "Couldn't load payments",
    currency: "LYD",
  },

  ar: {
    loadingJob: "جارٍ تحميل المهمة...",
    backToJobs: "العودة إلى المهام",
    jobNotFound: "المهمة غير موجودة",
    jobNotFoundDescription:
      "تعذر العثور على هذه المهمة في نشاطك التجاري.",
    jobDescription:
      "عرض معلومات المركبة والخدمات والحالة والدفع.",
    jobNumber: "المهمة",
    vehicle: "المركبة",
    unnamedVehicle: "مركبة بدون اسم",
    plateNumber: "رقم اللوحة",
    noPlate: "لا توجد لوحة",
    customer: "العميل",
    walkIn: "عميل حضوري",
    phone: "الهاتف",
    color: "اللون",
    status: "الحالة",
    waiting: "قيد الانتظار",
    inProgress: "قيد التنفيذ",
    ready: "جاهزة",
    completed: "مكتملة",
    cancelled: "ملغاة",
    services: "الخدمات",
    noServices: "لا توجد خدمات مسجلة.",
    quantity: "الكمية",
    each: "لكل وحدة",
    subtotal: "الإجمالي الفرعي",
    total: "الإجمالي",
    payment: "الدفع",
    unpaid: "غير مدفوع",
    partial: "مدفوع جزئيًا",
    paid: "مدفوع",
    paidAmount: "المدفوع",
    remaining: "المتبقي",
    paymentHistory: "سجل المدفوعات",
    cash: "نقدًا",
    bankTransfer: "تحويل مصرفي",
    jobInformation: "معلومات المهمة",
    worker: "العامل",
    notAssigned: "غير معيّن",
    notes: "ملاحظات",
    notLoggedIn: "لم تقم بتسجيل الدخول",
    businessProfileNotFound:
      "تعذر العثور على ملف نشاطك التجاري",
    loadJobError: "تعذر تحميل المهمة",
    loadPaymentsError: "تعذر تحميل المدفوعات",
    currency: "ل.د",
  },
}
