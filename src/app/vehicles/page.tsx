"use client"

import { Car, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const vehicles = [
  {
    plate: "ABC-123",
    make: "Toyota",
    model: "Camry",
    year: "2021",
    owner: "Ahmed Ali",
    visits: 14,
  },
  {
    plate: "TRP-442",
    make: "BMW",
    model: "5 Series",
    year: "2020",
    owner: "Omar Hassan",
    visits: 8,
  },
  {
    plate: "LY-881",
    make: "Toyota",
    model: "Corolla",
    year: "2019",
    owner: "Mohammed Salem",
    visits: 21,
  },
  {
    plate: "TR-209",
    make: "Mercedes-Benz",
    model: "C-Class",
    year: "2022",
    owner: "Khaled Omar",
    visits: 5,
  },
]

export default function VehiclesPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Vehicles
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Vehicles registered with your car wash.
          </p>
        </div>

        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>

      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search plate, vehicle or owner..."
              className="pl-9"
            />

          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {vehicles.map((vehicle) => (
          <Card key={vehicle.plate}>

            <CardContent className="p-5">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Car className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <p className="font-semibold">
                        {vehicle.make} {vehicle.model}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {vehicle.year}
                      </p>
                    </div>

                    <span className="rounded-md border px-2 py-1 text-xs font-medium">
                      {vehicle.plate}
                    </span>

                  </div>

                  <div className="mt-5 space-y-2">

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Owner
                      </span>
                      <span className="font-medium">
                        {vehicle.owner}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Visits
                      </span>
                      <span className="font-medium">
                        {vehicle.visits}
                      </span>
                    </div>

                  </div>

                </div>

              </div>

            </CardContent>

          </Card>
        ))}

      </div>

    </div>
  )
}
