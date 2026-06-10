import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FilePlus2, Home, Hammer, KeyRound } from "lucide-react"

const STRATEGIES = [
  {
    title: "Wholesaling",
    description:
      "Calculate your seller offer, assignment fee, and maximum allowable offer.",
    icon: KeyRound,
  },
  {
    title: "Fix & Flip",
    description:
      "Estimate your offer, capital needed, carrying costs, cash back, net profit, and ROI.",
    icon: Hammer,
  },
  {
    title: "Buy & Hold",
    description:
      "Analyze rent, expenses, cash flow, cap rate, and cash-on-cash return.",
    icon: Home,
  },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, Money Flipper
          </h1>
          <p className="text-sm text-muted-foreground">
            Start a new analysis and calculate your deal with the Money Flip Method.
          </p>
        </div>

        <Button asChild>
          <Link href="/new-analysis">
            <FilePlus2 className="size-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STRATEGIES.map((strategy) => {
          const Icon = strategy.icon

          return (
            <Card key={strategy.title} className="border-border/60">
              <CardHeader>
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-foreground" />
                </div>
                <CardTitle className="text-lg">{strategy.title}</CardTitle>
                <CardDescription>{strategy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/new-analysis">Analyze Deal</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">How to use it</CardTitle>
          <CardDescription>
            Keep it simple: enter the property numbers, choose the strategy, and use the results to make a smarter offer.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <p>
            1. Enter the property address and basic details.
          </p>
          <p>
            2. Choose Wholesaling, Fix & Flip, or Buy & Hold.
          </p>
          <p>
            3. Review the offer, profit, cash flow, or ROI before contacting the seller.
          </p>
          <p>
            4. Use the offer email section to communicate professionally.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}