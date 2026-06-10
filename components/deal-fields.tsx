"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Editable "yellow cell" fields. Anything a student should change lives here.
// ---------------------------------------------------------------------------

const yellowFieldClass =
  "bg-editable border-editable-border text-editable-foreground placeholder:text-editable-foreground/50 focus-visible:ring-editable-border/60"

interface FieldWrapperProps {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}

function FieldWrapper({ id, label, hint, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

interface TextFieldProps {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  hint?: string
  maxLength?: number
  transform?: (raw: string) => string
}

export function TextField({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  hint,
  maxLength,
  transform,
}: TextFieldProps) {
  return (
    <FieldWrapper id={id} label={label} hint={hint}>
      <Input
        id={id}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        className={yellowFieldClass}
        onChange={(e) => onValueChange(transform ? transform(e.target.value) : e.target.value)}
      />
    </FieldWrapper>
  )
}

interface NumberFieldProps {
  id: string
  label: string
  value: number
  onValueChange: (value: number) => void
  placeholder?: string
  hint?: string
  prefix?: string
  suffix?: string
  allowDecimal?: boolean
}

export function NumberField({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  hint,
  prefix,
  suffix,
  allowDecimal,
}: NumberFieldProps) {
  // For currency-style fields we display thousands separators.
  const isCurrency = prefix === "$"

  // Decimal fields keep their own raw text state so students can type
  // intermediate values like "1." or "0.3" without them being stripped.
  const [decimalText, setDecimalText] = useState(() =>
    value === 0 ? "" : String(value),
  )

  // Keep local text in sync if the value changes from outside (e.g. reset),
  // but don't clobber an in-progress entry like "1." that parses to the same number.
  useEffect(() => {
    if (!allowDecimal) return
    if (Number(decimalText) !== value) {
      setDecimalText(value === 0 ? "" : String(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, allowDecimal])

  const display = (() => {
    if (allowDecimal) return decimalText
    if (value === 0) return ""
    if (isCurrency) return value.toLocaleString("en-US")
    return String(value)
  })()

  function handleChange(raw: string) {
    if (allowDecimal) {
      // Allow digits and a single decimal point.
      let cleaned = raw.replace(/[^\d.]/g, "")
      const firstDot = cleaned.indexOf(".")
      if (firstDot !== -1) {
        cleaned =
          cleaned.slice(0, firstDot + 1) +
          cleaned.slice(firstDot + 1).replace(/\./g, "")
      }
      setDecimalText(cleaned)
      onValueChange(cleaned === "" || cleaned === "." ? 0 : Number(cleaned))
      return
    }
    const cleaned = raw.replace(/[^\d]/g, "")
    onValueChange(cleaned ? Number(cleaned) : 0)
  }

  return (
    <FieldWrapper id={id} label={label} hint={hint}>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-editable-foreground/70">
            {prefix}
          </span>
        ) : null}
        <Input
          id={id}
          type={allowDecimal ? "number" : "text"}
          step={allowDecimal ? "0.01" : undefined}
          inputMode={allowDecimal ? "decimal" : "numeric"}
          value={display}
          placeholder={placeholder}
          className={cn(yellowFieldClass, prefix && "pl-7", suffix && "pr-9")}
          onChange={(e) => handleChange(e.target.value)}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-editable-foreground/70">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldWrapper>
  )
}

// ---------------------------------------------------------------------------
// Read-only calculated result card
// ---------------------------------------------------------------------------

interface ResultCardProps {
  label: string
  value: string
  hint?: string
  emphasis?: "default" | "primary"
}

export function ResultCard({ label, value, hint, emphasis = "default" }: ResultCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-4",
        emphasis === "primary"
          ? "border-primary/30 bg-primary/5"
          : "border-border/60 bg-card",
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "text-xl font-semibold tabular-nums sm:text-2xl",
          emphasis === "primary" ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

// Small inline read-only row, used for itemized cost breakdowns.
export function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  )
}

// Helper text banner reminding students which cells to edit.
export function YellowNotice() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-editable-border bg-editable px-3 py-2 text-sm text-editable-foreground">
      <span className="size-4 shrink-0 rounded-sm border border-editable-border bg-editable" aria-hidden />
      <span>Only change the yellow fields. Everything else is calculated for you.</span>
    </div>
  )
}
