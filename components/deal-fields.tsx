"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Campos editables amarillos
// Todo lo que el alumno debe cambiar vive aquí.
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
  const isCurrency = prefix === "$"
  const normalizedLabel = label.toLowerCase()

  const shouldAllowDecimal =
    allowDecimal === true ||
    suffix === "%" ||
    normalizedLabel.includes("bath") ||
    normalizedLabel.includes("baths") ||
    normalizedLabel.includes("baño") ||
    normalizedLabel.includes("baños")

  const [rawText, setRawText] = useState(() => {
    if (value === 0) return ""
    if (isCurrency && !shouldAllowDecimal) return value.toLocaleString("en-US")
    return String(value)
  })

  useEffect(() => {
    const numericText = rawText.replace(/,/g, "")
    const currentNumber = numericText === "" || numericText === "." ? 0 : Number(numericText)

    if (Number.isFinite(currentNumber) && currentNumber === value) return

    if (value === 0) {
      setRawText("")
      return
    }

    if (isCurrency && !shouldAllowDecimal) {
      setRawText(value.toLocaleString("en-US"))
      return
    }

    setRawText(String(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isCurrency, shouldAllowDecimal])

  function cleanDecimalInput(raw: string) {
    let cleaned = raw.replace(",", ".").replace(/[^\d.]/g, "")

    const firstDot = cleaned.indexOf(".")
    if (firstDot !== -1) {
      cleaned =
        cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, "")
    }

    return cleaned
  }

  function cleanWholeNumberInput(raw: string) {
    return raw.replace(/[^\d]/g, "")
  }

  function handleChange(raw: string) {
    if (shouldAllowDecimal) {
      const cleaned = cleanDecimalInput(raw)

      setRawText(cleaned)

      if (cleaned === "" || cleaned === ".") {
        onValueChange(0)
        return
      }

      const parsedValue = Number.parseFloat(cleaned)
      onValueChange(Number.isFinite(parsedValue) ? parsedValue : 0)
      return
    }

    const cleaned = cleanWholeNumberInput(raw)
    const parsedValue = cleaned ? Number(cleaned) : 0

    setRawText(isCurrency && cleaned ? parsedValue.toLocaleString("en-US") : cleaned)
    onValueChange(parsedValue)
  }

  function handleBlur() {
    if (!shouldAllowDecimal) return

    if (rawText.trim() === "" || rawText === ".") {
      setRawText("")
      onValueChange(0)
      return
    }

    const parsedValue = Number.parseFloat(rawText)

    if (!Number.isFinite(parsedValue)) {
      setRawText("")
      onValueChange(0)
      return
    }

    setRawText(String(parsedValue))
    onValueChange(parsedValue)
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
          type="text"
          inputMode={shouldAllowDecimal ? "decimal" : "numeric"}
          value={rawText}
          placeholder={placeholder}
          className={cn(yellowFieldClass, prefix && "pl-7", suffix && "pr-9")}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
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
// Tarjeta de resultado calculado
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

// Fila pequeña de resultado calculado, usada para desgloses.
export function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  )
}

// Aviso para recordarle al alumno cuáles campos debe editar.
export function YellowNotice() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-editable-border bg-editable px-3 py-2 text-sm text-editable-foreground">
      <span
        className="size-4 shrink-0 rounded-sm border border-editable-border bg-editable"
        aria-hidden
      />
      <span>Solo cambia los campos amarillos. Todo lo demás se calcula automáticamente.</span>
    </div>
  )
}