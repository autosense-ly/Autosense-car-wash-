export const signupTranslations = {
  en: {
    noSession:
      'Account created, but no active session — check that "Confirm email" is turned off in Supabase.',
  },
  ar: {
    noSession:
      'تم إنشاء الحساب، ولكن لا توجد جلسة نشطة — تحقق من إيقاف "تأكيد البريد الإلكتروني" في Supabase.',
  },
} as const

export type SignupTranslations =
  (typeof signupTranslations)[keyof typeof signupTranslations]
