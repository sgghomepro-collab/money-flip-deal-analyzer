"use client"

import { useMemo, useState } from "react"
import {
  analyzeWholesale,
  formatCurrency,
  formatProperty,
  WHOLESALE_DEFAULTS,
  type DealScoreLabel,
  type PropertyInfo,
  type WholesaleInputs,
} from "@/lib/deal-analyzer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NumberField, ResultCard, YellowNotice } from "@/components/deal-fields"
import { CoachNotes, OfferEmail } from "@/components/deal-shared"
import { ArvCompsAnalyzer } from "@/components/arv-comps-analyzer"

const DEAL_SCORE_LABELS_ES: Record<DealScoreLabel, string> = {
  "Strong Deal": "Trato Fuerte",
  "Review Carefully": "Revisar con Cuidado",
  "Weak Deal": "Trato Débil",
}

function translateRiskNote(note: string) {
  const translations: Record<string, string> = {
    "Discount is below 30%. The backend may be tight for the fix & flipper. Review comps, repairs, and resale margin carefully.":
      "El descuento está por debajo del 30%. El margen final puede quedar muy apretado para el fix & flipper. Revisa comparables, reparaciones y margen de reventa con cuidado.",
    "Discount is below 25%. This is usually too risky for wholesaling because the fix & flipper may not have enough backend profit.":
      "El descuento está por debajo del 25%. Normalmente esto es demasiado riesgoso para wholesaling porque el fix & flipper puede quedarse sin suficiente ganancia al final.",
    "Repair estimate is high compared to ARV. Verify repair numbers before locking the contract.":
      "El estimado de reparaciones es alto comparado con el ARV. Verifica los números de reparación antes de firmar el contrato.",
    "Seller offer is high compared to ARV. This may leave limited room for the end buyer.":
      "La oferta al vendedor está alta comparada con el ARV. Esto puede dejar poco margen para el comprador final.",
    "Assignment fee is zero or negative. There is no wholesale profit in this scenario.":
      "El assignment fee es cero o negativo. En este escenario no hay ganancia de wholesale.",
    "Assignment fee is low. Make sure the deal is worth your time and marketing effort.":
      "El assignment fee es bajo. Asegúrate de que el trato valga tu tiempo y esfuerzo de mercadeo.",
    "Assignment fee is high compared to MAO. Make sure your seller offer is low enough and the contract is still sellable.":
      "El assignment fee está alto comparado con el MAO. Asegúrate de que la oferta al vendedor sea lo suficientemente baja y que el contrato todavía se pueda vender.",
    "Assignment fee is getting high compared to MAO. Protect the fix & flipper's backend before increasing your fee.":
      "El assignment fee está subiendo demasiado comparado con el MAO. Protege el margen del fix & flipper antes de aumentar tu fee.",
    "Seller offer is zero or negative. Review ARV, repairs, discount, and assignment fee.":
      "La oferta al vendedor es cero o negativa. Revisa el ARV, las reparaciones, el descuento y el assignment fee.",
    "MAO is zero or negative. This deal does not support the current repair and discount assumptions.":
      "El MAO es cero o negativo. Este trato no soporta las reparaciones y el descuento que estás usando.",
    "ARV is missing or invalid. Add a realistic ARV before trusting the analysis.":
      "El ARV está vacío o no es válido. Agrega un ARV realista antes de confiar en el análisis.",
    "No major wholesaling risk flags detected. Still verify comps, repair estimate, seller motivation, and buyer demand before moving forward.":
      "No se detectaron alertas mayores de wholesaling. Aun así, verifica comparables, estimado de reparaciones, motivación del vendedor y demanda de compradores antes de avanzar.",
  }

  return translations[note] ?? note
}

export function WholesalePanel({ property }: { property: PropertyInfo }) {
  const [inputs, setInputs] = useState<WholesaleInputs>(WHOLESALE_DEFAULTS)
  const [summaryCopied, setSummaryCopied] = useState(false)
  const results = useMemo(() => analyzeWholesale(inputs), [inputs])
  const translatedRiskNotes = results.riskNotes.map(translateRiskNote)

  function set(next: Partial<WholesaleInputs>) {
    setInputs((prev) => ({ ...prev, ...next }))
  }

  function resetAnalysis() {
    setInputs(WHOLESALE_DEFAULTS)
    setSummaryCopied(false)
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
    const propertyAddress = formatProperty(property, "Propiedad no ingresada")

    const summary = [
      "Money Flip - Resumen de Wholesaling",
      "",
      `Propiedad: ${propertyAddress}`,
      "Estrategia: Wholesaling",
      `Deal Score: ${results.dealScore}/100 - ${DEAL_SCORE_LABELS_ES[results.dealScoreLabel]}`,
      "",
      `ARV: ${formatCurrency(inputs.arv)}`,
      `Estimado de Reparaciones: ${formatCurrency(inputs.repairs)}`,
      `Descuento: ${inputs.discountPercent}%`,
      `Assignment Fee: ${formatCurrency(inputs.assignmentFee)}`,
      "",
      `MAO: ${formatCurrency(results.mao)}`,
      `Oferta al Vendedor: ${formatCurrency(results.sellerOffer)}`,
      `Ganancia Estimada: ${formatCurrency(results.estimatedProfit)}`,
      "",
      "Alertas del Análisis:",
      ...translatedRiskNotes.map((note) => `- ${note}`),
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
            <CardTitle className="text-lg">Datos del Trato</CardTitle>
            <CardDescription>Solo cambia los campos amarillos.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <YellowNotice />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="w-arv"
                label="ARV"
                prefix="$"
                value={inputs.arv}
                onValueChange={(v) => set({ arv: v })}
                hint="Valor estimado después de reparaciones."
              />
              <NumberField
                id="w-repairs"
                label="Estimado de Reparaciones"
                prefix="$"
                value={inputs.repairs}
                onValueChange={(v) => set({ repairs: v })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="w-discount"
                label="Porcentaje de Descuento"
                suffix="%"
                value={inputs.discountPercent}
                onValueChange={(v) => set({ discountPercent: v })}
                hint="Regla recomendada: no bajar del 30%."
              />
              <NumberField
                id="w-fee"
                label="Assignment Fee"
                prefix="$"
                value={inputs.assignmentFee}
                onValueChange={(v) => set({ assignmentFee: v })}
                hint="Tu ganancia como wholesaler."
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
                <CardTitle className="text-lg">Análisis del Trato</CardTitle>
                <CardDescription>Calculado según los campos amarillos.</CardDescription>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button type="button" variant="outline" size="sm" onClick={resetAnalysis}>
                  Reiniciar Análisis
                </Button>

                <Button type="button" size="sm" onClick={copySummary}>
                  {summaryCopied ? "Copiado" : "Copiar Resumen"}
                </Button>
              </div>
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

                <div className={getDealScoreBadgeClass()}>
                  {DEAL_SCORE_LABELS_ES[results.dealScoreLabel]}
                </div>
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
                hint="Oferta máxima permitida antes de restar tu assignment fee."
              />
              <ResultCard
                label="Oferta al Vendedor"
                value={formatCurrency(results.sellerOffer)}
                hint="Lo que ofrecerías al vendedor."
                emphasis="primary"
              />
            </div>
            <ResultCard
              label="Ganancia Estimada"
              value={formatCurrency(results.estimatedProfit)}
              hint="Tu assignment fee."
            />

            <div className="rounded-lg border-2 border-amber-500 bg-amber-200 p-4 text-amber-950 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide">
                Alertas del Análisis
              </p>

              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm font-medium">
                {translatedRiskNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>

            <CoachNotes>
              <p>
                Tu MAO es {formatCurrency(results.mao)}. Ese es el máximo permitido antes de
                descontar tu assignment fee, usando el {inputs.discountPercent}% de descuento sobre
                el ARV menos las reparaciones.
              </p>
              <p>
                Tu oferta al vendedor sería {formatCurrency(results.sellerOffer)}. Esa oferta sale
                de tomar el MAO y restarle tu assignment fee de {formatCurrency(inputs.assignmentFee)}.
              </p>
              <p>
                Tu ganancia estimada es {formatCurrency(results.estimatedProfit)}. Recuerda: si subes
                demasiado tu assignment fee, debes bajar la oferta al vendedor para proteger el margen
                del fix & flipper.
              </p>
              <p>
                El Deal Score actual es {results.dealScore}/100 (
                {DEAL_SCORE_LABELS_ES[results.dealScoreLabel]}). Úsalo como una guía rápida, pero
                siempre confirma comparables, reparaciones, motivación del vendedor y demanda de
                compradores antes de avanzar.
              </p>
            </CoachNotes>
          </CardContent>
        </Card>

        <OfferEmail propertyAddress={propertyLabel} calculatedOffer={results.sellerOffer} />
      </div>
    </div>
  )
}