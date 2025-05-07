import type React from "react"
import { cn } from "@/lib/utils"

interface BentoGridProps {
  children: React.ReactNode
  className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4", className)}>{children}</div>
}

interface BentoGridItemProps {
  children: React.ReactNode
  className?: string
  colSpan?: 1 | 2 | 3
  rowSpan?: 1 | 2
}

export function BentoGridItem({ children, className, colSpan = 1, rowSpan = 1 }: BentoGridItemProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow overflow-hidden",
        colSpan === 1 ? "col-span-1" : colSpan === 2 ? "col-span-2 md:col-span-2" : "col-span-3 md:col-span-3",
        rowSpan === 1 ? "row-span-1" : "row-span-2",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function BentoGridItemHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>
}

export function BentoGridItemContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>
}

export function BentoGridItemFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>
}

export function BentoGridItemTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>
}

export function BentoGridItemDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

export function BentoGridItemStat({
  value,
  label,
}: {
  value: string | number
  label: string
}) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function BentoGridItemFeature({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="h-px w-4 bg-primary/50" />
      <span>{children}</span>
    </div>
  )
}
