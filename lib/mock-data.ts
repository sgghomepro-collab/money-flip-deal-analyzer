import type { DealDecision } from "@/lib/deal-analyzer"

// ---------------------------------------------------------------------------
// Mock saved deals (no database yet)
// ---------------------------------------------------------------------------

export type SavedDeal = {
  id: string
  address: string
  strategy: "Wholesaling" | "Fix & Flip" | "Buy & Hold"
  offer: number
  outcomeLabel: string
  outcomeValue: number
  decision: DealDecision
  date: string
}

export const MOCK_DEALS: SavedDeal[] = [
  {
    id: "deal-1",
    address: "1420 Oak Street, Tampa, FL",
    strategy: "Fix & Flip",
    offer: 100000,
    outcomeLabel: "Net Profit",
    outcomeValue: 18400,
    decision: "HAY DINERO",
    date: "Jun 2, 2026",
  },
  {
    id: "deal-2",
    address: "85 Maple Ave, Orlando, FL",
    strategy: "Wholesaling",
    offer: 132000,
    outcomeLabel: "Net Profit",
    outcomeValue: 10000,
    decision: "HAY DINERO",
    date: "May 28, 2026",
  },
  {
    id: "deal-3",
    address: "734 Pine Road, Atlanta, GA",
    strategy: "Buy & Hold",
    offer: 165000,
    outcomeLabel: "Cash Flow / mo",
    outcomeValue: 285,
    decision: "REVISAR",
    date: "May 19, 2026",
  },
  {
    id: "deal-4",
    address: "210 Birch Lane, Houston, TX",
    strategy: "Fix & Flip",
    offer: 88000,
    outcomeLabel: "Net Profit",
    outcomeValue: -3200,
    decision: "NO HAY DINERO",
    date: "May 11, 2026",
  },
  {
    id: "deal-5",
    address: "56 Cypress Ct, Dallas, TX",
    strategy: "Wholesaling",
    offer: 145000,
    outcomeLabel: "Net Profit",
    outcomeValue: 12500,
    decision: "HAY DINERO",
    date: "May 4, 2026",
  },
]

// ---------------------------------------------------------------------------
// Default Money Flip assumptions (Settings page)
// ---------------------------------------------------------------------------

export type DefaultAssumptions = {
  discountPercent: number
  hmlDownPaymentPercent: number
  hmlPointsPercent: number
  hmlRatePercent: number
  purchaseClosingPercent: number
  realtorPercent: number
  saleClosingPercent: number
  minRoiPercent: number
}

export const DEFAULT_ASSUMPTIONS: DefaultAssumptions = {
  discountPercent: 30,
  hmlDownPaymentPercent: 20,
  hmlPointsPercent: 3,
  hmlRatePercent: 11,
  purchaseClosingPercent: 5,
  realtorPercent: 6,
  saleClosingPercent: 3,
  minRoiPercent: 30,
}

export const DECISION_BADGE: Record<DealDecision, string> = {
  "HAY DINERO": "bg-success/15 text-success",
  REVISAR: "bg-warning/20 text-warning-foreground",
  "NO HAY DINERO": "bg-destructive/15 text-destructive",
}
