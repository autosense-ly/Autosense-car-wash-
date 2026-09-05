"use client"

import { useState } from "react"
import { ArrowLeft, Pencil, Plus, Trash2, Wrench } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { Service, PricingType } from "@/types/service"
import { initialServices } from "@/data/services"

export default function ServicesSettingsPage() {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [editing, setEditing] = useState<Service | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [pricingType, setPricingType] = useState<PricingType>("fixed")
  const [price, setPrice] = useState("")
  const [unitName, setUnitName] = useState("")
  const [duration, setDuration] = useState("")

  function resetForm() {
    setName("")
    setDescription("")
    setPricingType("fixed")
    setPrice("")
    setUnitName("")
    setDuration("")
    setEditing(null)
    setShowForm(false)
  }

  function openNew() {
    resetForm()
    setShowForm(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setName(service.name)
    setDescription(service.description)
    setPricingType(service.pricingType)
    setPrice(String(service.price))
    setUnitName(service.unitName || "")
    setDuration(service.duration ? String(service.duration) : "")
    setShowForm(true)
  }

  function saveService() {
    if (!name.trim()) return

    const service: Service = {
      id: editing?.id || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      pricingType,
      price: Number(price) || 0,
      unitName: pricingType === "quantity" ? unitName.trim() : undefined,
      duration: Number(duration) || undefined,
      active: editing?.active ?? true,
      fields: editing?.fields ?? [],
    }

    if (editing) {
      setServices((current) =>
        current.map((item) =>
          item.id === editing.id ? service : item
        )
      )
    } else {
      setServices((current) => [...current, service])
    }

    resetForm()
  }

  function deactivateService(id: string) {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? { ...service, active: false }
          : service
      )
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] space-y-6 p-4 lg:p-6">

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-semibold">
              Services
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Configure the services your car wash provides.
            </p>
          </div>

        </div>

        <Button
          onClick={openNew}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Service
        </Button>

      </div>

      {showForm && (
        <Card>

          <CardHeader>
            <CardTitle className="text-base">
              {editing ? "Edit Service" : "New Service"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Oil Change"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what this service includes."
              />
            </div>

            <div className="space-y-2">
              <Label>Pricing Type</Label>

              <select
                value={pricingType}
                onChange={(event) =>
                  setPricingType(event.target.value as PricingType)
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="fixed">
                  Fixed price
                </option>

                <option value="quantity">
                  Quantity based
                </option>

                <option value="custom">
                  Custom price
                </option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="space-y-2">
                <Label>
  {pricingType === "quantity"
    ? "Default price per unit"
    : "Price"}
</Label>

                <Input
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0"
                />
              </div>

              {pricingType === "quantity" && (
                <div className="space-y-2">
                  <Label>Billing Unit</Label>

                  <Input
                    value={unitName}
                    onChange={(event) => setUnitName(event.target.value)}
                    placeholder="e.g. liter, item, meter"
                  />
                </div>
              )}

            </div>

            <div className="space-y-2">

              <Label>
                Expected Duration (minutes)
              </Label>

              <Input
                type="number"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="60"
              />

            </div>

            <div className="flex gap-2">

              <Button
                onClick={saveService}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editing ? "Save Changes" : "Create Service"}
              </Button>

              <Button
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>

            </div>

          </CardContent>

        </Card>
      )}

      <Card>

        <CardHeader>
          <CardTitle className="text-base">
            Your Services
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">

          {services.map((service) => (

            <div
              key={service.id}
              className={`flex items-center gap-4 rounded-lg border p-4 ${
                !service.active ? "opacity-50" : ""
              }`}
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Wrench className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="font-medium">
                  {service.name}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {service.pricingType === "quantity"
                    ? `${service.price} LYD / ${service.unitName || "unit"}`
                    : `${service.price} LYD`}
                  {service.duration
                    ? ` · ${service.duration} min`
                    : ""}
                </p>
                {(service.fields ?? []).length > 0 && (
                  <p className="mt-1 text-xs text-blue-600">
                    Requires details when added to a job
                  </p>
                )}

              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(service)}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              {service.active && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deactivateService(service.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}

            </div>

          ))}

        </CardContent>

      </Card>

    </div>
  )
}



