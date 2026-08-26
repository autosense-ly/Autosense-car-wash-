export type PaymentMethod =
  | "cash"
  | "card"

export type PaymentStatus =
  | "collected"
  | "refunded"

export type Payment = {
  id: string

  jobId: string

  amount: number

  method: PaymentMethod

  status: PaymentStatus

  createdAt: string
}
