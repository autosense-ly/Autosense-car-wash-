export const operationsTranslations = {
  en: {
    title: "Operations",
    description: "Manage today's vehicles and active jobs.",
    newJob: "New Job",
    counts: {
      waiting: "Waiting",
      inProgress: "In Progress",
      ready: "Ready",
      completed: "Completed",
    },
    searchPlaceholder: "Search plate, customer, vehicle or worker...",
    loadingJobs: "Loading jobs...",
    noJobsFound: "No jobs found",
    noJobsDescription: "Create a job or change your search.",
    fallback: {
      unnamedVehicle: "Unnamed vehicle",
      walkIn: "Walk-in",
      noServices: "No services",
      unassigned: "Unassigned",
    },
    actions: {
      startJob: "Start Job",
      markReady: "Mark Ready",
      complete: "Complete",
      markPaid: "Mark Paid",
      open: "Open",
    },
    payment: {
      paid: "Paid",
      partial: "Partial",
      unpaid: "Unpaid",
      cash: "Cash",
      bankTransfer: "Bank Transfer",
      markedPaidVia: "Marked as paid via",
    },
    errors: {
      loadJobs: "Couldn't load jobs",
      updateJob: "Couldn't update job",
      notLoggedIn: "Not logged in",
      businessNotFound: "Couldn't find your business",
      recordPayment: "Couldn't record payment",
    },
  },

  ar: {
    title: "العمليات",
    description: "إدارة مركبات اليوم والمهام النشطة.",
    newJob: "مهمة جديدة",
    counts: {
      waiting: "في الانتظار",
      inProgress: "قيد التنفيذ",
      ready: "جاهزة",
      completed: "مكتملة",
    },
    searchPlaceholder: "ابحث برقم اللوحة أو العميل أو المركبة أو العامل...",
    loadingJobs: "جارٍ تحميل المهام...",
    noJobsFound: "لم يتم العثور على مهام",
    noJobsDescription: "أنشئ مهمة أو غيّر عبارة البحث.",
    fallback: {
      unnamedVehicle: "مركبة بدون اسم",
      walkIn: "عميل بدون حجز",
      noServices: "لا توجد خدمات",
      unassigned: "غير معيّن",
    },
    actions: {
      startJob: "بدء المهمة",
      markReady: "تحديد كجاهزة",
      complete: "إكمال",
      markPaid: "تسجيل الدفع",
      open: "فتح",
    },
    payment: {
      paid: "مدفوع",
      partial: "مدفوع جزئيًا",
      unpaid: "غير مدفوع",
      cash: "نقدًا",
      bankTransfer: "تحويل بنكي",
      markedPaidVia: "تم تسجيل الدفع عبر",
    },
    errors: {
      loadJobs: "تعذر تحميل المهام",
      updateJob: "تعذر تحديث المهمة",
      notLoggedIn: "لم يتم تسجيل الدخول",
      businessNotFound: "تعذر العثور على نشاطك التجاري",
      recordPayment: "تعذر تسجيل الدفع",
    },
  },
} as const

export type OperationsLanguage = keyof typeof operationsTranslations

export type OperationsTranslations =
  (typeof operationsTranslations)[OperationsLanguage]
