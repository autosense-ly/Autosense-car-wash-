"use client"

import { useRouter } from "next/navigation"

import { useMemo, useState } from "react"
import { ArrowLeft, Car, Check, Clock3, Plus, Trash2, UserRound } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { initialServices } from "@/data/services"
import { OilChangeDetailsForm } from "@/components/jobs/oil-change-details-form"
import { buildJobPayload } from "@/lib/api/job-builder"
import { createJob } from "@/lib/api/jobs"

type OilDetails = {
  brand: string
  grade: string
  quantity: number
  pricePerLiter: number
}

type SelectedService = {
  serviceId: string
  details?: OilDetails
}

export default function NewJobPage() {
  const router = useRouter()
  const [vehicle, setVehicle] = useState("")
  const [plate, setPlate] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  const [worker, setWorker] = useState("")
  const [position, setPosition] = useState("")
  const [notes, setNotes] = useState("")

  const [selectedServices, setSelectedServices] = useState<
    SelectedService[]
  >([])

  const [oilServiceOpen, setOilServiceOpen] = useState(false)

  const [editingOil, setEditingOil] = useState(false)

  const selectedServiceObjects = useMemo(() => {
    return selectedServices
      .map((selected) => {
        const service = initialServices.find(
          (item) => item.id === selected.serviceId
        )

        if (!service) return null

        return {
          service,
          selected,
        }
      })
      .filter(Boolean) as {
      service: (typeof initialServices)[number]
      selected: SelectedService
    }[]
  }, [selectedServices])

  const total = useMemo(() => {
    return selectedServiceObjects.reduce((sum, item) => {
      const { service, selected } = item

      if (
        service.id === "oil-change" &&
        selected.details
      ) {
        return (
          sum +
          selected.details.quantity *
            selected.details.pricePerLiter
        )
      }

      return sum + service.price
    }, 0)
  }, [selectedServiceObjects])

  function isSelected(serviceId: string) {
    return selectedServices.some(
      (item) => item.serviceId === serviceId
    )
  }

  function addService(serviceId: string) {
    const service = initialServices.find(
      (item) => item.id === serviceId
    )

    if (!service) return

    if (isSelected(serviceId)) {
      if (serviceId === "oil-change") {
        const existing = selectedServices.find(
          (item) => item.serviceId === serviceId
        )

        if (existing?.details) {
          setEditingOil(true)
        } else {
          setOilServiceOpen(true)
        }
      }

      return
    }

    setSelectedServices((current) => [
      ...current,
      { serviceId },
    ])

    if (service.fields.length > 0) {
      if (service.id === "oil-change") {
        setOilServiceOpen(true)
      }
    }
  }

  function removeService(serviceId: string) {
    setSelectedServices((current) =>
      current.filter(
        (item) => item.serviceId !== serviceId
      )
    )

    if (serviceId === "oil-change") {
      setOilServiceOpen(false)
      setEditingOil(false)
    }
  }

  function saveOilDetails(details: OilDetails) {
    setSelectedServices((current) =>
      current.map((item) =>
        item.serviceId === "oil-change"
          ? {
              ...item,
              details,
            }
          : item
      )
    )

    setOilServiceOpen(false)
    setEditingOil(false)
  }

  function cancelOilDetails() {
    const oilSelected = selectedServices.some(
      (item) =>
        item.serviceId === "oil-change"
    )

    const oilHasDetails = selectedServices.some(
      (item) =>
        item.serviceId === "oil-change" &&
        item.details
    )

    if (oilSelected && !oilHasDetails) {
      removeService("oil-change")
    }

    setOilServiceOpen(false)
    setEditingOil(false)
  }

  function handleCreateJob() {
    if (!vehicle.trim()) {
      alert("Please enter the vehicle.")
      return
    }

    if (!plate.trim()) {
      alert("Please enter the plate number.")
      return
    }

    if (selectedServices.length === 0) {
      alert("Please select at least one service.")
      return
    }

    const oilSelected = selectedServices.find(
      (item) =>
        item.serviceId === "oil-change"
    )

    if (
      oilSelected &&
      !oilSelected.details
    ) {
      setOilServiceOpen(true)
      return
    }

    const job = buildJobPayload({
      vehicle: vehicle.trim(),
      plate: plate.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      worker: worker.trim(),
      position: position.trim(),
      notes: notes.trim(),
      services: selectedServices,
    }, initialServices)

    createJob(job)

    alert(
      `Job created successfully.\nJob: ${job.id}\nTotal: ${job.total.toFixed(
        2
      )} LYD`
    )

    router.push(`/jobs/${job.id}`)
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 p-4 lg:p-6">

      <div className="flex items-center gap-3">

        <Link href="/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Job
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a new vehicle service job.
          </p>
        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4 text-blue-600" />
              Vehicle
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label>Vehicle</Label>

              <Input
                value={vehicle}
                onChange={(event) =>
                  setVehicle(event.target.value)
                }
                placeholder="e.g. Toyota Camry"
              />
            </div>

            <div className="space-y-2">
              <Label>Plate Number</Label>

              <Input
                value={plate}
                onChange={(event) =>
                  setPlate(event.target.value)
                }
                placeholder="e.g. 12345"
              />
            </div>

            <div className="space-y-2">
              <Label>Customer Name</Label>

              <Input
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label>Customer Phone</Label>

              <Input
                value={customerPhone}
                onChange={(event) =>
                  setCustomerPhone(event.target.value)
                }
                placeholder="Optional"
              />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Check className="h-4 w-4 text-blue-600" />
              Services
            </CardTitle>

            <p className="text-xs text-muted-foreground">
              Select one or more services.
            </p>
          </CardHeader>

          <CardContent className="space-y-3">

            {initialServices
              .filter((service) => service.active)
              .map((service) => {

                const selected = isSelected(service.id)

                const selectedData =
                  selectedServices.find(
                    (item) =>
                      item.serviceId === service.id
                  )

                const oilTotal =
                  service.id === "oil-change" &&
                  selectedData?.details
                    ? selectedData.details.quantity *
                      selectedData.details.pricePerLiter
                    : null

                return (
                  <div
                    key={service.id}
                    className={`rounded-lg border transition ${
                      selected
                        ? "border-blue-500 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/20"
                        : ""
                    }`}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        addService(service.id)
                      }
                      className="flex w-full items-center justify-between p-4 text-left"
                    >

                      <div>

                        <p className="font-medium">
                          {service.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {service.pricingType ===
                          "quantity"
                            ? service.fields.length > 0 &&
                              oilTotal !== null
                              ? `${oilTotal.toFixed(
                                  2
                                )} LYD`
                              : `${service.price} LYD / ${
                                  service.unitName ||
                                  "unit"
                                }`
                            : `${service.price} LYD`}
                        </p>

                      </div>

                      {selected ? (
                        <Badge className="bg-blue-600">
                          Selected
                        </Badge>
                      ) : (
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      )}

                    </button>

                    {selected &&
                      service.id ===
                        "oil-change" && (
                        <div className="border-t px-4 py-3">

                          {selectedData?.details ? (
                            <div className="flex items-center justify-between gap-3">

                              <div>
                                <p className="text-xs font-medium">
                                  {selectedData.details.brand ||
                                    "Oil"}{" "}
                                  {selectedData.details.grade
                                    ? `· ${selectedData.details.grade}`
                                    : ""}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {
                                    selectedData.details
                                      .quantity
                                  }{" "}
                                  L ×{" "}
                                  {
                                    selectedData.details
                                      .pricePerLiter
                                  }{" "}
                                  LYD
                                </p>
                              </div>

                              <div className="flex gap-2">

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingOil(true)
                                    setOilServiceOpen(true)
                                  }}
                                >
                                  Edit
                                </Button>

                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    removeService(
                                      "oil-change"
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>

                              </div>

                            </div>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() =>
                                setOilServiceOpen(true)
                              }
                            >
                              Enter Oil Details
                            </Button>
                          )}

                        </div>
                      )}

                    {selected &&
                      service.duration && (
                        <div className="flex items-center gap-1 border-t px-4 py-2 text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          About {service.duration} minutes
                        </div>
                      )}

                  </div>
                )
              })}

          </CardContent>
        </Card>

        {oilServiceOpen && (
          <div className="lg:col-span-2">

            <OilChangeDetailsForm
              initialValue={
                selectedServices.find(
                  (item) =>
                    item.serviceId ===
                    "oil-change"
                )?.details
              }
              onConfirm={saveOilDetails}
              onCancel={cancelOilDetails}
            />

          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Job Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label>Worker</Label>

              <Input
                value={worker}
                onChange={(event) =>
                  setWorker(event.target.value)
                }
                placeholder="Optional worker name"
              />
            </div>

            <div className="space-y-2">
              <Label>Position / Spot</Label>

              <Input
                value={position}
                onChange={(event) =>
                  setPosition(event.target.value)
                }
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label>Special Instructions</Label>

              <Textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="e.g. Do not put water on the handbrake."
              />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-blue-600" />
              Summary
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Services
                </span>

                <span>
                  {selectedServices.length}
                </span>
              </div>

              {selectedServiceObjects.map(
                ({ service, selected }) => {

                  const serviceTotal =
                    service.id === "oil-change" &&
                    selected.details
                      ? selected.details.quantity *
                        selected.details.pricePerLiter
                      : service.price

                  return (
                    <div
                      key={service.id}
                      className="flex justify-between gap-4"
                    >
                      <span className="text-muted-foreground">
                        {service.name}
                      </span>

                      <span>
                        {serviceTotal.toFixed(2)} LYD
                      </span>
                    </div>
                  )
                }
              )}

              <div className="border-t pt-3">

                <div className="flex justify-between">

                  <span className="font-medium">
                    Total
                  </span>

                  <span className="text-lg font-semibold">
                    {total.toFixed(2)} LYD
                  </span>

                </div>

              </div>

            </div>

            <Button
              onClick={handleCreateJob}
              disabled={
                selectedServices.length === 0
              }
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700"
            >
              Create Job
            </Button>

          </CardContent>
        </Card>

      </div>

    </div>
  )
}







