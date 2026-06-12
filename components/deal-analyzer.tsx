"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { WholesalePanel } from "@/components/wholesale-panel"
import { FlipPanel } from "@/components/flip-panel"
import { HoldPanel } from "@/components/hold-panel"
import { PropertyInfoCard } from "@/components/deal-shared"
import { PROPERTY_DEFAULTS, type PropertyInfo } from "@/lib/deal-analyzer"

type StrategyTab = "wholesaling" | "fix-and-flip" | "buy-and-hold"

const VALID_STRATEGIES: StrategyTab[] = [
  "wholesaling",
  "fix-and-flip",
  "buy-and-hold",
]

function getValidStrategy(value: string | null): StrategyTab {
  if (value && VALID_STRATEGIES.includes(value as StrategyTab)) {
    return value as StrategyTab
  }

  return "wholesaling"
}

export function DealAnalyzer() {
  const searchParams = useSearchParams()
  const [property, setProperty] = useState<PropertyInfo>(PROPERTY_DEFAULTS)
  const [activeStrategy, setActiveStrategy] = useState<StrategyTab>(() =>
    getValidStrategy(searchParams.get("strategy")),
  )

  useEffect(() => {
    setActiveStrategy(getValidStrategy(searchParams.get("strategy")))
  }, [searchParams])

  function updateProperty(next: Partial<PropertyInfo>) {
    setProperty((prev) => ({ ...prev, ...next }))
  }

  return (
    <div className="flex flex-col gap-6">
      <PropertyInfoCard value={property} onChange={updateProperty} />

      <Tabs value={activeStrategy} onValueChange={(value) => setActiveStrategy(value as StrategyTab)} className="gap-6">
        <TabsList className="h-auto w-full max-w-md flex-wrap p-1 sm:h-10">
          <TabsTrigger value="wholesaling" className="py-1.5">
            Wholesaling
          </TabsTrigger>
          <TabsTrigger value="fix-and-flip" className="py-1.5">
            Fix &amp; Flip
          </TabsTrigger>
          <TabsTrigger value="buy-and-hold" className="py-1.5">
            Buy &amp; Hold
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wholesaling">
          <WholesalePanel property={property} />
        </TabsContent>

        <TabsContent value="fix-and-flip">
          <FlipPanel property={property} />
        </TabsContent>

        <TabsContent value="buy-and-hold">
          <HoldPanel property={property} />
        </TabsContent>
      </Tabs>
    </div>
  )
}