"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Calculator, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NumberField, ResultCard } from "@/components/deal-fields"
import { formatCurrency } from "@/lib/deal-analyzer"

type Condition = "poor" | "average" | "updated" | "renovated"

interface Comparable {
  id: number
  address: string
  soldPrice: number
  sqft: number
  beds: number
  baths: number
  yearBuilt: number
  condition: Condition
  distance: number
}

interface SubjectProperty {
  sqft: number
  beds: number
  baths: number
  yearBuilt: number
  condition: Condition
}

interface ArvCompsAnalyzerProps {
  onUseArv: (arv: number) => void
}

const CONDITION_LABELS: Record<Condition, string> = {
  poor: "Poor",
  average: "Average",
  updated: "Updated",
  renovated: "Fully Renovated",
}

const CONDITION_SCORE: Record<Condition, number> = {
  poor: 1,
  average: 2,
  updated: 3,
  renovated: 4,
}

const EMPTY_COMP: Comparable = {
  id: 1,
  address: "",
  soldPrice: 0,
  sqft: 0,
  beds: 0,
  baths: 0,
  yearBuilt: 0,
  condition: "updated",
  distance: 0,
}

export function ArvCompsAnalyzer({ onUseArv }: ArvCompsAnalyzerProps) {
  const [subject, setSubject] = useState<SubjectProperty>({
    sqft: 0,
    beds: 0,
    baths: 0,
    yearBuilt: 0,
    condition: "renovated",
  })

  const [comps, setComps] = useState<Comparable[]>([
    { ...EMPTY_COMP, id: 1 },
    { ...EMPTY_COMP, id: 2 },
    { ...EMPTY_COMP, id: 3 },
  ])

  const [acceptedNotice, setAcceptedNotice] = useState(false)

  function updateSubject(next: Partial<SubjectProperty>) {
    setSubject((prev) => ({ ...prev, ...next }))
  }

  function updateComp(id: number, next: Partial<Comparable>) {
    setComps((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, ...next } : comp)),
    )
  }

  function addComp() {
    if (comps.length >= 5) return

    const nextId = Math.max(...comps.map((comp) => comp.id)) + 1
    setComps((prev) => [...prev, { ...EMPTY_COMP, id: nextId }])
  }

  function removeComp(id: number) {
    if (comps.length <= 1) return
    setComps((prev) => prev.filter((comp) => comp.id !== id))
  }

  const analysis = useMemo(() => {
    const usableComps = comps.filter((comp) => comp.soldPrice > 0 && comp.sqft > 0)

    const pricePerSqftValues = usableComps.map((comp) => comp.soldPrice / comp.sqft)
    const averagePricePerSqft =
      pricePerSqftValues.length > 0
        ? pricePerSqftValues.reduce((sum, value) => sum + value, 0) / pricePerSqftValues.length
        : 0

    const averageSoldPrice =
      usableComps.length > 0
        ? usableComps.reduce((sum, comp) => sum + comp.soldPrice, 0) / usableComps.length
        : 0

    const suggestedArv =
      subject.sqft > 0 && averagePricePerSqft > 0
        ? subject.sqft * averagePricePerSqft
        : averageSoldPrice

    const lowArv = suggestedArv * 0.95
    const highArv = suggestedArv * 1.05

    const warnings: string[] = []

    usableComps.forEach((comp, index) => {
      const label = comp.address ? comp.address : `Comp ${index + 1}`

      if (subject.sqft > 0 && comp.sqft > 0) {
        const sizeDifference = Math.abs(comp.sqft - subject.sqft) / subject.sqft
        if (sizeDifference > 0.25) {
          warnings.push(`${label} has a large sqft difference compared to the subject property.`)
        }
      }

      if (comp.distance > 1) {
        warnings.push(`${label} is more than 1 mile away.`)
      }

      if (subject.yearBuilt > 0 && comp.yearBuilt > 0) {
        const yearDifference = Math.abs(comp.yearBuilt - subject.yearBuilt)
        if (yearDifference > 20) {
          warnings.push(`${label} has a large year-built difference.`)
        }
      }

      if (comp.beds > 0 && subject.beds > 0 && Math.abs(comp.beds - subject.beds) >= 2) {
        warnings.push(`${label} has a large bedroom count difference.`)
      }

      if (comp.baths > 0 && subject.baths > 0 && Math.abs(comp.baths - subject.baths) >= 1.5) {
        warnings.push(`${label} has a large bathroom count difference.`)
      }

      if (CONDITION_SCORE[comp.condition] < CONDITION_SCORE[subject.condition] - 1) {
        warnings.push(`${label} appears to be in lower condition than the target condition.`)
      }
    })

    let confidence: "Low" | "Medium" | "High" = "Low"

    if (usableComps.length >= 4 && warnings.length <= 2) {
      confidence = "High"
    } else if (usableComps.length >= 3 && warnings.length <= 4) {
      confidence = "Medium"
    }

    return {
      usableComps,
      averagePricePerSqft,
      suggestedArv,
      lowArv,
      highArv,
      confidence,
      warnings,
    }
  }, [comps, subject])

  const canUseArv = acceptedNotice && analysis.suggestedArv > 0

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-foreground" />
          <CardTitle className="text-lg">ARV Comps Analyzer</CardTitle>
        </div>
        <CardDescription>
          Optional tool. You can still enter your ARV manually without using this section.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4" />
            Important Notice
          </div>
          <p>
            The suggested ARV is only an estimate based on the comparable values entered by the user.
            Money Flip does not verify, guarantee, or certify the accuracy of the data entered.
            This tool is for educational and analysis purposes only. Money Flip is not responsible
            for investment decisions, offers, losses, or outcomes based on this estimate.
          </p>
        </div>

        <div className="rounded-lg border border-border/60 p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Subject Property</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              id="arv-subject-sqft"
              label="Subject Sqft"
              value={subject.sqft}
              onValueChange={(v) => updateSubject({ sqft: v })}
            />
            <NumberField
              id="arv-subject-beds"
              label="Subject Beds"
              value={subject.beds}
              onValueChange={(v) => updateSubject({ beds: v })}
            />
            <NumberField
              id="arv-subject-baths"
              label="Subject Baths"
              value={subject.baths}
              onValueChange={(v) => updateSubject({ baths: v })}
            />
            <NumberField
              id="arv-subject-year"
              label="Subject Year Built"
              value={subject.yearBuilt}
              onValueChange={(v) => updateSubject({ yearBuilt: v })}
            />

            <div className="flex flex-col gap-2">
              <label
                htmlFor="arv-subject-condition"
                className="text-sm font-medium text-foreground"
              >
                Target Condition
              </label>
              <select
                id="arv-subject-condition"
                value={subject.condition}
                onChange={(event) =>
                  updateSubject({ condition: event.target.value as Condition })
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {comps.map((comp, index) => (
            <div key={comp.id} className="rounded-lg border border-border/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Comparable {index + 1}</p>

                {comps.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeComp(comp.id)}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="mb-4 flex flex-col gap-2">
                <label
                  htmlFor={`arv-comp-address-${comp.id}`}
                  className="text-sm font-medium text-foreground"
                >
                  Address
                </label>
                <input
                  id={`arv-comp-address-${comp.id}`}
                  value={comp.address}
                  onChange={(event) => updateComp(comp.id, { address: event.target.value })}
                  placeholder="123 Main St"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumberField
                  id={`arv-comp-sold-${comp.id}`}
                  label="Sold Price"
                  prefix="$"
                  value={comp.soldPrice}
                  onValueChange={(v) => updateComp(comp.id, { soldPrice: v })}
                />
                <NumberField
                  id={`arv-comp-sqft-${comp.id}`}
                  label="Sqft"
                  value={comp.sqft}
                  onValueChange={(v) => updateComp(comp.id, { sqft: v })}
                />
                <NumberField
                  id={`arv-comp-beds-${comp.id}`}
                  label="Beds"
                  value={comp.beds}
                  onValueChange={(v) => updateComp(comp.id, { beds: v })}
                />
                <NumberField
                  id={`arv-comp-baths-${comp.id}`}
                  label="Baths"
                  value={comp.baths}
                  onValueChange={(v) => updateComp(comp.id, { baths: v })}
                />
                <NumberField
                  id={`arv-comp-year-${comp.id}`}
                  label="Year Built"
                  value={comp.yearBuilt}
                  onValueChange={(v) => updateComp(comp.id, { yearBuilt: v })}
                />
                <NumberField
                  id={`arv-comp-distance-${comp.id}`}
                  label="Distance"
                  suffix="mi"
                  value={comp.distance}
                  onValueChange={(v) => updateComp(comp.id, { distance: v })}
                />

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={`arv-comp-condition-${comp.id}`}
                    className="text-sm font-medium text-foreground"
                  >
                    Condition
                  </label>
                  <select
                    id={`arv-comp-condition-${comp.id}`}
                    value={comp.condition}
                    onChange={(event) =>
                      updateComp(comp.id, { condition: event.target.value as Condition })
                    }
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  >
                    {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <Button type="button" variant="outline" onClick={addComp} disabled={comps.length >= 5}>
            <Plus className="size-4" />
            Add Comparable
          </Button>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
          <p className="mb-3 text-sm font-medium text-foreground">ARV Result</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="Suggested ARV"
              value={formatCurrency(analysis.suggestedArv)}
              hint="Based on average comp price per sqft"
              emphasis="primary"
            />
            <ResultCard
              label="Average $/Sqft"
              value={formatCurrency(analysis.averagePricePerSqft)}
              hint={`${analysis.usableComps.length} comparable(s) used`}
            />
            <ResultCard label="Low ARV" value={formatCurrency(analysis.lowArv)} hint="-5%" />
            <ResultCard label="High ARV" value={formatCurrency(analysis.highArv)} hint="+5%" />
            <ResultCard
              label="Confidence"
              value={analysis.confidence}
              hint="Based on comp count and similarity"
            />
          </div>

          {analysis.warnings.length > 0 && (
            <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
              <p className="mb-2 font-semibold">Review these comps:</p>
              <ul className="list-inside list-disc space-y-1">
                {analysis.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <label className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={acceptedNotice}
              onChange={(event) => setAcceptedNotice(event.target.checked)}
              className="mt-1"
            />
            <span>
              I understand this ARV is only an estimate and I am responsible for verifying the
              numbers before making any offer or investment decision.
            </span>
          </label>

          <div className="mt-4">
            <Button
              type="button"
              onClick={() => onUseArv(Math.round(analysis.suggestedArv))}
              disabled={!canUseArv}
            >
              Use Suggested ARV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}