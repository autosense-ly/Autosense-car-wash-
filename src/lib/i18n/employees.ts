export type EmployeesTranslations = {
  title: string
  description: string
  addEmployee: string
  searchPlaceholder: string
  loading: string
  noEmployeesYet: string
  noEmployeesFound: string
  addFirstEmployee: string
  tryDifferentSearch: string
  noPhone: string
  edit: string
  remove: string
  payment: string
  type: string
  salary: string
  percentage: string
  active: string
  inactive: string
  employee: string
  addEmployeeTitle: string
  editEmployeeTitle: string
  name: string
  phone: string
  payType: string
  fixedSalary: string
  percentagePerJob: string
  salaryAmount: string
  frequency: string
  daily: string
  weekly: string
  monthly: string
  percentageRate: string
  cancel: string
  saving: string
  saveChanges: string
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
    added: string
    updated: string
    removed: string
  }
  confirmRemove: string
  cannotUndo: string
  perJob: string
  perMonth: string
  perWeek: string
  perDay: string
}

export const employeesTranslations: Record<
  "en" | "ar",
  EmployeesTranslations
> = {
  en: {
    title: "Employees",
    description:
      "Manage staff and payment arrangements. Owner and manager accounts are managed separately, under Settings.",
    addEmployee: "Add Employee",
    searchPlaceholder: "Search employees...",
    loading: "Loading employees...",
    noEmployeesYet: "No employees yet",
    noEmployeesFound: "No employees found",
    addFirstEmployee: "Add your first employee to get started.",
    tryDifferentSearch: "Try a different name or phone number.",
    noPhone: "No phone",
    edit: "Edit",
    remove: "Remove",
    payment: "Payment",
    type: "Type",
    salary: "Salary",
    percentage: "Percentage",
    active: "Active",
    inactive: "Inactive",
    employee: "Employee",
    addEmployeeTitle: "Add employee",
    editEmployeeTitle: "Edit employee",
    name: "Name",
    phone: "Phone",
    payType: "Pay type",
    fixedSalary: "Fixed salary",
    percentagePerJob: "Percentage per job",
    salaryAmount: "Salary amount (LYD)",
    frequency: "Frequency",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    percentageRate: "Percentage rate (%)",
    cancel: "Cancel",
    saving: "Saving...",
    saveChanges: "Save changes",
    errors: {
      load: "Couldn't load employees",
      nameRequired: "Name is required",
      notLoggedIn: "Not logged in",
      businessNotFound: "Couldn't find your business",
      save: "Couldn't save",
      update: "Couldn't update",
      delete: "Couldn't delete",
    },
    success: {
      added: "Employee added",
      updated: "Employee updated",
      removed: "Employee removed",
    },
    confirmRemove: 'Remove "{name}"?',
    cannotUndo: "This can't be undone.",
    perJob: "per job",
    perMonth: "month",
    perWeek: "week",
    perDay: "day",
  },

  ar: {
    title: "الموظفون",
    description:
      "إدارة الموظفين وترتيبات الدفع. تتم إدارة حسابات المالك والمدير بشكل منفصل من الإعدادات.",
    addEmployee: "إضافة موظف",
    searchPlaceholder: "البحث عن الموظفين...",
    loading: "جارٍ تحميل الموظفين...",
    noEmployeesYet: "لا يوجد موظفون بعد",
    noEmployeesFound: "لم يتم العثور على موظفين",
    addFirstEmployee: "أضف أول موظف للبدء.",
    tryDifferentSearch: "جرّب اسمًا أو رقم هاتف مختلفًا.",
    noPhone: "لا يوجد هاتف",
    edit: "تعديل",
    remove: "إزالة",
    payment: "الدفع",
    type: "النوع",
    salary: "راتب",
    percentage: "نسبة مئوية",
    active: "نشط",
    inactive: "غير نشط",
    employee: "موظف",
    addEmployeeTitle: "إضافة موظف",
    editEmployeeTitle: "تعديل الموظف",
    name: "الاسم",
    phone: "الهاتف",
    payType: "نوع الدفع",
    fixedSalary: "راتب ثابت",
    percentagePerJob: "نسبة مئوية لكل مهمة",
    salaryAmount: "مبلغ الراتب (LYD)",
    frequency: "التكرار",
    daily: "يومي",
    weekly: "أسبوعي",
    monthly: "شهري",
    percentageRate: "نسبة مئوية (%)",
    cancel: "إلغاء",
    saving: "جارٍ الحفظ...",
    saveChanges: "حفظ التغييرات",
    errors: {
      load: "تعذر تحميل الموظفين",
      nameRequired: "الاسم مطلوب",
      notLoggedIn: "لم يتم تسجيل الدخول",
      businessNotFound: "تعذر العثور على نشاطك التجاري",
      save: "تعذر الحفظ",
      update: "تعذر التحديث",
      delete: "تعذر الحذف",
    },
    success: {
      added: "تمت إضافة الموظف",
      updated: "تم تحديث الموظف",
      removed: "تمت إزالة الموظف",
    },
    confirmRemove: 'إزالة "{name}"؟',
    cannotUndo: "لا يمكن التراجع عن هذا الإجراء.",
    perJob: "لكل مهمة",
    perMonth: "شهريًا",
    perWeek: "أسبوعيًا",
    perDay: "يوميًا",
  },
}
