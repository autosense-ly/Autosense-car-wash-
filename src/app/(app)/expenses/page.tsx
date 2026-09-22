"use client"

import { useEffect, useMemo, useState } from "react"
import {
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/language-provider"
import {
  expensesTranslations,
  type ExpenseCategory,
} from "@/lib/i18n/expenses"

type ExpenseRow = {
  id: string
  business_id: string
  category: ExpenseCategory
  name: string
  unit: string | null
  quantity: number | string
  amount: number | string
  expense_date: string
  notes: string | null
  created_by: string | null
  created_at: string
}

function toNumber(value: number | string | null | undefined) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function getTodayRange() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export default function ExpensesPage() {
  const { language } = useLanguage()
  const t = expensesTranslations[language]

  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(
    null,
  )
  const [category, setCategory] =
    useState<ExpenseCategory>("supplies")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [recordedBy, setRecordedBy] = useState(t.manager)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const categoryLabels = t.categories

  async function loadExpenses() {
    setLoading(true)

    try {
      const supabase = createClient()

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        throw new Error(t.errors.notLoggedIn)
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("app_users")
        .select("business_id, name")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile) {
        throw new Error(t.errors.businessProfileNotFound)
      }

      setRecordedBy(profile.name || t.manager)

      const {
        data,
        error: expensesError,
      } = await supabase
        .from("expenses")
        .select(
          "id, business_id, category, name, unit, quantity, amount, expense_date, notes, created_by, created_at",
        )
        .eq("business_id", profile.business_id)
        .order("created_at", { ascending: false })

      if (expensesError) {
        throw new Error(
          `${t.errors.loadExpenses}: ${expensesError.message}`,
        )
      }

      setExpenses((data as ExpenseRow[]) ?? [])
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t.errors.loadExpenses,
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return expenses
    }

    return expenses.filter((expense) =>
      [
        expense.id,
        categoryLabels[expense.category],
        expense.name,
        expense.notes,
        expense.amount,
        expense.created_by,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    )
  }, [expenses, search, categoryLabels])

  const totalExpensesToday = useMemo(() => {
    const { start, end } = getTodayRange()
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()

    return expenses.reduce((sum, expense) => {
      const expenseTime = new Date(
        expense.expense_date,
      ).getTime()

      if (expenseTime >= startTime && expenseTime < endTime) {
        return sum + toNumber(expense.amount)
      }

      return sum
    }, 0)
  }, [expenses])

  async function handleDeleteExpense() {
    if (!deleteTarget) {
      return
    }

    try {
      const supabase = createClient()

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        throw new Error(t.errors.notLoggedIn)
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("app_users")
        .select("business_id")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile) {
        throw new Error(t.errors.businessProfileNotFound)
      }

      const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", deleteTarget)
        .eq("business_id", profile.business_id)

      if (deleteError) {
        throw new Error(
          `${t.errors.deleteExpense}: ${deleteError.message}`,
        )
      }

      setExpenses((current) =>
        current.filter(
          (expense) => expense.id !== deleteTarget,
        ),
      )

      setDeleteTarget(null)
      toast.success(t.success.expenseDeleted)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t.errors.deleteExpense,
      )
    }
  }

  function resetForm() {
    setCategory("supplies")
    setDescription("")
    setAmount("")
    setError("")
  }

  async function handleCreateExpense() {
    setError("")

    const numericAmount = Number(amount)

    if (!description.trim()) {
      setError(t.descriptionRequired)
      return
    }

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(t.amountGreaterThanZero)
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        throw new Error(t.errors.notLoggedIn)
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("app_users")
        .select("business_id, name")
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile) {
        throw new Error(t.errors.businessProfileNotFound)
      }

      const {
        data,
        error: insertError,
      } = await supabase
        .from("expenses")
        .insert({
          business_id: profile.business_id,
          category,
          name: description.trim(),
          unit: null,
          quantity: 1,
          amount: numericAmount,
          expense_date: new Date().toISOString(),
          notes: null,
          created_by: authData.user.id,
        })
        .select(
          "id, business_id, category, name, unit, quantity, amount, expense_date, notes, created_by, created_at",
        )
        .single()

      if (insertError || !data) {
        throw new Error(
          insertError
            ? `${t.errors.createExpense}: ${insertError.message}`
            : t.errors.createExpense,
        )
      }

      setExpenses((current) => [
        data as ExpenseRow,
        ...current,
      ])

      setRecordedBy(profile.name || t.manager)
      resetForm()
      setDialogOpen(false)

      toast.success(t.success.expenseAdded)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.errors.createExpense,
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="space-y-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t.title}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {t.description}
            </p>
          </div>

          <Button
            onClick={() => {
              setError("")
              setDialogOpen(true)
            }}
            className="h-10 w-full gap-2 rounded-xl bg-blue-600 px-4 shadow-sm hover:bg-blue-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {t.addExpense}
          </Button>
        </section>

        <Card size="sm" className="premium-hover">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Receipt className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {t.totalExpensesToday}
                </p>

                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {totalExpensesToday.toFixed(2)} LYD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="premium-hover">
          <CardHeader className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <CardTitle className="text-[15px] font-semibold">
                {t.expenseHistory}
              </CardTitle>

              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t.recentBusinessExpenses}
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder={t.searchPlaceholder}
                className="h-10 rounded-xl border-border/70 bg-background ps-9 text-sm shadow-none focus-visible:ring-2"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-sm text-muted-foreground">
                {t.loading}
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center">
                <div className="max-w-sm">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Receipt className="h-5 w-5" />
                  </div>

                  <p className="mt-4 text-sm font-semibold">
                    {t.noExpensesFound}
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    {t.noExpensesDescription}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border/70 bg-muted/20 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      <th className="px-4 py-3 sm:px-5">
                        {t.expense}
                      </th>

                      <th className="px-4 py-3 sm:px-5">
                        {t.category}
                      </th>

                      <th className="px-4 py-3 sm:px-5">
                        {t.descriptionLabel}
                      </th>

                      <th className="px-4 py-3 sm:px-5">
                        {t.amount}
                      </th>

                      <th className="px-4 py-3 sm:px-5">
                        {t.recordedBy}
                      </th>

                      <th className="w-12 px-4 py-3 sm:px-5" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border/60">
                    {filteredExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="transition-colors hover:bg-muted/25"
                      >
                        <td className="px-4 py-3.5 sm:px-5">
                          <p className="text-[13px] font-semibold">
                            #{expense.id.slice(0, 8)}
                          </p>

                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {new Date(
                              expense.created_at,
                            ).toLocaleTimeString(
                              language === "ar"
                                ? "ar-LY"
                                : "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 sm:px-5">
                          <Badge
                            variant="outline"
                            className="rounded-full px-2.5 py-0.5 text-[10px]"
                          >
                            {categoryLabels[expense.category]}
                          </Badge>
                        </td>

                        <td className="max-w-[260px] px-4 py-3.5 text-[13px] sm:px-5">
                          <p className="truncate">
                            {expense.name}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 text-[13px] font-semibold sm:px-5">
                          {toNumber(expense.amount).toFixed(2)} LYD
                        </td>

                        <td className="px-4 py-3.5 text-[12px] sm:px-5">
                          {expense.created_by === null
                            ? "—"
                            : recordedBy}
                        </td>

                        <td className="px-4 py-3.5 text-right sm:px-5">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t.deleteExpense}
                            onClick={() =>
                              setDeleteTarget(expense.id)
                            }
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)

            if (!open) {
              resetForm()
            }
          }}
        >
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {t.addExpenseTitle}
              </DialogTitle>

              <DialogDescription>
                {t.addExpenseDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="expense-category">
                  {t.category}
                </Label>

                <Select
                  value={category}
                  onValueChange={(value) =>
                    setCategory(value as ExpenseCategory)
                  }
                >
                  <SelectTrigger
                    id="expense-category"
                    className="h-10 w-full rounded-xl"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="supplies">
                      {t.categories.supplies}
                    </SelectItem>

                    <SelectItem value="utilities">
                      {t.categories.utilities}
                    </SelectItem>

                    <SelectItem value="maintenance">
                      {t.categories.maintenance}
                    </SelectItem>

                    <SelectItem value="salary">
                      {t.categories.salary}
                    </SelectItem>

                    <SelectItem value="other">
                      {t.categories.other}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-description">
                  {t.descriptionLabel}
                </Label>

                <Textarea
                  id="expense-description"
                  placeholder={t.descriptionPlaceholder}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  className="min-h-24 resize-none rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-amount">
                  {t.amountLyd}
                </Label>

                <Input
                  id="expense-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={t.amountPlaceholder}
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-recorded-by">
                  {t.recordedBy}
                </Label>

                <Input
                  id="expense-recorded-by"
                  value={recordedBy}
                  readOnly
                  className="h-10 rounded-xl bg-muted/40"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
                className="rounded-xl"
              >
                {t.cancel}
              </Button>

              <Button
                onClick={handleCreateExpense}
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {saving ? t.saving : t.saveExpense}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null)
            }
          }}
        >
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t.deleteExpenseTitle}
              </AlertDialogTitle>

              <AlertDialogDescription>
                {t.deleteExpenseDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                {t.cancel}
              </AlertDialogCancel>

              <AlertDialogAction
                className="rounded-xl bg-red-600 hover:bg-red-700"
                onClick={handleDeleteExpense}
              >
                {t.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
