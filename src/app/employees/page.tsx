"use client"

import {
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const employees = [
  {
    name: "Owner",
    phone: "091 000 0000",
    role: "Owner",
    payment: "Owner",
    status: "Active",
  },
  {
    name: "Mohammed",
    phone: "091 111 1111",
    role: "Manager",
    payment: "Salary",
    status: "Active",
  },
  {
    name: "Ahmed",
    phone: "092 222 2222",
    role: "Worker",
    payment: "Per Job",
    status: "Active",
  },
  {
    name: "Ali",
    phone: "091 333 3333",
    role: "Worker",
    payment: "Per Job",
    status: "Active",
  },
]

function roleClass(role: string) {
  if (role === "Owner")
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"

  if (role === "Manager")
    return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"

  return "bg-muted text-muted-foreground"
}

export default function EmployeesPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 lg:p-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Employees
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage staff, roles and payment arrangements.
          </p>
        </div>

        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>

      </div>

      <Card>
        <CardContent className="p-4">

          <div className="relative max-w-md">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search employees..."
              className="pl-9"
            />

          </div>

        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {employees.map((employee) => (
          <Card key={employee.phone}>

            <CardContent className="p-5">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                    {employee.role === "Owner" ? (
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                    ) : (
                      <UserRound className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {employee.name}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {employee.phone}
                    </p>
                  </div>

                </div>

                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>

              </div>

              <div className="mt-5 flex items-center justify-between">

                <Badge className={`border-0 ${roleClass(employee.role)}`}>
                  {employee.role}
                </Badge>

                <Badge variant="outline">
                  {employee.payment}
                </Badge>

              </div>

              <div className="mt-4 text-xs text-emerald-600">
                {employee.status}
              </div>

            </CardContent>

          </Card>
        ))}

      </div>

    </div>
  )
}
