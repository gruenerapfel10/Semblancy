"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface MultiChoiceProps {
  options: string[]
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function MultiChoice({
  options,
  value,
  onChange,
  disabled = false,
}: MultiChoiceProps) {
  return (
    <div className="grid gap-3">
      {options.map((option, index) => (
        <button
          key={index}
          type="button"
          disabled={disabled}
          onClick={() => onChange(index)}
          className={cn(
            "relative flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all hover:bg-accent",
            value === index
              ? "border-primary bg-accent"
              : "border-border",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <span className="text-base font-medium">{option}</span>
          {value === index && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </button>
      ))}
    </div>
  )
} 