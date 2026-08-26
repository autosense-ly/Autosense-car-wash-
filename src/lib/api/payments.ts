import type { Payment, PaymentMethod } from "@/lib/types/payment"
import { getJob, updateJob } from "@/lib/api/jobs"

let payments: Payment[] = []

export function getPayments() {
  return payments
}

export function getPayment(id: string) {
  return payments.find((payment) => payment.id === id)
}

export function getPaymentsForJob(jobId: string) {
  return payments.filter((payment) => payment.jobId === jobId)
}

export function createPayment(input: {
  jobId: string
  amount: number
  method: PaymentMethod
}) {
  const payment: Payment = {
    id: `PAY-${Date.now()}`,
    jobId: input.jobId,
    amount: input.amount,
    method: input.method,
    status: "collected",
    createdAt: new Date().toISOString(),
  }

  payments = [payment, ...payments]

  return payment
}

export function collectPayment(input: {
  jobId: string
  amount: number
  method: PaymentMethod
}) {
  const job = getJob(input.jobId)

  if (!job) {
    throw new Error("Job not found")
  }

  const existingPayments = getPaymentsForJob(input.jobId)

  const alreadyCollected = existingPayments
    .filter((payment) => payment.status === "collected")
    .reduce((sum, payment) => sum + payment.amount, 0)

  const remaining = job.total - alreadyCollected

  if (input.amount <= 0) {
    throw new Error("Payment amount must be greater than zero")
  }

  if (input.amount > remaining) {
    throw new Error("Payment amount exceeds remaining balance")
  }

  const payment = createPayment(input)

  const newCollectedTotal = alreadyCollected + input.amount

  updateJob(input.jobId, {
    paymentStatus:
      newCollectedTotal >= job.total
        ? "paid"
        : "partial",
  })

  return payment
}
export function deletePayment(id: string) {
  payments = payments.filter((payment) => payment.id !== id)
}

