"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FilePlus2, Settings } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new-analysis", label: "New Analysis", icon: FilePlus2 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card md:flex">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
            <Image
              src="/money-flip-logo.png"
              alt="Money Flip Logo"
              width={44}
              height={44}
              className="h-auto w-auto"
              priority
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-foreground">
              Money Flip
            </span>
            <span className="text-xs text-muted-foreground">Deal Analyzer</span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile header */}
      <header className="flex items-center gap-3 border-b border-border/60 bg-card px-4 py-4 md:hidden">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
          <Image
            src="/money-flip-logo.png"
            alt="Money Flip Logo"
            width={36}
            height={36}
            className="h-auto w-auto"
            priority
          />
        </div>

        <span className="text-sm font-semibold text-foreground">
          Money Flip Deal Analyzer
        </span>
      </header>

      <div className="flex flex-1 flex-col">
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border/60 bg-card px-2 py-2 md:hidden">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}