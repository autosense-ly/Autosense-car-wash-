"use client"

import { Car, Phone, Plus, Search, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const customers = [
  {
    name: "Ahmed Ali",
    phone: "091 234 5678",
    cars: 2,
    visits: 14,
    lastVisit: "Today",
  },
  {
    name: "Omar Hassan",
    phone: "092 456 7890",
    cars: 1,
    visits: 8,
    lastVisit: "Yesterday",
  },
  {
    name: "Mohammed Salem",
    phone: "091 777 1234",
    cars: 3,
    visits: 21,
    lastVisit: "Aug 18",
  },
  {
    name: "Khaled Omar",
    phone: "094 555 8821",
    cars: 1,
    visits: 5,
    lastVisit: "Aug 15",
  },
]

export default function CustomersPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Customers
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Customer records and visit history.
          </p>
        </div>

        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search customer or phone..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {customers.map((customer) => (
          <Card
            key={customer.phone}
            className="transition-shadow hover:shadow-sm"
          >
            <CardContent className="p-5">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold">
                      {customer.name}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </p>
                  </div>

                </div>

              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">

                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">
                    Cars
                  </p>
                  <p className="mt-1 font-semibold">
                    {customer.cars}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">
                    Visits
                  </p>
                  <p className="mt-1 font-semibold">
                    {customer.visits}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">
                    Last
                  </p>
                  <p className="mt-1 text-xs font-semibold">
                    {customer.lastVisit}
                  </p>
                </div>

              </div>

              <Button variant="outline" className="mt-4 w-full">
                View Customer
              </Button>

            </CardContent>
          </Card>
        ))}

      </div>

    </div>
  )
}
