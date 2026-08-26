import type { Job } from "@/lib/types/job"

type CreateJobInput = {
  vehicle: string
  plate: string
  customerName: string
  customerPhone: string
  worker: string
  position: string
  notes: string
  services: {
    serviceId: string
    details?: {
      brand: string
      grade: string
      quantity: number
      pricePerLiter: number
    }
  }[]
}

type ServiceCatalogItem = {
  id: string
  name: string
  pricingType: "fixed" | "quantity" | "custom"
  price: number
}

export function buildJobPayload(
  input: CreateJobInput,
  serviceCatalog: ServiceCatalogItem[]
): Job {
  const services = input.services.map((selected) => {
    const service = serviceCatalog.find(
      (item) => item.id === selected.serviceId
    )

    if (!service) {
      throw new Error(
        `Service ${selected.serviceId} not found`
      )
    }

    const details = selected.details

    let total = service.price

    if (service.pricingType === "quantity") {
      if (!details) {
        throw new Error(
          `Details are required for quantity-based service ${service.id}`
        )
      }

      total = details.quantity * details.pricePerLiter
    }

    return {
      serviceId: service.id,
      name: service.name,
      pricingType: service.pricingType,
      price: service.price,
      total,
      details,
    }
  })

  const subtotal = services.reduce(
    (sum, service) => sum + service.total,
    0
  )

  return {
    id: `JOB-${Date.now()}`,
    vehicle: input.vehicle,
    plate: input.plate,
    customerName: input.customerName || undefined,
    customerPhone: input.customerPhone || undefined,
    worker: input.worker || undefined,
    position: input.position || undefined,
    notes: input.notes || undefined,
    services,
    subtotal,
    total: subtotal,
    status: "waiting",
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
