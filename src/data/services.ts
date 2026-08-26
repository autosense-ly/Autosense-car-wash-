import type { Service } from "@/types/service"

export const initialServices: Service[] = [
  {
    id: "full-wash",
    name: "Full Wash",
    description: "Interior and exterior wash",
    pricingType: "fixed",
    price: 35,
    duration: 60,
    active: true,
    fields: [],
  },

  {
    id: "interior",
    name: "Interior",
    description: "Interior cleaning",
    pricingType: "fixed",
    price: 15,
    duration: 45,
    active: true,
    fields: [],
  },

  {
    id: "exterior",
    name: "Exterior",
    description: "Exterior wash",
    pricingType: "fixed",
    price: 15,
    duration: 30,
    active: true,
    fields: [],
  },

  {
    id: "oil-change",
    name: "Oil Change",
    description: "Engine oil replacement",
    pricingType: "quantity",
    price: 30,
    unitName: "liter",
    duration: 45,
    active: true,

    fields: [
      {
        id: "oil-brand",
        name: "brand",
        label: "Oil Brand",
        type: "text",
        required: false,
      },
      {
        id: "oil-grade",
        name: "grade",
        label: "Oil Grade",
        type: "text",
        required: false,
      },
      {
        id: "oil-quantity",
        name: "quantity",
        label: "Quantity",
        type: "number",
        required: true,
        unit: "liter",
      },
      {
        id: "oil-price",
        name: "pricePerLiter",
        label: "Price per Liter",
        type: "number",
        required: true,
        unit: "LYD",
      },
    ],
  },
]
