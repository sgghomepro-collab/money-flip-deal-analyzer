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

interface MarketEstimates {
  zillow: number
  redfin: number
  propwire: number
  other: number
}

interface ArvCompsAnalyzerProps {
  onUseArv: (arv: number) => void
}

const CONDITION_LABELS: Record<Condition, string> = {
  poor: "Mala",
  average: "Promedio",
  updated: "Actualizada",
  renovated: "Totalmente Renovada",
}

const CONFIDENCE_LABELS: Record<"Low" | "Medium" | "High", string> = {
  Low: "Baja",
  Medium: "Media",
  High: "Alta",
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
  const [marketEstimates, setMarketEstimates] = useState<MarketEstimates>({
    zillow: 0,
    redfin: 0,
    propwire: 0,
    other: 0,
  })

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

  function updateMarketEstimates(next: Partial<MarketEstimates>) {
    setMarketEstimates((prev) => ({ ...prev, ...next }))
  }

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

  const estimateAnalysis = useMemo(() => {
    const values = [
      marketEstimates.zillow,
      marketEstimates.redfin,
      marketEstimates.propwire,
      marketEstimates.other,
    ].filter((value) => value > 0)

    const average =
      values.length > 0
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : 0

    const low = values.length > 0 ? Math.min(...values) : 0
    const high = values.length > 0 ? Math.max(...values) : 0
    const spread = high - low
    const spreadPercent = average > 0 ? spread / average : 0

    let confidence: "Low" | "Medium" | "High" = "Low"

    if (values.length >= 3 && spreadPercent <= 0.15) {
      confidence = "High"
    } else if (values.length >= 2 && spreadPercent <= 0.25) {
      confidence = "Medium"
    }

    const warning =
      values.length >= 2 && spreadPercent > 0.2
        ? "Los estimados están muy separados. Verifica propiedades comparables antes de usar este ARV."
        : ""

    return {
      values,
      average,
      low,
      high,
      spread,
      spreadPercent,
      confidence,
      warning,
    }
  }, [marketEstimates])

  const compsAnalysis = useMemo(() => {
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
      const label = comp.address ? comp.address : `Comparable ${index + 1}`

      if (subject.sqft > 0 && comp.sqft > 0) {
        const sizeDifference = Math.abs(comp.sqft - subject.sqft) / subject.sqft
        if (sizeDifference > 0.25) {
          warnings.push(`${label} tiene una diferencia grande de pies cuadrados frente a la propiedad analizada.`)
        }
      }

      if (comp.distance > 1) {
        warnings.push(`${label} está a más de 1 milla de distancia.`)
      }

      if (subject.yearBuilt > 0 && comp.yearBuilt > 0) {
        const yearDifference = Math.abs(comp.yearBuilt - subject.yearBuilt)
        if (yearDifference > 20) {
          warnings.push(`${label} tiene una diferencia grande en el año de construcción.`)
        }
      }

      if (comp.beds > 0 && subject.beds > 0 && Math.abs(comp.beds - subject.beds) >= 2) {
        warnings.push(`${label} tiene una diferencia grande en cantidad de habitaciones.`)
      }

      if (comp.baths > 0 && subject.baths > 0 && Math.abs(comp.baths - subject.baths) >= 1.5) {
        warnings.push(`${label} tiene una diferencia grande en cantidad de baños.`)
      }

      if (CONDITION_SCORE[comp.condition] < CONDITION_SCORE[subject.condition] - 1) {
        warnings.push(`${label} parece estar en una condición inferior a la condición objetivo.`)
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

  const canUseEstimateAverage = acceptedNotice && estimateAnalysis.average > 0
  const canUseCompsArv = acceptedNotice && compsAnalysis.suggestedArv > 0

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-foreground" />
          <CardTitle className="text-lg">Herramientas de ARV</CardTitle>
        </div>
        <CardDescription>
          Usa esta sección para comparar estimados y propiedades vendidas antes de tomar una decisión.
          También puedes ingresar el ARV manualmente sin usar estas herramientas.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4" />
            Aviso Importante
          </div>
          <p>
            Los valores de ARV mostrados aquí son estimados basados únicamente en los números
            ingresados por el usuario. Money Flip no verifica, garantiza ni certifica la exactitud
            de la información ingresada. Estas herramientas son solo para fines educativos y de
            análisis. Money Flip no es responsable por decisiones de inversión, ofertas, pérdidas
            o resultados basados en estos estimados.
          </p>

          <label className="mt-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={acceptedNotice}
              onChange={(event) => setAcceptedNotice(event.target.checked)}
              className="mt-1"
            />
            <span>
              Entiendo que estos estimados de ARV no son valores garantizados y que soy responsable
              de verificar todos los números antes de hacer una oferta o tomar una decisión de inversión.
            </span>
          </label>
        </div>

        <div className="rounded-lg border border-border/60 p-4">
          <p className="mb-1 text-sm font-medium text-foreground">Promedio de Estimados de ARV</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Ingresa estimados de plataformas como Zillow, Redfin, Propwire u otra fuente. La
            herramienta calculará un promedio simple.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              id="arv-estimate-zillow"
              label="Estimado de Zillow"
              prefix="$"
              value={marketEstimates.zillow}
              onValueChange={(v) => updateMarketEstimates({ zillow: v })}
            />
            <NumberField
              id="arv-estimate-redfin"
              label="Estimado de Redfin"
              prefix="$"
              value={marketEstimates.redfin}
              onValueChange={(v) => updateMarketEstimates({ redfin: v })}
            />
            <NumberField
              id="arv-estimate-propwire"
              label="Estimado de Propwire"
              prefix="$"
              value={marketEstimates.propwire}
              onValueChange={(v) => updateMarketEstimates({ propwire: v })}
            />
            <NumberField
              id="arv-estimate-other"
              label="Otro Estimado"
              prefix="$"
              value={marketEstimates.other}
              onValueChange={(v) => updateMarketEstimates({ other: v })}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="Promedio Estimado"
              value={formatCurrency(estimateAnalysis.average)}
              hint={`${estimateAnalysis.values.length} estimado(s) usado(s)`}
              emphasis="primary"
            />
            <ResultCard
              label="Confianza"
              value={CONFIDENCE_LABELS[estimateAnalysis.confidence]}
              hint="Basado en cantidad de estimados y diferencia entre ellos"
            />
            <ResultCard
              label="Estimado Más Bajo"
              value={formatCurrency(estimateAnalysis.low)}
              hint="Estimado más conservador"
            />
            <ResultCard
              label="Estimado Más Alto"
              value={formatCurrency(estimateAnalysis.high)}
              hint="Estimado más agresivo"
            />
            <ResultCard
              label="Diferencia"
              value={formatCurrency(estimateAnalysis.spread)}
              hint="Diferencia entre el estimado alto y bajo"
            />
          </div>

          {estimateAnalysis.warning ? (
            <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
              <p className="font-semibold">Revisa la diferencia entre estimados</p>
              <p>{estimateAnalysis.warning}</p>
            </div>
          ) : null}

          <div className="mt-4">
            <Button
              type="button"
              onClick={() => onUseArv(Math.round(estimateAnalysis.average))}
              disabled={!canUseEstimateAverage}
            >
              Usar Promedio como ARV
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 p-4">
          <p className="mb-1 text-sm font-medium text-foreground">Analizador de Comparables</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Revisión avanzada usando hasta 5 propiedades comparables vendidas ingresadas por el usuario.
          </p>

          <div className="rounded-lg border border-border/60 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Propiedad Analizada</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                id="arv-subject-sqft"
                label="Pies Cuadrados"
                value={subject.sqft}
                onValueChange={(v) => updateSubject({ sqft: v })}
              />
              <NumberField
                id="arv-subject-beds"
                label="Habitaciones"
                value={subject.beds}
                onValueChange={(v) => updateSubject({ beds: v })}
              />
              <NumberField
                id="arv-subject-baths"
                label="Baños"
                value={subject.baths}
                onValueChange={(v) => updateSubject({ baths: v })}
              />
              <NumberField
                id="arv-subject-year"
                label="Año de Construcción"
                value={subject.yearBuilt}
                onValueChange={(v) => updateSubject({ yearBuilt: v })}
              />

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="arv-subject-condition"
                  className="text-sm font-medium text-foreground"
                >
                  Condición Objetivo
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

          <div className="mt-4 flex flex-col gap-4">
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
                      Eliminar
                    </Button>
                  )}
                </div>

                <div className="mb-4 flex flex-col gap-2">
                  <label
                    htmlFor={`arv-comp-address-${comp.id}`}
                    className="text-sm font-medium text-foreground"
                  >
                    Dirección
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
                    label="Precio de Venta"
                    prefix="$"
                    value={comp.soldPrice}
                    onValueChange={(v) => updateComp(comp.id, { soldPrice: v })}
                  />
                  <NumberField
                    id={`arv-comp-sqft-${comp.id}`}
                    label="Pies Cuadrados"
                    value={comp.sqft}
                    onValueChange={(v) => updateComp(comp.id, { sqft: v })}
                  />
                  <NumberField
                    id={`arv-comp-beds-${comp.id}`}
                    label="Habitaciones"
                    value={comp.beds}
                    onValueChange={(v) => updateComp(comp.id, { beds: v })}
                  />
                  <NumberField
                    id={`arv-comp-baths-${comp.id}`}
                    label="Baños"
                    value={comp.baths}
                    onValueChange={(v) => updateComp(comp.id, { baths: v })}
                  />
                  <NumberField
                    id={`arv-comp-year-${comp.id}`}
                    label="Año de Construcción"
                    value={comp.yearBuilt}
                    onValueChange={(v) => updateComp(comp.id, { yearBuilt: v })}
                  />
                  <NumberField
                    id={`arv-comp-distance-${comp.id}`}
                    label="Distancia"
                    suffix="mi"
                    value={comp.distance}
                    allowDecimal
                    onValueChange={(v) => updateComp(comp.id, { distance: v })}
                  />

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`arv-comp-condition-${comp.id}`}
                      className="text-sm font-medium text-foreground"
                    >
                      Condición
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

          <div className="mt-4">
            <Button type="button" variant="outline" onClick={addComp} disabled={comps.length >= 5}>
              <Plus className="size-4" />
              Agregar Comparable
            </Button>
          </div>

          <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">Resultado del ARV por Comparables</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ResultCard
                label="ARV Sugerido"
                value={formatCurrency(compsAnalysis.suggestedArv)}
                hint="Basado en el precio promedio por pie cuadrado"
                emphasis="primary"
              />
              <ResultCard
                label="Promedio $/Pie²"
                value={formatCurrency(compsAnalysis.averagePricePerSqft)}
                hint={`${compsAnalysis.usableComps.length} comparable(s) usado(s)`}
              />
              <ResultCard label="ARV Bajo" value={formatCurrency(compsAnalysis.lowArv)} hint="-5%" />
              <ResultCard label="ARV Alto" value={formatCurrency(compsAnalysis.highArv)} hint="+5%" />
              <ResultCard
                label="Confianza"
                value={CONFIDENCE_LABELS[compsAnalysis.confidence]}
                hint="Basado en cantidad y similitud de comparables"
              />
            </div>

            {compsAnalysis.warnings.length > 0 && (
              <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
                <p className="mb-2 font-semibold">Revisa estos comparables:</p>
                <ul className="list-inside list-disc space-y-1">
                  {compsAnalysis.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <Button
                type="button"
                onClick={() => onUseArv(Math.round(compsAnalysis.suggestedArv))}
                disabled={!canUseCompsArv}
              >
                Usar ARV por Comparables
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}