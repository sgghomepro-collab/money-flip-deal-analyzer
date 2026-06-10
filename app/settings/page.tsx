"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Check, RotateCcw, Save } from "lucide-react"
import { NumberField } from "@/components/deal-fields"
import { DEFAULT_ASSUMPTIONS, type DefaultAssumptions } from "@/lib/mock-data"

const FIELDS: { key: keyof DefaultAssumptions; label: string; hint?: string }[] = [
  { key: "discountPercent", label: "Default Discount %" },
  { key: "hmlDownPaymentPercent", label: "Default HML Down Payment %" },
  { key: "hmlPointsPercent", label: "Default HML Points %" },
  { key: "hmlRatePercent", label: "Default HML Rate %" },
  { key: "purchaseClosingPercent", label: "Default Purchase Closing Cost %" },
  { key: "realtorPercent", label: "Default Realtor Cost %" },
  { key: "saleClosingPercent", label: "Default Sale Closing Cost %" },
  { key: "minRoiPercent", label: "Default Minimum ROI %" },
]

export default function SettingsPage() {
  const [values, setValues] = useState<DefaultAssumptions>(DEFAULT_ASSUMPTIONS)
  const [saved, setSaved] = useState(false)

  function set(key: keyof DefaultAssumptions, value: number) {
    setSaved(false)
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
  }

  function handleReset() {
    setValues(DEFAULT_ASSUMPTIONS)
    setSaved(false)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Default Money Flip assumptions used when starting a new analysis.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Default Assumptions</CardTitle>
          <CardDescription>
            These defaults will pre-fill future analyses once saving is connected.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <NumberField
                key={field.key}
                id={`setting-${field.key}`}
                label={field.label}
                suffix="%"
                allowDecimal
                value={values[field.key]}
                onValueChange={(v) => set(field.key, v)}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave} variant={saved ? "secondary" : "default"}>
              {saved ? <Check className="size-4" /> : <Save className="size-4" />}
              Save Settings
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="size-4" />
              Reset to Defaults
            </Button>
            {saved ? (
              <span role="status" className="text-sm font-medium text-success">
                Settings saved locally for now. Database connection coming next.
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
