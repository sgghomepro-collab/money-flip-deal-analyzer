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
      "Calcula tu oferta al vendedor, assignment fee y MAO para proteger el margen del comprador final.",
    icon: KeyRound,
    href: "/new-analysis?strategy=wholesaling",
  },
  {
    title: "Fix & Flip",
    description:
      "Estima tu oferta, capital requerido, costos de mantenimiento, cash back, ganancia neta y ROI.",
    icon: Hammer,
    href: "/new-analysis?strategy=fix-and-flip",
  },
  {
    title: "Buy & Hold",
    description:
      "Analiza renta, gastos, cash flow, CAP Rate y retorno Cash on Cash.",
    icon: Home,
    href: "/new-analysis?strategy=buy-and-hold",
  },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Bienvenido de nuevo, Money Flipper
          </h1>
          <p className="text-sm text-muted-foreground">
            Inicia un nuevo análisis y calcula tu trato con el Money Flip Method.
          </p>
        </div>

        <Button asChild>
          <a href="/new-analysis?strategy=wholesaling">
            <FilePlus2 className="size-4" />
            Nuevo Análisis
          </a>
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
                  <a href={strategy.href}>Analizar Trato</a>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Cómo usar la herramienta</CardTitle>
          <CardDescription>
            Mantenlo simple: ingresa los números de la propiedad, elige la estrategia y usa los resultados para hacer una oferta más inteligente.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <p>1. Ingresa la dirección de la propiedad y los datos básicos.</p>
          <p>2. Elige Wholesaling, Fix & Flip o Buy & Hold.</p>
          <p>3. Revisa la oferta, ganancia, cash flow o ROI antes de contactar al vendedor.</p>
          <p>4. Usa la sección de email de oferta para comunicarte de forma profesional.</p>
        </CardContent>
      </Card>
    </div>
  )
}