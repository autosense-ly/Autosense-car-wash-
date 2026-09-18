export const dashboardTranslations = {
  en: {
    loading: "Loading dashboard",
    loadingFull: "Loading dashboard...",
    description: "Here's what's happening at your car wash today.",
    newJob: "New Job",

    greetings: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },

    stats: {
      revenue: "Today's Revenue",
      vsYesterday: "vs yesterday",
      carsToday: "Cars Today",
      completedActive: "completed & active",
      inProgress: "In Progress",
      vehiclesBeingServiced: "vehicles being serviced",
      completed: "Completed",
      jobsCompletedToday: "jobs completed today",
    },

    recentJobs: {
      title: "Today's Operations",
      subtitle: "Current vehicle activity",
      viewAll: "View all",
      emptyTitle: "No jobs today",
      emptyDescription: "New jobs will appear here as they are created.",
      statuses: {
        waiting: "Waiting",
        in_progress: "In Progress",
        ready: "Ready",
        completed: "Completed",
        cancelled: "Cancelled",
      },
    },

    serviceBreakdown: {
      title: "Service Breakdown",
      subtitle: "Today's service activity",
      emptyTitle: "No service activity today",
      emptyDescription:
        "Service activity will appear here after jobs are created.",
      job: "job",
      jobs: "jobs",
    },

    finance: {
      cashPosition: "Cash Position",
      expectedCash: "Expected cash collected today",
      cash: "Cash",
      bankTransfer: "Bank Transfer",
      todayExpenses: "Today's Expenses",
      recordedExpenses: "Recorded business expenses",
      expense: "expense",
      expenses: "expenses",
      recordedToday: "recorded today",
      estimatedNet: "Estimated Net",
      revenueMinusExpenses: "Revenue minus recorded expenses",
      reconciliation:
        "End-of-day reconciliation will give the final figure.",
    },

    fallback: {
      unnamedVehicle: "Unnamed vehicle",
      noPlate: "No plate",
      noServices: "No services",
      unassigned: "Unassigned",
      unnamedService: "Unnamed service",
    },

    errors: {
      notLoggedIn: "You are not logged in",
      businessProfile: "Couldn't find your business profile",
      todayJobs: "Couldn't load today's jobs",
      yesterdayJobs: "Couldn't load yesterday's jobs",
      todayPayments: "Couldn't load today's payments",
      yesterdayPayments: "Couldn't load yesterday's payments",
      todayExpenses: "Couldn't load today's expenses",
      loadDashboard: "Couldn't load dashboard",
      date: "Could not determine today's date",
    },
  },

  ar: {
    loading: "جارٍ تحميل لوحة التحكم",
    loadingFull: "جارٍ تحميل لوحة التحكم...",
    description: "إليك ما يحدث في مغسلة السيارات اليوم.",
    newJob: "مهمة جديدة",

    greetings: {
      morning: "صباح الخير",
      afternoon: "مساء الخير",
      evening: "مساء الخير",
    },

    stats: {
      revenue: "إيرادات اليوم",
      vsYesterday: "مقارنةً بالأمس",
      carsToday: "السيارات اليوم",
      completedActive: "المكتملة والنشطة",
      inProgress: "قيد التنفيذ",
      vehiclesBeingServiced: "مركبات قيد الخدمة",
      completed: "مكتملة",
      jobsCompletedToday: "مهام مكتملة اليوم",
    },

    recentJobs: {
      title: "عمليات اليوم",
      subtitle: "نشاط المركبات الحالي",
      viewAll: "عرض الكل",
      emptyTitle: "لا توجد مهام اليوم",
      emptyDescription: "ستظهر المهام الجديدة هنا عند إنشائها.",
      statuses: {
        waiting: "في الانتظار",
        in_progress: "قيد التنفيذ",
        ready: "جاهزة",
        completed: "مكتملة",
        cancelled: "ملغاة",
      },
    },

    serviceBreakdown: {
      title: "تفصيل الخدمات",
      subtitle: "نشاط الخدمات اليوم",
      emptyTitle: "لا يوجد نشاط للخدمات اليوم",
      emptyDescription:
        "سيظهر نشاط الخدمات هنا بعد إنشاء المهام.",
      job: "مهمة",
      jobs: "مهام",
    },

    finance: {
      cashPosition: "الوضع النقدي",
      expectedCash: "النقد المتوقع تحصيله اليوم",
      cash: "نقدًا",
      bankTransfer: "تحويل بنكي",
      todayExpenses: "مصروفات اليوم",
      recordedExpenses: "مصروفات النشاط المسجلة",
      expense: "مصروف",
      expenses: "مصروفات",
      recordedToday: "مسجلة اليوم",
      estimatedNet: "صافي تقديري",
      revenueMinusExpenses: "الإيرادات مطروحًا منها المصروفات المسجلة",
      reconciliation:
        "ستعطي التسوية في نهاية اليوم الرقم النهائي.",
    },

    fallback: {
      unnamedVehicle: "مركبة بدون اسم",
      noPlate: "لا توجد لوحة",
      noServices: "لا توجد خدمات",
      unassigned: "غير معيّن",
      unnamedService: "خدمة بدون اسم",
    },

    errors: {
      notLoggedIn: "لم يتم تسجيل الدخول",
      businessProfile: "تعذر العثور على ملف نشاطك التجاري",
      todayJobs: "تعذر تحميل مهام اليوم",
      yesterdayJobs: "تعذر تحميل مهام الأمس",
      todayPayments: "تعذر تحميل مدفوعات اليوم",
      yesterdayPayments: "تعذر تحميل مدفوعات الأمس",
      todayExpenses: "تعذر تحميل مصروفات اليوم",
      loadDashboard: "تعذر تحميل لوحة التحكم",
      date: "تعذر تحديد تاريخ اليوم",
    },
  },
} as const

export type DashboardLanguage = keyof typeof dashboardTranslations
