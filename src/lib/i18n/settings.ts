export const settingsTranslations = {
  en: {
    system: "System",
    title: "Settings",
    description: "Configure AF Car Wash for how your business operates.",
    yourBusiness: "Your Business",
    loadingBusinessDetails: "Loading business details...",
    businessName: "Business name",
    businessId: "Business ID",
    businessIdDescription:
      "Share this ID with anyone joining as a manager.",
    copied: "Copied",
    copy: "Copy",

    business: "Business",
    businessDescription:
      "Business name, contact information and general details.",

    permissions: "Permissions",
    permissionsDescription:
      "Control exactly what owners, managers and workers can access.",

    services: "Services",
    servicesDescription:
      "Configure services, pricing, durations and service-specific options.",

    employees: "Employees",
    employeesDescription:
      "Manage employee roles, access and payment arrangements.",

    payments: "Payments",
    paymentsDescription:
      "Configure payment methods and who can collect payments.",

    notifications: "Notifications",
    notificationsDescription:
      "Configure operational and customer notifications.",

    configurationPhilosophy: "Configuration Philosophy",
    configurationDescription:
      "AF Car Wash is designed to adapt to how each car wash operates. Owners should be able to decide which features managers can access, who can collect payments, what information is visible, and which services are available.",

    notLoggedIn:
      "Not logged in — no active session found. Sign in first at /login.",
  },

  ar: {
    system: "النظام",
    title: "الإعدادات",
    description: "اضبط AF Car Wash بما يناسب طريقة عمل نشاطك التجاري.",
    yourBusiness: "نشاطك التجاري",
    loadingBusinessDetails: "جارٍ تحميل تفاصيل النشاط التجاري...",
    businessName: "اسم النشاط التجاري",
    businessId: "معرّف النشاط التجاري",
    businessIdDescription:
      "شارك هذا المعرّف مع أي شخص يريد الانضمام كمدير.",
    copied: "تم النسخ",
    copy: "نسخ",

    business: "النشاط التجاري",
    businessDescription:
      "اسم النشاط التجاري ومعلومات الاتصال والتفاصيل العامة.",

    permissions: "الصلاحيات",
    permissionsDescription:
      "تحكم بدقة فيما يمكن للمالكين والمديرين والعمال الوصول إليه.",

    services: "الخدمات",
    servicesDescription:
      "اضبط الخدمات والأسعار والمدد والخيارات الخاصة بكل خدمة.",

    employees: "الموظفون",
    employeesDescription:
      "إدارة أدوار الموظفين وصلاحيات الوصول وترتيبات الدفع.",

    payments: "المدفوعات",
    paymentsDescription:
      "اضبط طرق الدفع ومن يمكنه تحصيل المدفوعات.",

    notifications: "الإشعارات",
    notificationsDescription:
      "اضبط الإشعارات التشغيلية وإشعارات العملاء.",

    configurationPhilosophy: "فلسفة الإعدادات",
    configurationDescription:
      "تم تصميم AF Car Wash ليتكيف مع طريقة عمل كل مغسلة سيارات. يجب أن يتمكن المالكون من تحديد الميزات التي يمكن للمديرين الوصول إليها، ومن يمكنه تحصيل المدفوعات، والمعلومات التي تظهر، والخدمات المتاحة.",

    notLoggedIn:
      "لم يتم تسجيل الدخول — لا توجد جلسة نشطة. سجّل الدخول أولًا من /login.",
  },
} as const

export type SettingsTranslations =
  (typeof settingsTranslations)[keyof typeof settingsTranslations]
