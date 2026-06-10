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
import { FilePlus2, FolderOpen, CheckCircle2, BarChart3 } from "lucide-react"

export default function DashboardPage() {
  const totalAnalyses = MOCK_DEALS.length
  const hayDineroCount = MOCK_DEALS.filter((d) => d.decision === "HAY DINERO").length
  const recentDeals = MOCK_DEALS.slice(0, 4)

  const stats = [
    {
      label: "Total Analyses",
      value: totalAnalyses,
      icon: BarChart3,
      tone: "text-foreground",
    },
    {
      label: "Deals con Potencial",
      value: hayDineroCount,
      icon: CheckCircle2,
      tone: "text-success",
    },
    {
      label: "Saved Analyses",
      value: totalAnalyses,
      icon: FolderOpen,
      tone: "text-foreground",
    },
  ]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, Money Flipper
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s a quick look at your deal pipeline.
          </p>
        </div>
        <Button asChild>
          <Link href="/new-analysis">
            <FilePlus2 className="size-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
                  <Icon className={cn("size-5", stat.tone)} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-semibold tabular-nums text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent analyses */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Recent Analyses</CardTitle>
          <CardDescription>Your most recently saved deals.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {recentDeals.map((deal) => (
            <div
              key={deal.id}
              className="flex flex-col gap-2 rounded-lg border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{deal.address}</span>
                <span className="text-sm text-muted-foreground">
                  {deal.strategy} &middot; {deal.date}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right">
                  <span className="text-xs text-muted-foreground">{deal.outcomeLabel}</span>
                  <span className="tabular-nums text-foreground">
                    {formatCurrency(deal.outcomeValue)}
                  </span>
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
            </div>
          ))}
          <div>
            <Button asChild variant="outline">
              <Link href="/deal-history">View all deals</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
