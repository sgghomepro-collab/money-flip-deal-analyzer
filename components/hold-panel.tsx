"use client"

import { useMemo, useState } from "react"
import {
  analyzeHold,
  formatCurrency,
  formatPercent,
  formatProperty,
  HOLD_DEFAULTS,
  type HoldInputs,
  type PropertyInfo,
} from "@/lib/deal-analyzer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NumberField, ResultCard, ResultRow, YellowNotice } from "@/components/deal-fields"
import { CoachNotes, OfferEmail } from "@/components/deal-shared"

export function HoldPanel({ property }: { property: PropertyInfo }) {
  const [inputs, setInputs] = useState<HoldInputs>(HOLD_DEFAULTS)
  const r = useMemo(() => analyzeHold(inputs), [inputs])

  function set(next: Partial<HoldInputs>) {
    setInputs((prev) => ({ ...prev, ...next }))
  }

  const cashFlowPositive = r.cashFlowMonthly >= 0
  const propertyLabel = formatProperty(property, "Esta propiedad")

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Inputs */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Rental Inputs</CardTitle>
          <CardDescription>Only change the yellow fields.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <YellowNotice />

          <div className="rounded-lg border border-border/60 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Purchase &amp; Financing</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="h-price"
                label="Purchase Price"
                prefix="$"
                value={inputs.purchasePrice}
                onValueChange={(v) => set({ purchasePrice: v })}
              />
              <NumberField
                id="h-down"
                label="Down Payment"
                suffix="%"
                value={inputs.downPaymentPercent}
                onValueChange={(v) => set({ downPaymentPercent: v })}
              />
              <NumberField
                id="h-rate"
                label="Interest Rate"
                suffix="%"
                allowDecimal
                value={inputs.interestRatePercent}
                onValueChange={(v) => set({ interestRatePercent: v })}
              />
              <NumberField
                id="h-term"
                label="Loan Term"
                suffix="yr"
                value={inputs.loanTermYears}
                onValueChange={(v) => set({ loanTermYears: v })}
              />
              <NumberField
                id="h-closing"
                label="Closing Costs"
                suffix="%"
                allowDecimal
                value={inputs.closingPercent}
                onValueChange={(v) => set({ closingPercent: v })}
              />
              <NumberField
                id="h-additional"
                label="Additional Costs"
                prefix="$"
                value={inputs.additionalCosts}
                onValueChange={(v) => set({ additionalCosts: v })}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/60 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Income &amp; Expenses</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="h-rent"
                label="Monthly Rent"
                prefix="$"
                value={inputs.monthlyRent}
                onValueChange={(v) => set({ monthlyRent: v })}
              />
              <NumberField
                id="h-mgmt"
                label="Property Management"
                suffix="%"
                value={inputs.managementPercent}
                onValueChange={(v) => set({ managementPercent: v })}
              />
              <NumberField
                id="h-taxes"
                label="Taxes (annual)"
                suffix="%"
                allowDecimal
                value={inputs.taxesPercent}
                onValueChange={(v) => set({ taxesPercent: v })}
              />
              <NumberField
                id="h-insurance"
                label="Insurance (annual)"
                suffix="%"
                allowDecimal
                value={inputs.insurancePercent}
                onValueChange={(v) => set({ insurancePercent: v })}
              />
              <NumberField
                id="h-reserves"
                label="Reserves"
                suffix="%"
                value={inputs.reservesPercent}
                onValueChange={(v) => set({ reservesPercent: v })}
              />
              <NumberField
                id="h-hoa"
                label="HOA Monthly"
                prefix="$"
                value={inputs.hoaMonthly}
                onValueChange={(v) => set({ hoaMonthly: v })}
              />
            </div>
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
                label="Monthly Cash Flow"
                value={formatCurrency(r.cashFlowMonthly)}
                hint={cashFlowPositive ? "Positive cash flow" : "Negative cash flow"}
                emphasis="primary"
              />
              <ResultCard
                label="Annual Cash Flow"
                value={formatCurrency(r.cashFlowAnnual)}
                hint="Cash flow x 12"
              />
              <ResultCard
                label="CAP Rate"
                value={formatPercent(r.capRate)}
                hint="NOI / purchase price"
              />
              <ResultCard
                label="Cash on Cash"
                value={formatPercent(r.cashOnCash)}
                hint="Annual cash flow / capital invested"
              />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Financing &amp; Capital
              </p>
              <ResultRow label="Down Payment" value={formatCurrency(r.downPayment)} />
              <ResultRow label="Loan Amount" value={formatCurrency(r.loanAmount)} />
              <ResultRow label="Monthly Principal & Interest" value={formatCurrency(r.monthlyPI)} />
              <ResultRow label="Closing Costs" value={formatCurrency(r.closingCosts)} />
              <ResultRow label="Capital Invested" value={formatCurrency(r.capitalInvested)} />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Monthly Operating
              </p>
              <ResultRow label="Property Management" value={formatCurrency(r.managementMonthly)} />
              <ResultRow label="Taxes" value={formatCurrency(r.taxesMonthly)} />
              <ResultRow label="Insurance" value={formatCurrency(r.insuranceMonthly)} />
              <ResultRow label="Reserves" value={formatCurrency(r.reservesMonthly)} />
              <div className="mt-1 border-t border-border/60 pt-1">
                <ResultRow label="Total Operating Expenses" value={formatCurrency(r.totalOperatingExpenses)} />
                <ResultRow label="NOI (monthly)" value={formatCurrency(r.noiMonthly)} />
                <ResultRow label="NOI (annual)" value={formatCurrency(r.noiAnnual)} />
              </div>
            </div>

            <CoachNotes>
              <p>
                {propertyLabel} genera un flujo de efectivo de {formatCurrency(r.cashFlowMonthly)} al
                mes ({formatCurrency(r.cashFlowAnnual)} al año) después de pagar la hipoteca y los
                gastos.
              </p>
              <p>
                El CAP rate es {formatPercent(r.capRate)} y tu retorno sobre el efectivo invertido
                (Cash on Cash) es {formatPercent(r.cashOnCash)}.{" "}
                {cashFlowPositive
                  ? "La propiedad genera dinero cada mes."
                  : "Cuidado: la propiedad pierde dinero cada mes con estos números."}
              </p>
            </CoachNotes>
          </CardContent>
        </Card>

        <OfferEmail
          propertyAddress={formatProperty(property, "")}
          calculatedOffer={inputs.purchasePrice}
        />
      </div>
    </div>
  )
}
