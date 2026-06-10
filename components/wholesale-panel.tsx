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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NumberField, ResultCard, YellowNotice } from "@/components/deal-fields"
import { CoachNotes, OfferEmail } from "@/components/deal-shared"

export function WholesalePanel({ property }: { property: PropertyInfo }) {
  const [inputs, setInputs] = useState<WholesaleInputs>(WHOLESALE_DEFAULTS)
  const results = useMemo(() => analyzeWholesale(inputs), [inputs])

  function set(next: Partial<WholesaleInputs>) {
    setInputs((prev) => ({ ...prev, ...next }))
  }

  const propertyLabel = formatProperty(property, "")

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Inputs */}
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

      {/* Results */}
      <div className="flex flex-col gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Deal Analysis</CardTitle>
            <CardDescription>Calculated from your yellow fields.</CardDescription>
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
