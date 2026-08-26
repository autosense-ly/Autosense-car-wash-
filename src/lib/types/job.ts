export type JobStatus =
  | "waiting"
  | "in_progress"
  | "ready"
  | "completed"
  | "cancelled"

export type JobServiceDetails = {
  brand?: string
  grade?: string
  quantity?: number
  pricePerLiter?: number
}

export type JobService = {
  serviceId: string
  name: string
  pricingType: "fixed" | "quantity" | "custom"
  price: number
  total: number
  details?: JobServiceDetails
}

export type Job = {
  id: string

  vehicle: string
  plate: string

  customerName?: string
  customerPhone?: string

  worker?: string
  position?: string
  notes?: string

  services: JobService[]

  subtotal: number
  total: number

  status: JobStatus

  paymentStatus: "unpaid" | "paid" | "partial"

  createdAt: string
  updatedAt: string
}
