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

  function getDealScoreCardClass() {
    if (results.dealScoreLabel === "Strong Deal") {
      return "rounded-lg border-2 border-emerald-500 bg-emerald-100 p-5 text-emerald-950 shadow-sm"
    }

    if (results.dealScoreLabel === "Weak Deal") {
      return "rounded-lg border-2 border-red-500 bg-red-100 p-5 text-red-950 shadow-sm"
    }

    return "rounded-lg border-2 border-amber-500 bg-amber-100 p-5 text-amber-950 shadow-sm"
  }

  function getDealScoreTextClass() {
    if (results.dealScoreLabel === "Strong Deal") return "text-emerald-700"
    if (results.dealScoreLabel === "Weak Deal") return "text-red-700"
    return "text-amber-700"
  }

  function getDealScoreBadgeClass() {
    if (results.dealScoreLabel === "Strong Deal") {
      return "rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800"
    }

    if (results.dealScoreLabel === "Weak Deal") {
      return "rounded-full border border-red-500 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800"
    }

    return "rounded-full border border-amber-500 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800"
  }

  function getDealScoreBarClass() {
    if (results.dealScoreLabel === "Strong Deal") return "h-full rounded-full bg-emerald-600"
    if (results.dealScoreLabel === "Weak Deal") return "h-full rounded-full bg-red-600"
    return "h-full rounded-full bg-amber-500"
  }

  async function copySummary() {
    const propertyAddress = formatProperty(property, "Property not entered")

    const summary = [
      "Money Flip - Wholesaling Summary",
      "",
      `Property: ${propertyAddress}`,
      `Strategy: Wholesaling`,
      `Deal Score: ${results.dealScore}/100 - ${results.dealScoreLabel}`,
      "",
      `ARV: ${formatCurrency(inputs.arv)}`,
      `Repair Estimate: ${formatCurrency(inputs.repairs)}`,
      `Discount Percent: ${inputs.discountPercent}%`,
      `Assignment Fee: ${formatCurrency(inputs.assignmentFee)}`,
      "",
      `MAO: ${formatCurrency(results.mao)}`,
      `Seller Offer: ${formatCurrency(results.sellerOffer)}`,
      `Estimated Profit: ${formatCurrency(results.estimatedProfit)}`,
      "",
      "Risk Notes:",
      ...results.riskNotes.map((note) => `- ${note}`),
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
            <div className={getDealScoreCardClass()}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Deal Score
                  </p>
                  <p className={`text-4xl font-bold tabular-nums ${getDealScoreTextClass()}`}>
                    {results.dealScore}/100
                  </p>
                </div>

                <div className={getDealScoreBadgeClass()}>{results.dealScoreLabel}</div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-background">
                <div
                  className={getDealScoreBarClass()}
                  style={{ width: `${results.dealScore}%` }}
                />
              </div>
            </div>

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

            <div className="rounded-lg border-2 border-amber-500 bg-amber-200 p-4 text-amber-950 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide">Risk Notes</p>

              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm font-medium">
                {results.riskNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>

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
              <p>
                El Deal Score actual es {results.dealScore}/100 ({results.dealScoreLabel}). Úsalo
                como una guía rápida, pero siempre confirma comps, reparaciones y motivación del
                vendedor antes de avanzar.
              </p>
            </CoachNotes>
          </CardContent>
        </Card>

        <OfferEmail propertyAddress={propertyLabel} calculatedOffer={results.sellerOffer} />
      </div>
    </div>
  )
}