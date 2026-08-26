export type PricingType = "fixed" | "quantity" | "custom"

export type ServiceFieldType =
  | "text"
  | "number"
  | "select"
  | "textarea"

export type ServiceField = {
  id: string
  name: string
  label: string
  type: ServiceFieldType
  required: boolean
  unit?: string
  options?: string[]
}

export type Service = {
  id: string
  name: string
  description: string
  pricingType: PricingType
  price: number
  unitName?: string
  duration?: number
  active: boolean
  fields: ServiceField[]
}
