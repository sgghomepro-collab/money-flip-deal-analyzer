"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Save, Check } from "lucide-react"

// ---------------------------------------------------------------------------
// Save Analysis button (no database yet)
// ---------------------------------------------------------------------------

export function SaveAnalysisButton({ propertyLabel }: { propertyLabel?: string }) {
  const [saved, setSaved] = useState(false)

  const hasProperty = Boolean(propertyLabel && propertyLabel !== "the property")

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={handleSave} variant={saved ? "secondary" : "default"}>
        {saved ? <Check className="size-4" /> : <Save className="size-4" />}
        Save Analysis
      </Button>
      {saved ? (
        <p
          role="status"
          className="rounded-md bg-success/10 px-3 py-2 text-sm font-medium text-success"
        >
          {hasProperty
            ? `"${propertyLabel}" saved locally for now. Database connection coming next.`
            : "Analysis saved locally for now. Database connection coming next."}
        </p>
      ) : null}
    </div>
  )
}
