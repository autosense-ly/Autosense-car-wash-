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
    <div className="group flex items-center gap-3 border-b border-border/60 px-4 py-3.5 transition-colors last:border-0 hover:bg-muted/30 sm:gap-4 sm:px-5">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[13px] font-semibold sm:text-sm">
            {vehicle}
          </p>

          <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:inline">
            #{id}
          </span>
        </div>

        <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
          {plate}
          <span className="sm:hidden"> · #{id}</span>
        </p>
      </div>

      <Badge
        variant="outline"
        className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium"
      >
        {status}
      </Badge>

      <div className="hidden min-w-[90px] text-right sm:block">
        <p className="text-[13px] font-semibold">
          {total.toFixed(2)} LYD
        </p>

        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {paymentStatus}
        </p>
      </div>

      <Link href={`/jobs/${id}`} className="shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground transition-colors group-hover:text-foreground"
          aria-label={`Open job ${id}`}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
