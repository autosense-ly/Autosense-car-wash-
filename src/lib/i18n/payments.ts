export type PaymentsTranslations = {
  finance: string
  title: string
  description: string
  collectedToday: string
  totalPaymentsReceived: string
  cash: string
  cashCollectedToday: string
  bankTransfer: string
  transfersCollectedToday: string
  paymentHistory: string
  paymentHistoryDescription: string
  loading: string
  noJobsFound: string
  createJobFirst: string
  job: string
  customer: string
  vehicle: string
  amount: string
  status: string
  method: string
  action: string
  walkIn: string
  unnamedVehicle: string
  paid: string
  partial: string
  unpaid: string
  collected: string
  searchPlaceholder: string
  errors: {
    loadJobs: string
    notLoggedIn: string
    businessNotFound: string
    recordPayment: string
  }
  success: {
    markedPaid: string
  }
}

export const paymentsTranslations: Record<"en" | "ar", PaymentsTranslations> = {
  en: {
    finance: "Finance",
    title: "Payments",
    description: "Track payments and collection activity.",
    collectedToday: "Collected Today",
    totalPaymentsReceived: "Total payments received",
    cash: "Cash",
    cashCollectedToday: "Cash collected today",
    bankTransfer: "Bank Transfer",
    transfersCollectedToday: "Transfers collected today",
    paymentHistory: "Payment History",
    paymentHistoryDescription: "View and collect outstanding job payments.",
    loading: "Loading payments...",
    noJobsFound: "No jobs found",
    createJobFirst: "Create a job first, then its payment will appear here.",
    job: "Job",
    customer: "Customer",
    vehicle: "Vehicle",
    amount: "Amount",
    status: "Status",
    method: "Method",
    action: "Action",
    walkIn: "Walk-in",
    unnamedVehicle: "Unnamed vehicle",
    paid: "Paid",
    partial: "Partial",
    unpaid: "Unpaid",
    collected: "Collected",
    searchPlaceholder: "Search payments...",
    errors: {
      loadJobs: "Couldn't load jobs",
      notLoggedIn: "Not logged in",
      businessNotFound: "Couldn't find your business",
      recordPayment: "Couldn't record payment",
    },
    success: {
      markedPaid: "Marked as paid via",
    },
  },

  ar: {
    finance: "المالية",
    title: "المدفوعات",
    description: "تتبع المدفوعات ونشاط التحصيل.",
    collectedToday: "المحصّل اليوم",
    totalPaymentsReceived: "إجمالي المدفوعات المستلمة",
    cash: "نقدًا",
    cashCollectedToday: "النقد المحصّل اليوم",
    bankTransfer: "تحويل بنكي",
    transfersCollectedToday: "التحويلات المحصّلة اليوم",
    paymentHistory: "سجل المدفوعات",
    paymentHistoryDescription: "عرض وتحصيل المدفوعات المستحقة للمهام.",
    loading: "جارٍ تحميل المدفوعات...",
    noJobsFound: "لم يتم العثور على مهام",
    createJobFirst: "أنشئ مهمة أولاً، وستظهر مدفوعاتها هنا.",
    job: "المهمة",
    customer: "العميل",
    vehicle: "المركبة",
    amount: "المبلغ",
    status: "الحالة",
    method: "طريقة الدفع",
    action: "الإجراء",
    walkIn: "عميل بدون موعد",
    unnamedVehicle: "مركبة بدون اسم",
    paid: "مدفوع",
    partial: "مدفوع جزئيًا",
    unpaid: "غير مدفوع",
    collected: "تم التحصيل",
    searchPlaceholder: "ابحث في المدفوعات...",
    errors: {
      loadJobs: "تعذر تحميل المهام",
      notLoggedIn: "لم يتم تسجيل الدخول",
      businessNotFound: "تعذر العثور على نشاطك التجاري",
      recordPayment: "تعذر تسجيل الدفعة",
    },
    success: {
      markedPaid: "تم تحديد الدفع كمدفوع عبر",
    },
  },
}
