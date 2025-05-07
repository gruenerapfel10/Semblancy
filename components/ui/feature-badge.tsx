import type * as React from "react"
import { cn } from "@/lib/utils"

interface FeatureBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  label: string
  children?: React.ReactNode
}

export function FeatureBadge({ icon, label, className, children, ...props }: FeatureBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm border border-border",
        className,
      )}
      {...props}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span>{label}</span>
      {children}
    </div>
  )
}
