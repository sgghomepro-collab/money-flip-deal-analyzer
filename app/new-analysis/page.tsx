import { Suspense } from "react"
import { DealAnalyzer } from "@/components/deal-analyzer"

export default function NewAnalysisPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Nuevo Análisis</h1>
        <p className="text-sm text-muted-foreground">
          Analiza los números de cualquier trato. Solo cambia los campos amarillos.
        </p>
      </div>

      <Suspense fallback={null}>
        <DealAnalyzer />
      </Suspense>
    </div>
  )
}