"use client"

import { useMemo, useState } from "react"
import {
  analyzeFlip,
  formatCurrency,
  formatPercent,
  formatProperty,
  FLIP_DEFAULTS,
  type DealScoreLabel,
  type FlipInputs,
  type PropertyInfo,
} from "@/lib/deal-analyzer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NumberField, ResultCard, ResultRow, YellowNotice } from "@/components/deal-fields"
import { CoachNotes, DecisionBanner, OfferEmail } from "@/components/deal-shared"
import { ArvCompsAnalyzer } from "@/components/arv-comps-analyzer"

const DEAL_SCORE_LABELS_ES: Record<DealScoreLabel, string> = {
  "Strong Deal": "Trato Fuerte",
  "Review Carefully": "Revisar con Cuidado",
  "Weak Deal": "Trato Débil",
}

function translateRiskNote(note: string) {
  const translations: Record<string, string> = {
    "Actual Sale Price is below ARV. Review your exit strategy and resale assumptions.":
      "El precio real de venta está por debajo del ARV. Revisa tu estrategia de salida y tus supuestos de reventa.",
    "This deal is currently showing no net profit. The offer, renovation budget, or sale price needs to be reviewed.":
      "Este trato actualmente no muestra ganancia neta. Revisa la oferta, el presupuesto de renovación o el precio de venta.",
    "Net profit is positive, but it is below your minimum expected ROI target.":
      "La ganancia neta es positiva, pero está por debajo de tu ROI mínimo esperado.",
    "Renovation budget is high compared to ARV. Verify repair estimates before making an offer.":
      "El presupuesto de renovación es alto comparado con el ARV. Verifica el estimado de reparaciones antes de hacer una oferta.",
    "Cash needed to close is high compared to ARV. Confirm available capital before moving forward.":
      "El dinero necesario para cerrar es alto comparado con el ARV. Confirma tu capital disponible antes de avanzar.",
    "Project timeline is long. Higher timelines can increase interest, holding costs, and market risk.":
      "El tiempo del proyecto es largo. Un plazo más largo puede aumentar intereses, costos de mantenimiento y riesgo de mercado.",
    "Hard money interest rate is high. Review lender terms and compare financing options.":
      "La tasa de interés del hard money es alta. Revisa los términos del prestamista y compara opciones de financiamiento.",
    "Hard money points are high. Confirm all lender fees before committing to the deal.":
      "Los puntos del hard money son altos. Confirma todos los cargos del prestamista antes de comprometerte con el trato.",
    "No major risk flags detected based on the current numbers. Still verify comps, repairs, financing, and market conditions.":
      "No se detectaron alertas mayores según los números actuales. Aun así, verifica comparables, reparaciones, financiamiento y condiciones del mercado.",
  }

  return translations[note] ?? note
}

export function FlipPanel({ property }: { property: PropertyInfo }) {
  const [inputs, setInputs] = useState<FlipInputs>(FLIP_DEFAULTS)
  const [summaryCopied, setSummaryCopied] = useState(false)
  const [annualInterestText, setAnnualInterestText] = useState(
    String(FLIP_DEFAULTS.annualInterestPercent ?? 0),
  )

  const r = useMemo(() => analyzeFlip(inputs), [inputs])
  const translatedRiskNotes = r.riskNotes.map(translateRiskNote)

  function set(next: Partial<FlipInputs>) {
    setInputs((prev) => ({ ...prev, ...next }))
  }

  function resetAnalysis() {
    setInputs(FLIP_DEFAULTS)
    setAnnualInterestText(String(FLIP_DEFAULTS.annualInterestPercent ?? 0))
    setSummaryCopied(false)
  }

  function getDealScoreCardClass() {
    if (r.dealScoreLabel === "Strong Deal") {
      return "rounded-lg border-2 border-emerald-500 bg-emerald-100 p-5 text-emerald-950 shadow-sm"
    }

    if (r.dealScoreLabel === "Weak Deal") {
      return "rounded-lg border-2 border-red-500 bg-red-100 p-5 text-red-950 shadow-sm"
    }

    return "rounded-lg border-2 border-amber-500 bg-amber-100 p-5 text-amber-950 shadow-sm"
  }

  function getDealScoreTextClass() {
    if (r.dealScoreLabel === "Strong Deal") return "text-emerald-700"
    if (r.dealScoreLabel === "Weak Deal") return "text-red-700"
    return "text-amber-700"
  }

  function getDealScoreBadgeClass() {
    if (r.dealScoreLabel === "Strong Deal") {
      return "rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800"
    }

    if (r.dealScoreLabel === "Weak Deal") {
      return "rounded-full border border-red-500 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800"
    }

    return "rounded-full border border-amber-500 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800"
  }

  function getDealScoreBarClass() {
    if (r.dealScoreLabel === "Strong Deal") return "h-full rounded-full bg-emerald-600"
    if (r.dealScoreLabel === "Weak Deal") return "h-full rounded-full bg-red-600"
    return "h-full rounded-full bg-amber-500"
  }

  function updateAnnualInterest(value: string) {
    const cleanValue = value.replace(",", ".")

    if (!/^\d*\.?\d*$/.test(cleanValue)) return

    setAnnualInterestText(cleanValue)

    const parsedValue = Number.parseFloat(cleanValue)
    set({ annualInterestPercent: Number.isFinite(parsedValue) ? parsedValue : 0 })
  }

  function normalizeAnnualInterest() {
    if (annualInterestText.trim() === "" || annualInterestText === ".") {
      setAnnualInterestText("0")
      set({ annualInterestPercent: 0 })
      return
    }

    const parsedValue = Number.parseFloat(annualInterestText)
    const finalValue = Number.isFinite(parsedValue) ? parsedValue : 0

    setAnnualInterestText(String(finalValue))
    set({ annualInterestPercent: finalValue })
  }

  async function copySummary() {
    const propertyAddress = formatProperty(property, "Propiedad no ingresada")

    const summary = [
      "Money Flip - Resumen de Fix & Flip",
      "",
      `Propiedad: ${propertyAddress}`,
      `Decisión: ${r.decision}`,
      `Deal Score: ${r.dealScore}/100 - ${DEAL_SCORE_LABELS_ES[r.dealScoreLabel]}`,
      "",
      `ARV: ${formatCurrency(inputs.arv)}`,
      `Precio Real de Venta: ${formatCurrency(inputs.actualSalePrice)}`,
      `Precio de Venta Usado: ${formatCurrency(r.salePriceUsed)}`,
      `Presupuesto de Renovación: ${formatCurrency(inputs.renovationBudget)}`,
      "",
      `Oferta Neta / MAO: ${formatCurrency(r.netOffer)}`,
      `Dinero Necesario para Cerrar: ${formatCurrency(r.cashToClose)}`,
      `Capital Requerido: ${formatCurrency(r.capitalRequired)}`,
      "",
      `Cash Back: ${formatCurrency(r.cashBack)}`,
      `Ganancia Neta: ${formatCurrency(r.netProfit)}`,
      `ROI Real: ${formatPercent(r.realRoi, 2)}`,
      `Ganancia Mínima Requerida: ${formatCurrency(r.minProfitRequired)}`,
      "",
      `Down Payment HML: ${inputs.downPaymentPercent}%`,
      `Puntos HML: ${inputs.pointsPercent}%`,
      `Tasa Anual HML: ${inputs.annualInterestPercent}%`,
      `Tiempo del Proyecto: ${inputs.timelineMonths} meses`,
      "",
      "Alertas del Análisis:",
      ...translatedRiskNotes.map((note) => `- ${note}`),
    ].join("\n")

    await navigator.clipboard.writeText(summary)

    setSummaryCopied(true)
    window.setTimeout(() => setSummaryCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Inputs */}
      <div className="flex flex-col gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Datos del Proyecto</CardTitle>
            <CardDescription>Solo cambia los campos amarillos.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <YellowNotice />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="f-timeline"
                label="Tiempo del Proyecto"
                suffix="meses"
                value={inputs.timelineMonths}
                onValueChange={(v) => set({ timelineMonths: v })}
              />

              <NumberField
                id="f-arv"
                label="ARV"
                prefix="$"
                value={inputs.arv}
                onValueChange={(v) => set({ arv: v })}
                hint="Valor estimado después de reparaciones."
              />

              <NumberField
                id="f-actual-sale-price"
                label="Precio Real de Venta"
                prefix="$"
                value={inputs.actualSalePrice}
                hint="Opcional. Déjalo en blanco o 0 para usar el ARV como precio proyectado de venta."
                onValueChange={(v) => set({ actualSalePrice: v })}
              />

              <NumberField
                id="f-discount"
                label="Descuento Aplicado al ARV"
                suffix="%"
                value={inputs.discountPercent}
                onValueChange={(v) => set({ discountPercent: v })}
              />

              <NumberField
                id="f-reno"
                label="Presupuesto de Renovación"
                prefix="$"
                value={inputs.renovationBudget}
                onValueChange={(v) => set({ renovationBudget: v })}
              />
            </div>

            <div className="rounded-lg border border-border/60 p-4">
              <p className="mb-3 text-sm font-medium text-foreground">Préstamo Hard Money</p>
              <p className="mb-3 text-xs text-muted-foreground">
                En el Money Flip Method, el prestamista financia el 100% de las reparaciones.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumberField
                  id="f-down"
                  label="Down Payment HML"
                  suffix="%"
                  value={inputs.downPaymentPercent}
                  onValueChange={(v) => set({ downPaymentPercent: v })}
                />

                <NumberField
                  id="f-points"
                  label="Puntos HML"
                  suffix="%"
                  value={inputs.pointsPercent}
                  onValueChange={(v) => set({ pointsPercent: v })}
                />

                <div className="flex flex-col gap-2">
                  <label htmlFor="f-interest" className="text-sm font-medium text-foreground">
                    Tasa Anual HML
                  </label>

                  <div className="flex h-10 overflow-hidden rounded-md border border-yellow-400/70 bg-yellow-50 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <input
                      id="f-interest"
                      type="text"
                      inputMode="decimal"
                      value={annualInterestText}
                      onChange={(e) => updateAnnualInterest(e.target.value)}
                      onBlur={normalizeAnnualInterest}
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-foreground outline-none"
                    />

                    <div className="flex items-center border-l border-yellow-400/70 px-3 text-muted-foreground">
                      %
                    </div>
                  </div>
                </div>

                <NumberField
                  id="f-admin"
                  label="Cargo Administrativo HML"
                  prefix="$"
                  value={inputs.hmlAdminFee}
                  onValueChange={(v) => set({ hmlAdminFee: v })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="f-purchase-closing"
                label="Costo de Cierre de Compra"
                suffix="%"
                value={inputs.purchaseClosingPercent}
                onValueChange={(v) => set({ purchaseClosingPercent: v })}
              />

              <NumberField
                id="f-realtor"
                label="Comisión de Realtor al Vender"
                suffix="%"
                value={inputs.saleRealtorPercent}
                onValueChange={(v) => set({ saleRealtorPercent: v })}
              />

              <NumberField
                id="f-sale-closing"
                label="Costo de Cierre de Venta"
                suffix="%"
                value={inputs.saleClosingPercent}
                onValueChange={(v) => set({ saleClosingPercent: v })}
              />

              <NumberField
                id="f-holding"
                label="Costos de Mantenimiento del Proyecto"
                prefix="$"
                value={inputs.holdingCosts}
                onValueChange={(v) => set({ holdingCosts: v })}
              />

              <NumberField
                id="f-unexpected"
                label="Costos Inesperados"
                prefix="$"
                value={inputs.unexpectedCosts}
                onValueChange={(v) => set({ unexpectedCosts: v })}
              />

              <NumberField
                id="f-roi"
                label="ROI Mínimo Esperado"
                suffix="%"
                value={inputs.minRoiPercent}
                onValueChange={(v) => set({ minRoiPercent: v })}
              />
            </div>
          </CardContent>
        </Card>

        <ArvCompsAnalyzer onUseArv={(arv) => set({ arv })} />
      </div>

      {/* Results */}
      <div className="flex flex-col gap-6">
        <DecisionBanner decision={r.decision} />

        <Card className="border-border/60">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-lg">Análisis del Trato</CardTitle>
                <CardDescription>
                  Calculado según los campos amarillos. Si ingresas un precio real de venta, se usa
                  ese valor en el análisis.
                </CardDescription>
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
                    {r.dealScore}/100
                  </p>
                </div>

                <div className={getDealScoreBadgeClass()}>
                  {DEAL_SCORE_LABELS_ES[r.dealScoreLabel]}
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-background">
                <div className={getDealScoreBarClass()} style={{ width: `${r.dealScore}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ResultCard
                label="Precio de Venta Usado"
                value={formatCurrency(r.salePriceUsed)}
                hint={inputs.actualSalePrice > 0 ? "Usando precio real de venta" : "Usando ARV"}
                emphasis="primary"
              />

              <ResultCard
                label="Oferta Neta / MAO"
                value={formatCurrency(r.netOffer)}
                hint="Lo que ofrecerías al vendedor."
                emphasis="primary"
              />

              <ResultCard
                label="Cash Back"
                value={formatCurrency(r.cashBack)}
                hint="Dinero que recibes al cierre de la venta: capital recuperado + ganancia neta."
                emphasis="primary"
              />

              <ResultCard
                label="Ganancia Neta"
                value={formatCurrency(r.netProfit)}
                hint="Cash Back menos dinero necesario para cerrar."
                emphasis="primary"
              />

              <ResultCard
                label="ROI Real"
                value={formatPercent(r.realRoi, 2)}
                hint="Ganancia neta / dinero necesario para cerrar."
              />

              <ResultCard
                label="Dinero Necesario para Cerrar"
                value={formatCurrency(r.cashToClose)}
                hint="Dinero de tu bolsillo al momento de comprar."
                emphasis="primary"
              />

              <ResultCard
                label="Ganancia Mínima Requerida"
                value={formatCurrency(r.minProfitRequired)}
                hint={`Basado en un ROI mínimo de ${inputs.minRoiPercent}%`}
              />
            </div>

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

            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Oferta y Préstamo Hard Money
              </p>

              <ResultRow label="ARV" value={formatCurrency(inputs.arv)} />
              <ResultRow label="Precio Real de Venta" value={formatCurrency(inputs.actualSalePrice)} />
              <ResultRow label="Precio de Venta Usado" value={formatCurrency(r.salePriceUsed)} />
              <ResultRow label="Precio Base" value={formatCurrency(r.basePrice)} />
              <ResultRow label="Oferta Neta" value={formatCurrency(r.netOffer)} />
              <ResultRow label="Down Payment" value={formatCurrency(r.downPayment)} />
              <ResultRow
                label="Monto Financiado de Compra"
                value={formatCurrency(r.financedPurchaseAmount)}
              />
              <ResultRow
                label="Reparaciones Financiadas"
                value={formatCurrency(r.financedRepairsAmount)}
              />
              <ResultRow label="Préstamo Hard Money" value={formatCurrency(r.loanAmount)} />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Costos del Hard Money
              </p>

              <ResultRow label="Puntos de Originación HML" value={formatCurrency(r.originationPoints)} />
              <ResultRow label="Interés HML" value={formatCurrency(r.hmlInterest)} />
              <ResultRow label="Gastos Totales HML" value={formatCurrency(r.totalHmlExpenses)} />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Costos de Compra y Venta
              </p>

              <ResultRow
                label="Base de Costos de Cierre de Compra"
                value={formatCurrency(r.purchaseClosingCostBase)}
              />
              <ResultRow
                label="Costos de Cierre de Compra con Puntos"
                value={formatCurrency(r.purchaseClosingCosts)}
              />
              <ResultRow label="Comisión de Realtor al Vender" value={formatCurrency(r.saleRealtorCosts)} />
              <ResultRow label="Costos de Cierre de Venta" value={formatCurrency(r.saleClosingCosts)} />
              <ResultRow
                label="Total Costos de Compra y Venta"
                value={formatCurrency(r.totalPurchaseAndSaleCosts)}
              />

              <div className="mt-1 border-t border-border/60 pt-1">
                <ResultRow label="Costo Total del Proyecto" value={formatCurrency(r.totalProjectCost)} />
              </div>
            </div>

            <CoachNotes>
              <p>
                Una cosa es el ARV proyectado y otra cosa es el precio real de venta. Si escribes un
                Precio Real de Venta, la calculadora usa ese valor para evaluar el resultado final del
                proyecto.
              </p>

              <p>
                El Precio de Venta Usado actual es {formatCurrency(r.salePriceUsed)}. Con ese
                escenario, el Cash Back es {formatCurrency(r.cashBack)} y la Ganancia Neta es{" "}
                {formatCurrency(r.netProfit)}.
              </p>

              {r.decision === "HAY DINERO" && (
                <p>
                  El trato pasa tu ROI mínimo de {inputs.minRoiPercent}%. Necesitas{" "}
                  {formatCurrency(r.cashToClose)} para cerrar.
                </p>
              )}

              {r.decision === "REVISAR" && (
                <p>
                  Hay ganancia, pero no llega a tu mínimo de {formatCurrency(r.minProfitRequired)}.
                  Prueba un precio de venta más conservador, negocia un precio más bajo o reduce
                  costos antes de comprometerte.
                </p>
              )}

              {r.decision === "NO HAY DINERO" && (
                <p>
                  Este trato no deja ganancia con estos números. Baja la oferta, reduce la renovación,
                  sube el precio de venta esperado o busca otra propiedad.
                </p>
              )}
            </CoachNotes>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Costos de Mantenimiento</CardTitle>
            <CardDescription>El costo de mantener el proyecto mientras lo tienes.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ResultCard
              label="Interés HML"
              value={formatCurrency(r.hmlInterest)}
              hint="Total durante el proyecto."
            />

            <ResultCard
              label="Costos de Mantenimiento"
              value={formatCurrency(inputs.holdingCosts)}
              hint="Taxes, utilities, insurance."
            />

            <ResultCard
              label="Total Costos de Mantenimiento"
              value={formatCurrency(r.totalCarryingCosts)}
              hint="Interés + costos de mantenimiento."
            />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Capital Requerido</CardTitle>
            <CardDescription>
              Cuánto dinero líquido necesitas para cerrar y mantener el proyecto. Es solo liquidez, no
              se resta de la ganancia.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResultCard
              label="Capital Total Requerido"
              value={formatCurrency(r.capitalRequired)}
              hint="Dinero para cerrar + interés + costos de mantenimiento."
              emphasis="primary"
            />
          </CardContent>
        </Card>

        <OfferEmail propertyAddress={formatProperty(property, "")} calculatedOffer={r.netOffer} />
      </div>
    </div>
  )
}