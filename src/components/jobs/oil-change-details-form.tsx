"use client"

import { useState } from "react"
import { Droplets } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/lib/i18n/language-provider"
import { oilChangeTranslations } from "@/lib/i18n/oil-change"

type OilChangeDetails = {
  brand: string
  grade: string
  quantity: number
  pricePerLiter: number
}

type OilChangeDetailsProps = {
  initialValue?: OilChangeDetails
  onConfirm: (details: OilChangeDetails) => void
  onCancel: () => void
}

export function OilChangeDetailsForm({
  initialValue,
  onConfirm,
  onCancel,
}: OilChangeDetailsProps) {
  const { language } = useLanguage()
  const t = oilChangeTranslations[language]

  const [brand, setBrand] = useState(initialValue?.brand ?? "")
  const [grade, setGrade] = useState(initialValue?.grade ?? "")
  const [quantity, setQuantity] = useState(
    initialValue?.quantity ? String(initialValue.quantity) : "",
  )
  const [pricePerLiter, setPricePerLiter] = useState(
    initialValue?.pricePerLiter
      ? String(initialValue.pricePerLiter)
      : "",
  )

  const quantityNumber = Number(quantity) || 0
  const priceNumber = Number(pricePerLiter) || 0
  const total = quantityNumber * priceNumber

  const canConfirm = quantityNumber > 0 && priceNumber >= 0

  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Droplets className="h-4 w-4 text-blue-600" />
          {t.title}
        </CardTitle>

        <p className="text-xs text-muted-foreground">
          {t.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t.oilBrand}</Label>

            <Input
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder={t.oilBrandPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.oilGrade}</Label>

            <Input
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              placeholder={t.oilGradePlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.quantityLiter}</Label>

            <Input
              type="number"
              min="0"
              step="0.1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder={t.quantityPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.pricePerLiter}</Label>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={pricePerLiter}
              onChange={(event) => setPricePerLiter(event.target.value)}
              placeholder={t.pricePerLiterPlaceholder}
            />
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t.oilTotal}
            </span>

            <span className="text-xl font-semibold text-blue-600">
              {total.toFixed(2)} LYD
            </span>
          </div>

          {quantityNumber > 0 && priceNumber >= 0 && (
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {quantityNumber} L × {priceNumber.toFixed(2)} LYD
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={() =>
              onConfirm({
                brand: brand.trim(),
                grade: grade.trim(),
                quantity: quantityNumber,
                pricePerLiter: priceNumber,
              })
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t.confirm}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
