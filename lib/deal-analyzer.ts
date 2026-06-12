// ---------------------------------------------------------------------------
// Money Flip Deal Analyzer - calculation engine
// ---------------------------------------------------------------------------

export type Strategy = "wholesaling" | "fix-and-flip" | "buy-and-hold"

export const STRATEGY_LABELS: Record<Strategy, string> = {
  wholesaling: "Wholesaling",
  "fix-and-flip": "Fix & Flip",
  "buy-and-hold": "Buy & Hold",
}

export type DealDecision = "HAY DINERO" | "REVISAR" | "NO HAY DINERO"

// ---------------------------------------------------------------------------
// Shared property information (global across all strategies)
// ---------------------------------------------------------------------------

export interface PropertyInfo {
  address: string
  city: string
  state: string
  zip: string
}

export const PROPERTY_DEFAULTS: PropertyInfo = {
  address: "",
  city: "",
  state: "",
  zip: "",
}

export function formatProperty(p: PropertyInfo, fallback = "the property"): string {
  return (
    [p.address, [p.city, p.state].filter(Boolean).join(", "), p.zip]
      .filter(Boolean)
      .join(", ") || fallback
  )
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "$0"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "0%"
  return `${(value * 100).toFixed(digits)}%`
}

// ---------------------------------------------------------------------------
// Wholesaling
// ---------------------------------------------------------------------------

export interface WholesaleInputs {
  arv: number
  repairs: number
  discountPercent: number // whole number, e.g. 30
  assignmentFee: number
}

export interface WholesaleResults {
  mao: number
  sellerOffer: number
  estimatedProfit: number
}

export function analyzeWholesale(i: WholesaleInputs): WholesaleResults {
  const mao = i.arv * (1 - i.discountPercent / 100) - i.repairs
  const sellerOffer = mao - i.assignmentFee

  return {
    mao,
    sellerOffer,
    estimatedProfit: i.assignmentFee,
  }
}

export const WHOLESALE_DEFAULTS: WholesaleInputs = {
  arv: 250000,
  repairs: 35000,
  discountPercent: 30,
  assignmentFee: 10000,
}

// ---------------------------------------------------------------------------
// Fix & Flip
// ---------------------------------------------------------------------------

export interface FlipInputs {
  timelineMonths: number
  arv: number
  actualSalePrice: number // optional scenario / real closing price. If 0, ARV is used.
  discountPercent: number // applied to ARV, whole number
  renovationBudget: number
  downPaymentPercent: number // HML down payment percent
  pointsPercent: number // HML points percent
  annualInterestPercent: number // HML annual interest rate percent
  hmlAdminFee: number
  purchaseClosingPercent: number // whole number
  saleRealtorPercent: number // whole number
  saleClosingPercent: number // whole number
  holdingCosts: number // total during project
  unexpectedCosts: number
  minRoiPercent: number // whole number
}

export interface FlipResults {
  salePriceUsed: number
  basePrice: number
  netOffer: number
  downPayment: number
  financedPurchaseAmount: number
  financedRepairsAmount: number
  loanAmount: number
  originationPoints: number
  hmlInterest: number
  totalHmlExpenses: number
  purchaseClosingCostBase: number
  purchaseClosingCosts: number
  cashToClose: number
  saleRealtorCosts: number
  saleClosingCosts: number
  totalPurchaseAndSaleCosts: number
  totalProjectCost: number
  cashBack: number
  netProfit: number
  realRoi: number
  minProfitRequired: number
  totalCarryingCosts: number
  capitalRequired: number
  decision: DealDecision
}

export function analyzeFlip(i: FlipInputs): FlipResults {
  // If the student enters an actual sale price, use it for final project results.
  // If not, keep the original behavior and use ARV.
  const salePriceUsed = i.actualSalePrice > 0 ? i.actualSalePrice : i.arv

  // 1. Offer
  const basePrice = i.arv * (1 - i.discountPercent / 100)
  const netOffer = basePrice - i.renovationBudget

  // 2. Hard Money Loan
  const downPayment = netOffer * (i.downPaymentPercent / 100)
  const financedPurchaseAmount = netOffer - downPayment
  const financedRepairsAmount = i.renovationBudget // lender finances 100% of renovations
  const loanAmount = financedPurchaseAmount + financedRepairsAmount

  // 3. Hard Money Costs
  const originationPoints = loanAmount * (i.pointsPercent / 100)
  const hmlInterest = loanAmount * (i.annualInterestPercent / 100) * (i.timelineMonths / 12)
  const totalHmlExpenses = loanAmount + originationPoints + hmlInterest + i.hmlAdminFee

  // 4. Purchase Costs
  const purchaseClosingCostBase = netOffer * (i.purchaseClosingPercent / 100)
  const purchaseClosingCosts = purchaseClosingCostBase + originationPoints
  const cashToClose = downPayment + purchaseClosingCosts + i.hmlAdminFee

  // 5. Sale Costs
  const saleRealtorCosts = salePriceUsed * (i.saleRealtorPercent / 100)
  const saleClosingCosts = salePriceUsed * (i.saleClosingPercent / 100)

  // 6. Total Purchase and Sale Costs
  const totalPurchaseAndSaleCosts =
    purchaseClosingCostBase +
    saleRealtorCosts +
    saleClosingCosts +
    i.holdingCosts +
    i.unexpectedCosts

  // 7. Total Project Cost
  const totalProjectCost = totalHmlExpenses + totalPurchaseAndSaleCosts

  // 8. Cash Back
  const cashBack = salePriceUsed - totalProjectCost

  // 9. Net Profit
  const netProfit = cashBack - cashToClose

  // 10. Real ROI
  const realRoi = cashToClose > 0 ? netProfit / cashToClose : 0

  // 11. Minimum Profit Required
  const minProfitRequired = cashToClose * (i.minRoiPercent / 100)

  // 12. Carrying Costs
  const totalCarryingCosts = hmlInterest + i.holdingCosts

  // 13. Capital Required
  const capitalRequired = cashToClose + hmlInterest + i.holdingCosts

  // 14. Deal Decision
  let decision: DealDecision
  if (netProfit <= 0) {
    decision = "NO HAY DINERO"
  } else if (netProfit >= minProfitRequired) {
    decision = "HAY DINERO"
  } else {
    decision = "REVISAR"
  }

  return {
    salePriceUsed,
    basePrice,
    netOffer,
    downPayment,
    financedPurchaseAmount,
    financedRepairsAmount,
    loanAmount,
    originationPoints,
    hmlInterest,
    totalHmlExpenses,
    purchaseClosingCostBase,
    purchaseClosingCosts,
    cashToClose,
    saleRealtorCosts,
    saleClosingCosts,
    totalPurchaseAndSaleCosts,
    totalProjectCost,
    cashBack,
    netProfit,
    realRoi,
    minProfitRequired,
    totalCarryingCosts,
    capitalRequired,
    decision,
  }
}

export const FLIP_DEFAULTS: FlipInputs = {
  timelineMonths: 4,
  arv: 200000,
  actualSalePrice: 0,
  discountPercent: 30,
  renovationBudget: 40000,
  downPaymentPercent: 20,
  pointsPercent: 3,
  annualInterestPercent: 11,
  hmlAdminFee: 0,
  purchaseClosingPercent: 5,
  saleRealtorPercent: 6,
  saleClosingPercent: 3,
  holdingCosts: 2000,
  unexpectedCosts: 0,
  minRoiPercent: 30,
}

// ---------------------------------------------------------------------------
// Buy & Hold
// ---------------------------------------------------------------------------

export interface HoldInputs {
  purchasePrice: number
  downPaymentPercent: number // whole number
  interestRatePercent: number // whole number
  loanTermYears: number
  closingPercent: number // whole number
  additionalCosts: number
  monthlyRent: number
  managementPercent: number // whole number
  taxesPercent: number // whole number, annual % of purchase price
  insurancePercent: number // whole number, annual % of purchase price
  reservesPercent: number // whole number of rent
  hoaMonthly: number
}

export interface HoldResults {
  downPayment: number
  loanAmount: number
  monthlyPI: number
  closingCosts: number
  capitalInvested: number
  managementMonthly: number
  taxesMonthly: number
  insuranceMonthly: number
  reservesMonthly: number
  totalOperatingExpenses: number
  noiMonthly: number
  noiAnnual: number
  cashFlowMonthly: number
  cashFlowAnnual: number
  capRate: number
  cashOnCash: number
}

export function analyzeHold(i: HoldInputs): HoldResults {
  const downPayment = i.purchasePrice * (i.downPaymentPercent / 100)
  const loanAmount = i.purchasePrice - downPayment

  // Standard amortization for monthly principal & interest
  const monthlyRate = i.interestRatePercent / 100 / 12
  const n = i.loanTermYears * 12
  let monthlyPI = 0

  if (loanAmount > 0 && n > 0) {
    if (monthlyRate === 0) {
      monthlyPI = loanAmount / n
    } else {
      const factor = Math.pow(1 + monthlyRate, n)
      monthlyPI = (loanAmount * monthlyRate * factor) / (factor - 1)
    }
  }

  const closingCosts = i.purchasePrice * (i.closingPercent / 100)
  const capitalInvested = downPayment + closingCosts + i.additionalCosts

  const managementMonthly = i.monthlyRent * (i.managementPercent / 100)
  const taxesMonthly = (i.purchasePrice * (i.taxesPercent / 100)) / 12
  const insuranceMonthly = (i.purchasePrice * (i.insurancePercent / 100)) / 12
  const reservesMonthly = i.monthlyRent * (i.reservesPercent / 100)

  const totalOperatingExpenses =
    managementMonthly + taxesMonthly + insuranceMonthly + reservesMonthly + i.hoaMonthly

  const noiMonthly = i.monthlyRent - totalOperatingExpenses
  const noiAnnual = noiMonthly * 12
  const cashFlowMonthly = noiMonthly - monthlyPI
  const cashFlowAnnual = cashFlowMonthly * 12
  const capRate = i.purchasePrice > 0 ? noiAnnual / i.purchasePrice : 0
  const cashOnCash = capitalInvested > 0 ? cashFlowAnnual / capitalInvested : 0

  return {
    downPayment,
    loanAmount,
    monthlyPI,
    closingCosts,
    capitalInvested,
    managementMonthly,
    taxesMonthly,
    insuranceMonthly,
    reservesMonthly,
    totalOperatingExpenses,
    noiMonthly,
    noiAnnual,
    cashFlowMonthly,
    cashFlowAnnual,
    capRate,
    cashOnCash,
  }
}

export const HOLD_DEFAULTS: HoldInputs = {
  purchasePrice: 200000,
  downPaymentPercent: 25,
  interestRatePercent: 7,
  loanTermYears: 30,
  closingPercent: 3,
  additionalCosts: 2000,
  monthlyRent: 1800,
  managementPercent: 8,
  taxesPercent: 1.2,
  insurancePercent: 0.5,
  reservesPercent: 5,
  hoaMonthly: 0,
}

// ---------------------------------------------------------------------------
// Universal offer email (works for every strategy)
// ---------------------------------------------------------------------------

export type EmailTone = "warm" | "direct" | "soft-follow-up"

export const EMAIL_TONE_LABELS: Record<EmailTone, string> = {
  warm: "Warm & Respectful",
  direct: "Direct Investor",
  "soft-follow-up": "Soft Follow-Up",
}

export interface OfferEmailFields {
  propertyAddress: string
  recipientName: string
  studentName: string
  studentPhone: string
  offerAmount: number
  tone: EmailTone
}

export interface OfferEmailResult {
  subject: string
  body: string
}

export function buildOfferEmail(f: OfferEmailFields): OfferEmailResult {
  const property = f.propertyAddress || "[Property Address]"
  const recipient = f.recipientName || "[Recipient Name]"
  const studentName = f.studentName || "[Student Name]"
  const studentPhone = f.studentPhone || "[Student Phone]"
  const amount = f.offerAmount > 0 ? formatCurrency(f.offerAmount) : "[Offer Amount]"

  const subject = `Offer for ${property}`

  let body: string

  if (f.tone === "direct") {
    body = [
      `Hi ${recipient},`,
      "",
      `I'm reaching out about the property at ${property}.`,
      "",
      `Based on the numbers, the repairs, and current market conditions, I'd like to present an as-is offer of ${amount}.`,
      "",
      "With an as-is offer you wouldn't need to make any repairs or improvements before selling, and I can close on the timeline that works best for you.",
      "",
      "If that works for you, let me know and we can go over the next steps.",
      "",
      "Thank you for your time,",
      "",
      studentName,
      studentPhone,
    ].join("\n")
  } else if (f.tone === "soft-follow-up") {
    body = [
      `Hi ${recipient},`,
      "",
      "I wanted to follow up and see if now might be a better time to talk.",
      "",
      `I'm still interested in the property located at ${property}, and I'd like to present an offer of ${amount}.`,
      "",
      "This would be an as-is offer, so there would be no need to make any repairs or improvements before selling. I'm also happy to work around your preferred timeline.",
      "",
      "No pressure at all. If you'd like to talk it through, I'm here whenever you're ready.",
      "",
      "Thank you for your time,",
      "",
      studentName,
      studentPhone,
    ].join("\n")
  } else {
    body = [
      `Hi ${recipient},`,
      "",
      "I hope you're doing well.",
      "",
      `I'm reaching out regarding the property located at ${property}. I understand that selling a property can be a big decision, and my goal is to make the process as simple and respectful as possible.`,
      "",
      `After reviewing the numbers, repairs, and current market conditions, I would like to present an offer of ${amount}.`,
      "",
      "This would be an as-is offer, meaning you would not need to make repairs or improvements before selling. I can also work with your preferred timeline and make the process as smooth as possible.",
      "",
      "If this is something you would consider, I'd be happy to discuss the next steps with you.",
      "",
      "Thank you for your time,",
      "",
      studentName,
      studentPhone,
    ].join("\n")
  }

  return { subject, body }
}