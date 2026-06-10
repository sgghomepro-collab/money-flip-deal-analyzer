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

  // The offer defaults to the calculated value but the student may override it.
  // Until they edit it, keep it in sync with the selected strategy's offer.
  useEffect(() => {
    if (!offerEdited) setOfferAmount(calculatedOffer)
  }, [calculatedOffer, offerEdited])

  const generated = useMemo(
    () =>
      buildOfferEmail({
        propertyAddress,
        recipientName,
        studentName,
        studentPhone,
        offerAmount,
        tone,
      }),
    [propertyAddress, recipientName, studentName, studentPhone, offerAmount, tone],
  )

  const generatedText = `Subject: ${generated.subject}\n\n${generated.body}`

  // The preview is editable. We track edits separately and reset whenever the
  // generated email changes (e.g. a field or tone change) so it stays in sync.
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
          Fill in the yellow fields, pick a tone, then copy the email to send to the seller.
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
