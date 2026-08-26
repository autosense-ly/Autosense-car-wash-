"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type JobRowProps = {
  id: string
  vehicle: string
  plate: string
  total: number
  status: string
  paymentStatus: string
}

export function JobRow({
  id,
  vehicle,
  plate,
  total,
  status,
  paymentStatus,
}: JobRowProps) {
  return (
    <div className="flex items-center gap-4 border-b px-4 py-4 last:border-0">

      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {vehicle}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {plate} · {id}
        </p>
      </div>

      <Badge variant="outline">
        {status}
      </Badge>

      <div className="hidden text-right sm:block">
        <p className="font-medium">
          {total.toFixed(2)} LYD
        </p>

        <p className="text-xs text-muted-foreground">
          {paymentStatus}
        </p>
      </div>

      <Link href={`/jobs/${id}`}>
        <Button variant="ghost" size="icon">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>

    </div>
  )
}
