"use client"

import { useMemo, useState } from "react"
import {
  analyzeFlip,
  formatCurrency,
  formatPercent,
  formatProperty,
  FLIP_DEFAULTS,
  type FlipInputs,
  type PropertyInfo,
} from "@/lib/deal-analyzer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NumberField, ResultCard, ResultRow, YellowNotice } from "@/components/deal-fields"
import { CoachNotes, DecisionBanner, OfferEmail } from "@/components/deal-shared"
import { ArvCompsAnalyzer } from "@/components/arv-comps-analyzer"

export function FlipPanel({ property }: { property: PropertyInfo }) {
  const [inputs, setInputs] = useState<FlipInputs>(FLIP_DEFAULTS)
  const r = useMemo(() => analyzeFlip(inputs), [inputs])

  function set(next: Partial<FlipInputs>) {
    setInputs((prev) => ({ ...prev, ...next }))
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Inputs */}
      <div className="flex flex-col gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Project Inputs</CardTitle>
            <CardDescription>Only change the yellow fields.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <YellowNotice />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="f-timeline"
                label="Project Timeline in Months"
                suffix="mo"
                value={inputs.timelineMonths}
                onValueChange={(v) => set({ timelineMonths: v })}
              />
              <NumberField
                id="f-arv"
                label="ARV"
                prefix="$"
                value={inputs.arv}
                onValueChange={(v) => set({ arv: v })}
              />
              <NumberField
                id="f-discount"
                label="Discount Applied to ARV"
                suffix="%"
                value={inputs.discountPercent}
                onValueChange={(v) => set({ discountPercent: v })}
              />
              <NumberField
                id="f-reno"
                label="Renovation Budget"
                prefix="$"
                value={inputs.renovationBudget}
                onValueChange={(v) => set({ renovationBudget: v })}
              />
            </div>

            <div className="rounded-lg border border-border/60 p-4">
              <p className="mb-3 text-sm font-medium text-foreground">Hard Money Loan</p>
              <p className="mb-3 text-xs text-muted-foreground">
                En el Money Flip Method, el prestamista financia el 100% de las reparaciones.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumberField
                  id="f-down"
                  label="HML Down Payment"
                  suffix="%"
                  value={inputs.downPaymentPercent}
                  onValueChange={(v) => set({ downPaymentPercent: v })}
                />
                <NumberField
                  id="f-points"
                  label="HML Points"
                  suffix="%"
                  value={inputs.pointsPercent}
                  onValueChange={(v) => set({ pointsPercent: v })}
                />
                <NumberField
                  id="f-interest"
                  label="HML Annual Interest Rate"
                  suffix="%"
                  value={inputs.annualInterestPercent}
                  onValueChange={(v) => set({ annualInterestPercent: v })}
                />
                <NumberField
                  id="f-admin"
                  label="HML Admin Fee"
                  prefix="$"
                  value={inputs.hmlAdminFee}
                  onValueChange={(v) => set({ hmlAdminFee: v })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="f-purchase-closing"
                label="Purchase Closing Cost"
                suffix="%"
                value={inputs.purchaseClosingPercent}
                onValueChange={(v) => set({ purchaseClosingPercent: v })}
              />
              <NumberField
                id="f-realtor"
                label="Sale Realtor Cost"
                suffix="%"
                value={inputs.saleRealtorPercent}
                onValueChange={(v) => set({ saleRealtorPercent: v })}
              />
              <NumberField
                id="f-sale-closing"
                label="Sale Closing Cost"
                suffix="%"
                value={inputs.saleClosingPercent}
                onValueChange={(v) => set({ saleClosingPercent: v })}
              />
              <NumberField
                id="f-holding"
                label="Holding Costs During Project"
                prefix="$"
                value={inputs.holdingCosts}
                onValueChange={(v) => set({ holdingCosts: v })}
              />
              <NumberField
                id="f-unexpected"
                label="Unexpected Costs"
                prefix="$"
                value={inputs.unexpectedCosts}
                onValueChange={(v) => set({ unexpectedCosts: v })}
              />
              <NumberField
                id="f-roi"
                label="Minimum Expected ROI"
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
            <CardTitle className="text-lg">Deal Analysis</CardTitle>
            <CardDescription>Calculated from your yellow fields.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ResultCard
                label="Net Offer / MAO"
                value={formatCurrency(r.netOffer)}
                hint="What you offer the seller"
                emphasis="primary"
              />
              <ResultCard
                label="Cash Back"
                value={formatCurrency(r.cashBack)}
                hint="Dinero que recibes al cierre de la venta: capital recuperado + ganancia neta."
                emphasis="primary"
              />
              <ResultCard
                label="Net Profit"
                value={formatCurrency(r.netProfit)}
                hint="Cash Back minus Cash Needed to Close"
                emphasis="primary"
              />
              <ResultCard
                label="Real ROI"
                value={formatPercent(r.realRoi, 2)}
                hint="Net Profit / Cash Needed to Close"
              />
              <ResultCard
                label="Cash Needed to Close"
                value={formatCurrency(r.cashToClose)}
                hint="Out of pocket at purchase"
                emphasis="primary"
              />
              <ResultCard
                label="Minimum Profit Required"
                value={formatCurrency(r.minProfitRequired)}
                hint={`At ${inputs.minRoiPercent}% minimum ROI`}
              />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Offer & Hard Money Loan
              </p>
              <ResultRow label="Base Price" value={formatCurrency(r.basePrice)} />
              <ResultRow label="Net Offer" value={formatCurrency(r.netOffer)} />
              <ResultRow label="Down Payment" value={formatCurrency(r.downPayment)} />
              <ResultRow label="Financed Purchase Amount" value={formatCurrency(r.financedPurchaseAmount)} />
              <ResultRow label="Financed Repairs Amount" value={formatCurrency(r.financedRepairsAmount)} />
              <ResultRow label="Hard Money Loan" value={formatCurrency(r.loanAmount)} />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Hard Money Costs
              </p>
              <ResultRow label="HML Origination Points" value={formatCurrency(r.originationPoints)} />
              <ResultRow label="HML Interest" value={formatCurrency(r.hmlInterest)} />
              <ResultRow label="Total HML Expenses" value={formatCurrency(r.totalHmlExpenses)} />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Purchase & Sale Costs
              </p>
              <ResultRow label="Purchase Closing Cost Base" value={formatCurrency(r.purchaseClosingCostBase)} />
              <ResultRow label="Purchase Closing Costs (incl. points)" value={formatCurrency(r.purchaseClosingCosts)} />
              <ResultRow label="Sale Realtor Costs" value={formatCurrency(r.saleRealtorCosts)} />
              <ResultRow label="Sale Closing Costs" value={formatCurrency(r.saleClosingCosts)} />
              <ResultRow label="Total Purchase and Sale Costs" value={formatCurrency(r.totalPurchaseAndSaleCosts)} />
              <div className="mt-1 border-t border-border/60 pt-1">
                <ResultRow label="Total Project Cost" value={formatCurrency(r.totalProjectCost)} />
              </div>
            </div>

            <CoachNotes>
              <p>
                Una cosa es el dinero para cerrar. Otra cosa es el capital total que necesitas para
                mantener el proyecto. El Cash Back es lo que recibes al vender; la Ganancia Neta es lo
                que queda después de recuperar el dinero que pusiste para cerrar.
              </p>
              {r.decision === "HAY DINERO" && (
                <p>
                  El trato pasa tu ROI mínimo de {inputs.minRoiPercent}%. Necesitas{" "}
                  {formatCurrency(r.cashToClose)} para cerrar. ¡Adelante!
                </p>
              )}
              {r.decision === "REVISAR" && (
                <p>
                  Hay ganancia, pero no llega a tu mínimo de {formatCurrency(r.minProfitRequired)}.
                  Negocia un precio más bajo o reduce costos antes de comprometerte.
                </p>
              )}
              {r.decision === "NO HAY DINERO" && (
                <p>
                  Este trato no deja ganancia con estos números. Baja la oferta, reduce la renovación,
                  o busca otra propiedad.
                </p>
              )}
            </CoachNotes>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Carrying Costs</CardTitle>
            <CardDescription>El costo de mantener el proyecto mientras lo tienes.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ResultCard label="HML Interest" value={formatCurrency(r.hmlInterest)} hint="Total during project" />
            <ResultCard
              label="Holding Costs During Project"
              value={formatCurrency(inputs.holdingCosts)}
              hint="Taxes, utilities, insurance"
            />
            <ResultCard
              label="Total Carrying Costs"
              value={formatCurrency(r.totalCarryingCosts)}
              hint="Interest + holding costs"
            />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Capital Required</CardTitle>
            <CardDescription>
              Cuánto dinero líquido necesitas para cerrar y mantener el proyecto. Es solo liquidez, no
              se resta de la ganancia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultCard
              label="Capital Total Requerido"
              value={formatCurrency(r.capitalRequired)}
              hint="Cash to close + interest + holding costs"
              emphasis="primary"
            />
          </CardContent>
        </Card>

        <OfferEmail
          propertyAddress={formatProperty(property, "")}
          calculatedOffer={r.netOffer}
        />
      </div>
    </div>
  )
}