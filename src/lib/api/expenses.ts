import type { Expense, ExpenseCategory } from "@/lib/types/expense"

let expenses: Expense[] = []

export function getExpenses() {
  return expenses
}

export function getExpense(id: string) {
  return expenses.find((expense) => expense.id === id)
}

export function createExpense(input: {
  category: ExpenseCategory
  description: string
  amount: number
  recordedBy: string
}) {
  if (input.amount <= 0) {
    throw new Error("Expense amount must be greater than zero")
  }

  const expense: Expense = {
    id: `EXP-${Date.now()}`,
    category: input.category,
    description: input.description,
    amount: input.amount,
    recordedBy: input.recordedBy,
    createdAt: new Date().toISOString(),
  }

  expenses = [expense, ...expenses]

  return expense
}

export function deleteExpense(id: string) {
  expenses = expenses.filter((expense) => expense.id !== id)
}
