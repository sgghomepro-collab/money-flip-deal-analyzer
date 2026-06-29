"use client"

import { useMemo, useState } from "react"
import {
  analyzeWholesale,
  formatCurrency,
  formatProperty,
  WHOLESALE_DEFAULTS,
  type PropertyInfo,
  type WholesaleInputs,
} from "@/lib/deal-analyzer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NumberField, ResultCard, YellowNotice } from "@/components/deal-fields"
import { CoachNotes, OfferEmail } from "@/components/deal-shared"
import { ArvCompsAnalyzer } from "@/components/arv-comps-analyzer"

export function WholesalePanel({ property }: { property: PropertyInfo }) {
  const [inputs, setInputs] = useState<WholesaleInputs>(WHOLESALE_DEFAULTS)
  const [summaryCopied, setSummaryCopied] = useState(false)
  const results = useMemo(() => analyzeWholesale(inputs), [inputs])

  function set(next: Partial<WholesaleInputs>) {
    setInputs((prev) => ({ ...prev, ...next }))
  }

  async function copySummary() {
    const propertyAddress = formatProperty(property, "Property not entered")

    const summary = [
      "Money Flip - Wholesaling Summary",
      "",
      `Property: ${propertyAddress}`,
      `Strategy: Wholesaling`,
      "",
      `ARV: ${formatCurrency(inputs.arv)}`,
      `Repair Estimate: ${formatCurrency(inputs.repairs)}`,
      `Discount Percent: ${inputs.discountPercent}%`,
      `Assignment Fee: ${formatCurrency(inputs.assignmentFee)}`,
      "",
      `MAO: ${formatCurrency(results.mao)}`,
      `Seller Offer: ${formatCurrency(results.sellerOffer)}`,
      `Estimated Profit: ${formatCurrency(results.estimatedProfit)}`,
    ].join("\n")

    await navigator.clipboard.writeText(summary)

    setSummaryCopied(true)
    window.setTimeout(() => setSummaryCopied(false), 2000)
  }

  const propertyLabel = formatProperty(property, "")

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Inputs */}
      <div className="flex flex-col gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Property Inputs</CardTitle>
            <CardDescription>Only change the yellow fields.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <YellowNotice />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="w-arv"
                label="ARV (After Repair Value)"
                prefix="$"
                value={inputs.arv}
                onValueChange={(v) => set({ arv: v })}
              />
              <NumberField
                id="w-repairs"
                label="Repair Estimate"
                prefix="$"
                value={inputs.repairs}
                onValueChange={(v) => set({ repairs: v })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="w-discount"
                label="Discount Percent"
                suffix="%"
                value={inputs.discountPercent}
                onValueChange={(v) => set({ discountPercent: v })}
              />
              <NumberField
                id="w-fee"
                label="Assignment Fee"
                prefix="$"
                value={inputs.assignmentFee}
                onValueChange={(v) => set({ assignmentFee: v })}
              />
            </div>
          </CardContent>
        </Card>

        <ArvCompsAnalyzer onUseArv={(arv) => set({ arv })} />
      </div>

      {/* Results */}
      <div className="flex flex-col gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-lg">Deal Analysis</CardTitle>
                <CardDescription>Calculated from your yellow fields.</CardDescription>
              </div>

              <Button type="button" size="sm" onClick={copySummary} className="w-full sm:w-auto">
                {summaryCopied ? "Copied!" : "Copy Deal Summary"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ResultCard
                label="MAO"
                value={formatCurrency(results.mao)}
                hint="Max Allowable Offer"
              />
              <ResultCard
                label="Seller Offer"
                value={formatCurrency(results.sellerOffer)}
                hint="What you offer the seller"
                emphasis="primary"
              />
            </div>
            <ResultCard
              label="Estimated Profit"
              value={formatCurrency(results.estimatedProfit)}
              hint="Your assignment fee"
            />

            <CoachNotes>
              <p>
                Tu MAO es {formatCurrency(results.mao)}. Ese es el máximo que pagarías por la casa
                usando el {inputs.discountPercent}% de descuento sobre el ARV menos las reparaciones.
              </p>
              <p>
                Le ofreces al vendedor {formatCurrency(results.sellerOffer)} (el MAO menos tu fee de{" "}
                {formatCurrency(inputs.assignmentFee)}). Tu ganancia es el fee:{" "}
                {formatCurrency(results.estimatedProfit)}.
              </p>
            </CoachNotes>
          </CardContent>
        </Card>

        <OfferEmail propertyAddress={propertyLabel} calculatedOffer={results.sellerOffer} />
      </div>
    </div>
  )
}