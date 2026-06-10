"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/deal-analyzer"
import { MOCK_DEALS, DECISION_BADGE } from "@/lib/mock-data"
import { FilePlus2, FolderOpen, Copy, Trash2 } from "lucide-react"

export default function DealHistoryPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Deal History</h1>
          <p className="text-sm text-muted-foreground">
            Sample saved deals. Once the database is connected, your saved analyses will appear here.
          </p>
        </div>
        <Button asChild>
          <Link href="/new-analysis">
            <FilePlus2 className="size-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {MOCK_DEALS.map((deal) => (
          <Card key={deal.id} className="border-border/60">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">{deal.address}</CardTitle>
                  <CardDescription>
                    {deal.strategy} &middot; {deal.date}
                  </CardDescription>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                    DECISION_BADGE[deal.decision],
                  )}
                >
                  {deal.decision}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col rounded-lg border border-border/60 bg-muted/40 p-3">
                  <span className="text-xs text-muted-foreground">Offer Amount</span>
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {formatCurrency(deal.offer)}
                  </span>
                </div>
                <div className="flex flex-col rounded-lg border border-border/60 bg-muted/40 p-3">
                  <span className="text-xs text-muted-foreground">{deal.outcomeLabel}</span>
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {formatCurrency(deal.outcomeValue)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="default" size="sm">
                  <Link href="/new-analysis">
                    <FolderOpen className="size-4" />
                    Open Analysis
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="size-4" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
