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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NumberField, ResultCard, ResultRow, YellowNotice } from "@/components/deal-fields"
import { CoachNotes, OfferEmail } from "@/components/deal-shared"

export function HoldPanel({ property }: { property: PropertyInfo }) {
  const [inputs, setInputs] = useState<HoldInputs>(HOLD_DEFAULTS)
  const [summaryCopied, setSummaryCopied] = useState(false)
  const r = useMemo(() => analyzeHold(inputs), [inputs])

  function set(next: Partial<HoldInputs>) {
    setInputs((prev) => ({ ...prev, ...next }))
  }

  async function copySummary() {
    const propertyAddress = formatProperty(property, "Propiedad no ingresada")

    const summary = [
      "Money Flip - Resumen de Buy & Hold",
      "",
      `Propiedad: ${propertyAddress}`,
      "Estrategia: Buy & Hold",
      "",
      `Precio de Compra: ${formatCurrency(inputs.purchasePrice)}`,
      `Down Payment: ${inputs.downPaymentPercent}%`,
      `Tasa de Interés: ${inputs.interestRatePercent}%`,
      `Plazo del Préstamo: ${inputs.loanTermYears} años`,
      `Costos de Cierre: ${inputs.closingPercent}%`,
      `Costos Adicionales: ${formatCurrency(inputs.additionalCosts)}`,
      "",
      `Renta Mensual: ${formatCurrency(inputs.monthlyRent)}`,
      `Administración de la Propiedad: ${inputs.managementPercent}%`,
      `Taxes Anuales: ${inputs.taxesPercent}%`,
      `Seguro Anual: ${inputs.insurancePercent}%`,
      `Reservas: ${inputs.reservesPercent}%`,
      `HOA Mensual: ${formatCurrency(inputs.hoaMonthly)}`,
      "",
      `Cash Flow Mensual: ${formatCurrency(r.cashFlowMonthly)}`,
      `Cash Flow Anual: ${formatCurrency(r.cashFlowAnnual)}`,
      `CAP Rate: ${formatPercent(r.capRate)}`,
      `Cash on Cash: ${formatPercent(r.cashOnCash)}`,
      "",
      `Monto del Down Payment: ${formatCurrency(r.downPayment)}`,
      `Monto del Préstamo: ${formatCurrency(r.loanAmount)}`,
      `Pago Mensual Principal e Interés: ${formatCurrency(r.monthlyPI)}`,
      `Monto de Costos de Cierre: ${formatCurrency(r.closingCosts)}`,
      `Capital Invertido: ${formatCurrency(r.capitalInvested)}`,
      "",
      `Total de Gastos Operativos: ${formatCurrency(r.totalOperatingExpenses)}`,
      `NOI Mensual: ${formatCurrency(r.noiMonthly)}`,
      `NOI Anual: ${formatCurrency(r.noiAnnual)}`,
    ].join("\n")

    await navigator.clipboard.writeText(summary)

    setSummaryCopied(true)
    window.setTimeout(() => setSummaryCopied(false), 2000)
  }

  const cashFlowPositive = r.cashFlowMonthly >= 0
  const propertyLabel = formatProperty(property, "Esta propiedad")

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Inputs */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Datos de Renta</CardTitle>
          <CardDescription>Solo cambia los campos amarillos.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <YellowNotice />

          <div className="rounded-lg border border-border/60 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Compra y Financiamiento</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="h-price"
                label="Precio de Compra"
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
                label="Tasa de Interés"
                suffix="%"
                allowDecimal
                value={inputs.interestRatePercent}
                onValueChange={(v) => set({ interestRatePercent: v })}
              />
              <NumberField
                id="h-term"
                label="Plazo del Préstamo"
                suffix="años"
                value={inputs.loanTermYears}
                onValueChange={(v) => set({ loanTermYears: v })}
              />
              <NumberField
                id="h-closing"
                label="Costos de Cierre"
                suffix="%"
                allowDecimal
                value={inputs.closingPercent}
                onValueChange={(v) => set({ closingPercent: v })}
              />
              <NumberField
                id="h-additional"
                label="Costos Adicionales"
                prefix="$"
                value={inputs.additionalCosts}
                onValueChange={(v) => set({ additionalCosts: v })}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/60 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Ingresos y Gastos</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="h-rent"
                label="Renta Mensual"
                prefix="$"
                value={inputs.monthlyRent}
                onValueChange={(v) => set({ monthlyRent: v })}
              />
              <NumberField
                id="h-mgmt"
                label="Administración de la Propiedad"
                suffix="%"
                value={inputs.managementPercent}
                onValueChange={(v) => set({ managementPercent: v })}
              />
              <NumberField
                id="h-taxes"
                label="Taxes Anuales"
                suffix="%"
                allowDecimal
                value={inputs.taxesPercent}
                onValueChange={(v) => set({ taxesPercent: v })}
              />
              <NumberField
                id="h-insurance"
                label="Seguro Anual"
                suffix="%"
                allowDecimal
                value={inputs.insurancePercent}
                onValueChange={(v) => set({ insurancePercent: v })}
              />
              <NumberField
                id="h-reserves"
                label="Reservas"
                suffix="%"
                value={inputs.reservesPercent}
                onValueChange={(v) => set({ reservesPercent: v })}
              />
              <NumberField
                id="h-hoa"
                label="HOA Mensual"
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-lg">Análisis del Trato</CardTitle>
                <CardDescription>Calculado según los campos amarillos.</CardDescription>
              </div>

              <Button type="button" size="sm" onClick={copySummary} className="w-full sm:w-auto">
                {summaryCopied ? "Copiado" : "Copiar Resumen"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ResultCard
                label="Cash Flow Mensual"
                value={formatCurrency(r.cashFlowMonthly)}
                hint={cashFlowPositive ? "Flujo de caja positivo." : "Flujo de caja negativo."}
                emphasis="primary"
              />
              <ResultCard
                label="Cash Flow Anual"
                value={formatCurrency(r.cashFlowAnnual)}
                hint="Cash flow mensual x 12."
              />
              <ResultCard
                label="CAP Rate"
                value={formatPercent(r.capRate)}
                hint="NOI anual / precio de compra."
              />
              <ResultCard
                label="Cash on Cash"
                value={formatPercent(r.cashOnCash)}
                hint="Cash flow anual / capital invertido."
              />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Financiamiento y Capital
              </p>
              <ResultRow label="Down Payment" value={formatCurrency(r.downPayment)} />
              <ResultRow label="Monto del Préstamo" value={formatCurrency(r.loanAmount)} />
              <ResultRow label="Pago Mensual Principal e Interés" value={formatCurrency(r.monthlyPI)} />
              <ResultRow label="Costos de Cierre" value={formatCurrency(r.closingCosts)} />
              <ResultRow label="Capital Invertido" value={formatCurrency(r.capitalInvested)} />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Operación Mensual
              </p>
              <ResultRow
                label="Administración de la Propiedad"
                value={formatCurrency(r.managementMonthly)}
              />
              <ResultRow label="Taxes" value={formatCurrency(r.taxesMonthly)} />
              <ResultRow label="Seguro" value={formatCurrency(r.insuranceMonthly)} />
              <ResultRow label="Reservas" value={formatCurrency(r.reservesMonthly)} />
              <div className="mt-1 border-t border-border/60 pt-1">
                <ResultRow
                  label="Total de Gastos Operativos"
                  value={formatCurrency(r.totalOperatingExpenses)}
                />
                <ResultRow label="NOI Mensual" value={formatCurrency(r.noiMonthly)} />
                <ResultRow label="NOI Anual" value={formatCurrency(r.noiAnnual)} />
              </div>
            </div>

            <CoachNotes>
              <p>
                {propertyLabel} genera un flujo de efectivo de {formatCurrency(r.cashFlowMonthly)} al
                mes ({formatCurrency(r.cashFlowAnnual)} al año) después de pagar la hipoteca y los
                gastos.
              </p>
              <p>
                El CAP Rate es {formatPercent(r.capRate)} y tu retorno sobre el efectivo invertido
                Cash on Cash es {formatPercent(r.cashOnCash)}.{" "}
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