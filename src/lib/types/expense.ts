export type ExpenseCategory =
  | "supplies"
  | "utilities"
  | "maintenance"
  | "salary"
  | "other"

export type Expense = {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  recordedBy: string
  createdAt: string
}
