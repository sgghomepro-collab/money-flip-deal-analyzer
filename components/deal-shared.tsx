"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, Copy, MapPin, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  buildOfferEmail,
  EMAIL_TONE_LABELS,
  formatCurrency,
  type DealDecision,
  type EmailTone,
  type PropertyInfo,
} from "@/lib/deal-analyzer"
import { NumberField, TextField, YellowNotice } from "@/components/deal-fields"

// ---------------------------------------------------------------------------
// Shared Property Information card (global across all strategies)
// ---------------------------------------------------------------------------

export function PropertyInfoCard({
  value,
  onChange,
}: {
  value: PropertyInfo
  onChange: (next: Partial<PropertyInfo>) => void
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-muted-foreground" />
          <CardTitle className="text-lg">Property Information</CardTitle>
        </div>
        <CardDescription>
          Applies to every strategy below. Only change the yellow fields.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <YellowNotice />

        <TextField
          id="prop-address"
          label="Property Address"
          value={value.address}
          onValueChange={(v) => onChange({ address: v })}
          placeholder="123 Main St"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <TextField
              id="prop-city"
              label="City"
              value={value.city}
              onValueChange={(v) => onChange({ city: v })}
              placeholder="Austin"
            />
          </div>
          <div className="sm:col-span-1">
            <TextField
              id="prop-state"
              label="State"
              value={value.state}
              maxLength={2}
              transform={(raw) => raw.toUpperCase()}
              onValueChange={(v) => onChange({ state: v })}
              placeholder="TX"
            />
          </div>
          <div className="sm:col-span-2">
            <TextField
              id="prop-zip"
              label="Zip Code"
              value={value.zip}
              maxLength={5}
              transform={(raw) => raw.replace(/[^\d]/g, "")}
              onValueChange={(v) => onChange({ zip: v })}
              placeholder="78701"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Universal offer email (works for every strategy)
// ---------------------------------------------------------------------------

const EMAIL_TONES: EmailTone[] = ["warm", "direct", "soft-follow-up"]

type EmailLanguage = "english" | "spanish"

const EMAIL_LANGUAGE_LABELS: Record<EmailLanguage, string> = {
  english: "English",
  spanish: "Español",
}

function buildSpanishOfferEmail({
  propertyAddress,
  recipientName,
  studentName,
  studentPhone,
  offerAmount,
  tone,
}: {
  propertyAddress: string
  recipientName: string
  studentName: string
  studentPhone: string
  offerAmount: number
  tone: EmailTone
}) {
  const property = propertyAddress || "[Dirección de la Propiedad]"
  const recipient = recipientName || "[Nombre del Vendedor]"
  const name = studentName || "[Tu Nombre]"
  const phone = studentPhone || "[Tu Teléfono]"
  const amount = offerAmount > 0 ? formatCurrency(offerAmount) : "[Monto de la Oferta]"

  const subject = `Oferta por ${property}`

  let body: string

  if (tone === "direct") {
    body = [
      `Hola ${recipient},`,
      "",
      `Te escribo sobre la propiedad ubicada en ${property}.`,
      "",
      `Después de revisar los números, las reparaciones y las condiciones actuales del mercado, me gustaría presentar una oferta en efectivo/as-is de ${amount}.`,
      "",
      "Con una oferta as-is, no tendrías que hacer reparaciones ni mejoras antes de vender. También puedo trabajar con el tiempo de cierre que sea más conveniente para ti.",
      "",
      "Si esta oferta te funciona, podemos revisar los próximos pasos.",
      "",
      "Gracias por tu tiempo,",
      "",
      name,
      phone,
    ].join("\n")
  } else if (tone === "soft-follow-up") {
    body = [
      `Hola ${recipient},`,
      "",
      "Quería hacer seguimiento y ver si ahora sería un mejor momento para conversar.",
      "",
      `Sigo interesado en la propiedad ubicada en ${property}, y me gustaría presentar una oferta de ${amount}.`,
      "",
      "La oferta sería as-is, así que no tendrías que hacer reparaciones ni mejoras antes de vender. También puedo adaptarme al tiempo de cierre que prefieras.",
      "",
      "Sin presión. Si quieres revisarlo, estoy disponible cuando te quede bien.",
      "",
      "Gracias por tu tiempo,",
      "",
      name,
      phone,
    ].join("\n")
  } else {
    body = [
      `Hola ${recipient},`,
      "",
      "Espero que estés muy bien.",
      "",
      `Te escribo sobre la propiedad ubicada en ${property}. Entiendo que vender una propiedad es una decisión importante, y mi intención es hacer el proceso lo más claro, sencillo y respetuoso posible.`,
      "",
      `Después de revisar los números, las reparaciones y las condiciones actuales del mercado, me gustaría presentar una oferta de ${amount}.`,
      "",
      "Esta sería una oferta as-is, lo que significa que no tendrías que hacer reparaciones ni mejoras antes de vender. También puedo trabajar con el tiempo de cierre que sea más conveniente para ti.",
      "",
      "Si es algo que considerarías, con gusto podemos hablar de los próximos pasos.",
      "",
      "Gracias por tu tiempo,",
      "",
      name,
      phone,
    ].join("\n")
  }

  return { subject, body }
}

export function OfferEmail({
  propertyAddress,
  calculatedOffer,
}: {
  propertyAddress: string
  calculatedOffer: number
}) {
  const [recipientName, setRecipientName] = useState("")
  const [studentName, setStudentName] = useState("")
  const [studentPhone, setStudentPhone] = useState("")
  const [offerAmount, setOfferAmount] = useState(calculatedOffer)
  const [offerEdited, setOfferEdited] = useState(false)
  const [tone, setTone] = useState<EmailTone>("warm")
  const [language, setLanguage] = useState<EmailLanguage>("english")

  // The offer defaults to the calculated value but the student may override it.
  // Until they edit it, keep it in sync with the selected strategy's offer.
  useEffect(() => {
    if (!offerEdited) setOfferAmount(calculatedOffer)
  }, [calculatedOffer, offerEdited])

  const generated = useMemo(() => {
    if (language === "spanish") {
      return buildSpanishOfferEmail({
        propertyAddress,
        recipientName,
        studentName,
        studentPhone,
        offerAmount,
        tone,
      })
    }

    return buildOfferEmail({
      propertyAddress,
      recipientName,
      studentName,
      studentPhone,
      offerAmount,
      tone,
    })
  }, [propertyAddress, recipientName, studentName, studentPhone, offerAmount, tone, language])

  const generatedText = `Subject: ${generated.subject}\n\n${generated.body}`

  // The preview is editable. We track edits separately and reset whenever the
  // generated email changes (e.g. a field, tone, or language change) so it stays in sync.
  const [editedText, setEditedText] = useState(generatedText)
  useEffect(() => {
    setEditedText(generatedText)
  }, [generatedText])

  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(editedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-muted-foreground" />
          <CardTitle className="text-lg">Offer Email</CardTitle>
        </div>
        <CardDescription>
          Fill in the yellow fields, choose the language and tone, then copy the email to send to the seller.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <YellowNotice />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="email-recipient"
            label="Recipient Name"
            value={recipientName}
            onValueChange={setRecipientName}
            placeholder="Seller name"
          />
          <TextField
            id="email-student"
            label="Student Name"
            value={studentName}
            onValueChange={setStudentName}
            placeholder="Your name"
          />
          <TextField
            id="email-phone"
            label="Student Phone"
            value={studentPhone}
            onValueChange={setStudentPhone}
            placeholder="(555) 123-4567"
          />
          <NumberField
            id="email-offer"
            label="Offer Amount"
            prefix="$"
            value={offerAmount}
            onValueChange={(v) => {
              setOfferEdited(true)
              setOfferAmount(v)
            }}
            hint="Defaults to the calculated offer. Edit to override."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email-language" className="text-sm">
              Email Language
            </Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as EmailLanguage)}>
              <SelectTrigger id="email-language" className="w-full">
                <SelectValue>{(value) => EMAIL_LANGUAGE_LABELS[value as EmailLanguage]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">{EMAIL_LANGUAGE_LABELS.english}</SelectItem>
                <SelectItem value="spanish">{EMAIL_LANGUAGE_LABELS.spanish}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email-tone" className="text-sm">
              Email Tone
            </Label>
            <Select value={tone} onValueChange={(v) => setTone(v as EmailTone)}>
              <SelectTrigger id="email-tone" className="w-full">
                <SelectValue>{(value) => EMAIL_TONE_LABELS[value as EmailTone]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {EMAIL_TONE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="text-base font-semibold text-foreground">Email Preview</h3>
              <p className="text-sm text-muted-foreground">
                You can edit the text below before copying.
              </p>
            </div>
            <Button
              onClick={handleCopy}
              variant={copied ? "secondary" : "default"}
              className="shrink-0"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy Email"}
            </Button>
          </div>
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="min-h-96 font-sans text-sm leading-relaxed"
            aria-label="Offer email preview"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Coach notes (simple Spanish)
// ---------------------------------------------------------------------------

export function CoachNotes({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-accent bg-accent/40 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-accent-foreground">Notas del Coach</span>
      </div>
      <div className="flex flex-col gap-1.5 text-sm leading-relaxed text-foreground/80">
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Deal decision banner (Fix & Flip)
// ---------------------------------------------------------------------------

const DECISION_STYLES: Record<DealDecision, string> = {
  "HAY DINERO": "border-success/40 bg-success text-success-foreground",
  REVISAR: "border-warning/50 bg-warning text-warning-foreground",
  "NO HAY DINERO": "border-destructive/40 bg-destructive text-white",
}

const DECISION_SUBTITLE: Record<DealDecision, string> = {
  "HAY DINERO": "El trato cumple con tu ROI mínimo. ¡Buen negocio!",
  REVISAR: "Hay ganancia, pero no llega a tu ROI mínimo. Negocia mejor.",
  "NO HAY DINERO": "Este trato pierde dinero. No lo hagas así.",
}

export function DecisionBanner({ decision }: { decision: DealDecision }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border px-5 py-4 text-center",
        DECISION_STYLES[decision],
      )}
    >
      <span className="text-2xl font-bold tracking-tight">{decision}</span>
      <span className="text-sm opacity-90">{DECISION_SUBTITLE[decision]}</span>
    </div>
  )
}