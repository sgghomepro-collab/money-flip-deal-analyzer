"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { WholesalePanel } from "@/components/wholesale-panel"
import { FlipPanel } from "@/components/flip-panel"
import { HoldPanel } from "@/components/hold-panel"
import { PropertyInfoCard } from "@/components/deal-shared"
import { PROPERTY_DEFAULTS, type PropertyInfo } from "@/lib/deal-analyzer"

export function DealAnalyzer() {
  const [property, setProperty] = useState<PropertyInfo>(PROPERTY_DEFAULTS)

  function updateProperty(next: Partial<PropertyInfo>) {
    setProperty((prev) => ({ ...prev, ...next }))
  }

  return (
    <div className="flex flex-col gap-6">
      <PropertyInfoCard value={property} onChange={updateProperty} />

      <Tabs defaultValue="wholesaling" className="gap-6">
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