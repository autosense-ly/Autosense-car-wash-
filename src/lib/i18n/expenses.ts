export type ExpenseCategory =
  | "supplies"
  | "utilities"
  | "maintenance"
  | "salary"
  | "other"

export type ExpensesTranslations = {
  title: string
  description: string
  addExpense: string
  totalExpensesToday: string
  expenseHistory: string
  recentBusinessExpenses: string
  loading: string
  noExpensesFound: string
  noExpensesDescription: string
  expense: string
  category: string
  descriptionLabel: string
  amount: string
  amountLyd: string
  recordedBy: string
  manager: string
  addExpenseTitle: string
  addExpenseDescription: string
  cancel: string
  saveExpense: string
  saving: string
  deleteExpense: string
  deleteExpenseTitle: string
  deleteExpenseDescription: string
  delete: string
  searchPlaceholder: string
  descriptionPlaceholder: string
  amountPlaceholder: string
  descriptionRequired: string
  amountGreaterThanZero: string
  errors: {
    notLoggedIn: string
    businessProfileNotFound: string
    loadExpenses: string
    deleteExpense: string
    createExpense: string
  }
  success: {
    expenseAdded: string
    expenseDeleted: string
  }
  categories: Record<ExpenseCategory, string>
}

export const expensesTranslations: Record<
  "en" | "ar",
  ExpensesTranslations
> = {
  en: {
    title: "Expenses",
    description: "Record and track business expenses.",
    addExpense: "Add Expense",
    totalExpensesToday: "Total Expenses Today",
    expenseHistory: "Expense History",
    recentBusinessExpenses: "Recent business expenses",
    loading: "Loading expenses...",
    noExpensesFound: "No expenses found",
    noExpensesDescription:
      "Add an expense to begin tracking business costs.",
    expense: "Expense",
    category: "Category",
    descriptionLabel: "Description",
    amount: "Amount",
    amountLyd: "Amount (LYD)",
    recordedBy: "Recorded By",
    manager: "Manager",
    addExpenseTitle: "Add Expense",
    addExpenseDescription:
      "Record a business expense for the shop.",
    cancel: "Cancel",
    saveExpense: "Save Expense",
    saving: "Saving...",
    deleteExpense: "Delete expense",
    deleteExpenseTitle: "Delete expense?",
    deleteExpenseDescription:
      "This expense will be permanently removed from the business records.",
    delete: "Delete",
    searchPlaceholder: "Search expenses...",
    descriptionPlaceholder: "What was this expense for?",
    amountPlaceholder: "0.00",
    descriptionRequired: "Description is required.",
    amountGreaterThanZero: "Amount must be greater than zero.",
    errors: {
      notLoggedIn: "You are not logged in",
      businessProfileNotFound:
        "Couldn't find your business profile",
      loadExpenses: "Couldn't load expenses",
      deleteExpense: "Couldn't delete expense",
      createExpense: "Couldn't create expense",
    },
    success: {
      expenseAdded: "Expense added",
      expenseDeleted: "Expense deleted",
    },
    categories: {
      supplies: "Supplies",
      utilities: "Utilities",
      maintenance: "Maintenance",
      salary: "Salary",
      other: "Other",
    },
  },

  ar: {
    title: "المصروفات",
    description: "سجّل وتابع مصروفات النشاط التجاري.",
    addExpense: "إضافة مصروف",
    totalExpensesToday: "إجمالي مصروفات اليوم",
    expenseHistory: "سجل المصروفات",
    recentBusinessExpenses: "أحدث مصروفات النشاط التجاري",
    loading: "جارٍ تحميل المصروفات...",
    noExpensesFound: "لم يتم العثور على مصروفات",
    noExpensesDescription:
      "أضف مصروفًا لبدء تتبع تكاليف النشاط التجاري.",
    expense: "المصروف",
    category: "الفئة",
    descriptionLabel: "الوصف",
    amount: "المبلغ",
    amountLyd: "المبلغ (LYD)",
    recordedBy: "سجله",
    manager: "المدير",
    addExpenseTitle: "إضافة مصروف",
    addExpenseDescription:
      "سجّل مصروفًا خاصًا بالنشاط التجاري.",
    cancel: "إلغاء",
    saveExpense: "حفظ المصروف",
    saving: "جارٍ الحفظ...",
    deleteExpense: "حذف المصروف",
    deleteExpenseTitle: "حذف المصروف؟",
    deleteExpenseDescription:
      "سيتم حذف هذا المصروف نهائيًا من سجلات النشاط التجاري.",
    delete: "حذف",
    searchPlaceholder: "ابحث في المصروفات...",
    descriptionPlaceholder: "ما سبب هذا المصروف؟",
    amountPlaceholder: "0.00",
    descriptionRequired: "الوصف مطلوب.",
    amountGreaterThanZero: "يجب أن يكون المبلغ أكبر من صفر.",
    errors: {
      notLoggedIn: "لم يتم تسجيل الدخول",
      businessProfileNotFound:
        "تعذر العثور على ملف نشاطك التجاري",
      loadExpenses: "تعذر تحميل المصروفات",
      deleteExpense: "تعذر حذف المصروف",
      createExpense: "تعذر إنشاء المصروف",
    },
    success: {
      expenseAdded: "تمت إضافة المصروف",
      expenseDeleted: "تم حذف المصروف",
    },
    categories: {
      supplies: "المستلزمات",
      utilities: "الخدمات",
      maintenance: "الصيانة",
      salary: "الرواتب",
      other: "أخرى",
    },
  },
}
