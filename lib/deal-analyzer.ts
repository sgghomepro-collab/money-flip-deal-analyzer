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
export type DealScoreLabel = "Strong Deal" | "Review Carefully" | "Weak Deal"

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

function getDealScoreLabel(score: number): DealScoreLabel {
  if (score >= 80) return "Strong Deal"
  if (score >= 60) return "Review Carefully"
  return "Weak Deal"
}

// ---------------------------------------------------------------------------
// Wholesaling
// ---------------------------------------------------------------------------

export interface WholesaleInputs {
  arv: number
  repairs: number
  discountPercent: number
  assignmentFee: number
}

export interface WholesaleResults {
  mao: number
  sellerOffer: number
  estimatedProfit: number
  dealScore: number
  dealScoreLabel: DealScoreLabel
  riskNotes: string[]
}

export function analyzeWholesale(i: WholesaleInputs): WholesaleResults {
  const mao = i.arv * (1 - i.discountPercent / 100) - i.repairs
  const sellerOffer = mao - i.assignmentFee
  const estimatedProfit = i.assignmentFee

  const repairRatio = i.arv > 0 ? i.repairs / i.arv : 0
  const sellerOfferRatio = i.arv > 0 ? sellerOffer / i.arv : 0
  const assignmentFeeRatio = mao > 0 ? i.assignmentFee / mao : 0

  let dealScore = 50
  const riskNotes: string[] = []

  // 1. Discount protection rule.
  // Wholesaling must protect the backend for the fix & flipper.
  // Below 30% discount, the deal becomes risky and should not be Strong.
  if (i.discountPercent >= 35) {
    dealScore += 25
  } else if (i.discountPercent >= 30) {
    dealScore += 18
  } else if (i.discountPercent >= 25) {
    dealScore -= 5
    riskNotes.push(
      "Discount is below 30%. The backend may be tight for the fix & flipper. Review comps, repairs, and resale margin carefully.",
    )
  } else {
    dealScore -= 25
    riskNotes.push(
      "Discount is below 25%. This is usually too risky for wholesaling because the fix & flipper may not have enough backend profit.",
    )
  }

  // 2. Repair risk.
  if (repairRatio > 0 && repairRatio <= 0.15) {
    dealScore += 12
  } else if (repairRatio > 0 && repairRatio <= 0.25) {
    dealScore += 5
  } else if (repairRatio > 0.25) {
    dealScore -= 12
    riskNotes.push(
      "Repair estimate is high compared to ARV. Verify repair numbers before locking the contract.",
    )
  }

  // 3. Seller offer position versus ARV.
  // Lower seller offer creates more room for the end buyer.
  if (sellerOffer > 0 && sellerOfferRatio <= 0.5) {
    dealScore += 15
  } else if (sellerOffer > 0 && sellerOfferRatio <= 0.6) {
    dealScore += 10
  } else if (sellerOffer > 0 && sellerOfferRatio <= 0.7) {
    dealScore += 2
  } else if (sellerOffer > 0 && sellerOfferRatio > 0.7) {
    dealScore -= 15
    riskNotes.push(
      "Seller offer is high compared to ARV. This may leave limited room for the end buyer.",
    )
  }

  // 4. Assignment fee should not automatically make the deal stronger.
  // A higher fee can be good only if the backend still works and the seller offer is realistic.
  if (estimatedProfit <= 0) {
    dealScore -= 30
    riskNotes.push("Assignment fee is zero or negative. There is no wholesale profit in this scenario.")
  } else if (estimatedProfit < 5000) {
    dealScore -= 10
    riskNotes.push("Assignment fee is low. Make sure the deal is worth your time and marketing effort.")
  } else if (estimatedProfit >= 5000 && estimatedProfit <= 15000) {
    dealScore += 5
  }

  // 5. Assignment fee too high compared to MAO can make the contract harder to sell.
  if (assignmentFeeRatio > 0.25) {
    dealScore -= 15
    riskNotes.push(
      "Assignment fee is high compared to MAO. Make sure your seller offer is low enough and the contract is still sellable.",
    )
  } else if (assignmentFeeRatio > 0.2) {
    dealScore -= 8
    riskNotes.push(
      "Assignment fee is getting high compared to MAO. Protect the fix & flipper's backend before increasing your fee.",
    )
  }

  // 6. Invalid or dangerous numbers.
  if (sellerOffer <= 0) {
    dealScore -= 30
    riskNotes.push("Seller offer is zero or negative. Review ARV, repairs, discount, and assignment fee.")
  }

  if (mao <= 0) {
    dealScore -= 30
    riskNotes.push("MAO is zero or negative. This deal does not support the current repair and discount assumptions.")
  }

  if (i.arv <= 0) {
    dealScore -= 30
    riskNotes.push("ARV is missing or invalid. Add a realistic ARV before trusting the analysis.")
  }

  // 7. Hard caps based on discount rule.
  // Less than 30% should never be Strong.
  if (i.discountPercent < 30) {
    dealScore = Math.min(dealScore, 79)
  }

  // Less than 25% should be Weak because the backend is usually too risky.
  if (i.discountPercent < 25) {
    dealScore = Math.min(dealScore, 59)
  }

  dealScore = Math.max(0, Math.min(100, Math.round(dealScore)))
  const dealScoreLabel = getDealScoreLabel(dealScore)

  if (riskNotes.length === 0) {
    riskNotes.push(
      "No major wholesaling risk flags detected. Still verify comps, repair estimate, seller motivation, and buyer demand before moving forward.",
    )
  }

  return {
    mao,
    sellerOffer,
    estimatedProfit,
    dealScore,
    dealScoreLabel,
    riskNotes,
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
  actualSalePrice: number
  discountPercent: number
  renovationBudget: number
  downPaymentPercent: number
  pointsPercent: number
  annualInterestPercent: number
  hmlAdminFee: number
  purchaseClosingPercent: number
  saleRealtorPercent: number
  saleClosingPercent: number
  holdingCosts: number
  unexpectedCosts: number
  minRoiPercent: number
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
  riskNotes: string[]
  dealScore: number
  dealScoreLabel: DealScoreLabel
  decision: DealDecision
}

export function analyzeFlip(i: FlipInputs): FlipResults {
  const salePriceUsed = i.actualSalePrice > 0 ? i.actualSalePrice : i.arv

  // 1. Offer
  const basePrice = i.arv * (1 - i.discountPercent / 100)
  const netOffer = basePrice - i.renovationBudget

  // 2. Hard Money Loan
  const downPayment = netOffer * (i.downPaymentPercent / 100)
  const financedPurchaseAmount = netOffer - downPayment
  const financedRepairsAmount = i.renovationBudget
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

  // 14. Risk Notes
  const riskNotes: string[] = []

  if (i.actualSalePrice > 0 && i.actualSalePrice < i.arv) {
    riskNotes.push("Actual Sale Price is below ARV. Review your exit strategy and resale assumptions.")
  }

  if (netProfit <= 0) {
    riskNotes.push("This deal is currently showing no net profit. The offer, renovation budget, or sale price needs to be reviewed.")
  }

  if (netProfit > 0 && netProfit < minProfitRequired) {
    riskNotes.push("Net profit is positive, but it is below your minimum expected ROI target.")
  }

  if (i.arv > 0 && i.renovationBudget / i.arv >= 0.25) {
    riskNotes.push("Renovation budget is high compared to ARV. Verify repair estimates before making an offer.")
  }

  if (i.arv > 0 && cashToClose / i.arv >= 0.2) {
    riskNotes.push("Cash needed to close is high compared to ARV. Confirm available capital before moving forward.")
  }

  if (i.timelineMonths >= 6) {
    riskNotes.push("Project timeline is long. Higher timelines can increase interest, holding costs, and market risk.")
  }

  if (i.annualInterestPercent >= 13) {
    riskNotes.push("Hard money interest rate is high. Review lender terms and compare financing options.")
  }

  if (i.pointsPercent >= 4) {
    riskNotes.push("Hard money points are high. Confirm all lender fees before committing to the deal.")
  }

  if (riskNotes.length === 0) {
    riskNotes.push("No major risk flags detected based on the current numbers. Still verify comps, repairs, financing, and market conditions.")
  }

  // 15. Deal Decision
  let decision: DealDecision

  if (netProfit <= 0) {
    decision = "NO HAY DINERO"
  } else if (netProfit >= minProfitRequired) {
    decision = "HAY DINERO"
  } else {
    decision = "REVISAR"
  }

  // 16. Deal Score
  let dealScore = 50

  if (decision === "HAY DINERO") dealScore += 25
  if (decision === "REVISAR") dealScore += 5
  if (decision === "NO HAY DINERO") dealScore -= 30

  if (realRoi >= i.minRoiPercent / 100) dealScore += 15
  if (realRoi >= i.minRoiPercent / 100 + 0.2) dealScore += 10
  if (realRoi > 0 && realRoi < i.minRoiPercent / 100) dealScore -= 10
  if (realRoi <= 0) dealScore -= 20

  if (netProfit > minProfitRequired * 1.5) dealScore += 10
  if (netProfit > 0 && netProfit < minProfitRequired) dealScore -= 10

  if (i.actualSalePrice > 0 && i.actualSalePrice < i.arv) dealScore -= 8
  if (i.arv > 0 && i.renovationBudget / i.arv >= 0.25) dealScore -= 8
  if (i.arv > 0 && cashToClose / i.arv >= 0.2) dealScore -= 7
  if (i.timelineMonths >= 6) dealScore -= 5
  if (i.annualInterestPercent >= 13) dealScore -= 5
  if (i.pointsPercent >= 4) dealScore -= 5

  dealScore = Math.max(0, Math.min(100, Math.round(dealScore)))
  const dealScoreLabel = getDealScoreLabel(dealScore)

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
    riskNotes,
    dealScore,
    dealScoreLabel,
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
  downPaymentPercent: number
  interestRatePercent: number
  loanTermYears: number
  closingPercent: number
  additionalCosts: number
  monthlyRent: number
  managementPercent: number
  taxesPercent: number
  insurancePercent: number
  reservesPercent: number
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