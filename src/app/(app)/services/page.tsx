"use client"

import { MoreHorizontal, Plus, Settings2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    name: "Full Wash",
    category: "Wash",
    price: "30 LYD",
    duration: "60-90 min",
    active: true,
  },
  {
    name: "Interior",
    category: "Wash",
    price: "15 LYD",
    duration: "45-60 min",
    active: true,
  },
  {
    name: "Exterior",
    category: "Wash",
    price: "15 LYD",
    duration: "30-45 min",
    active: true,
  },
  {
    name: "Full Wash + Wax",
    category: "Detailing",
    price: "45 LYD",
    duration: "90 min",
    active: true,
  },
  {
    name: "Oil Change",
    category: "Maintenance",
    price: "Variable",
    duration: "30 min",
    active: true,
  },
]

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Services
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure the services your car wash offers.
          </p>
        </div>

        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>

      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {services.map((service) => (
          <Card key={service.name}>

            <CardHeader className="flex flex-row items-start justify-between">

              <div>
                <CardTitle className="text-base">
                  {service.name}
                </CardTitle>

                <p className="mt-1 text-xs text-muted-foreground">
                  {service.category}
                </p>
              </div>

              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>

            </CardHeader>

            <CardContent>

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">
                    Price
                  </p>

                  <p className="mt-1 font-semibold">
                    {service.price}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">
                    Duration
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {service.duration}
                  </p>
                </div>

              </div>

              <div className="mt-4 flex items-center justify-between">

                <Badge
                  variant={service.active ? "default" : "secondary"}
                >
                  {service.active ? "Active" : "Inactive"}
                </Badge>

                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-3.5 w-3.5" />
                  Configure
                </Button>

              </div>

            </CardContent>

          </Card>
        ))}

      </div>

    </div>
  )
}
