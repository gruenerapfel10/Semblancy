"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface HighlighterProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function Highlighter({ value, className, children }: HighlighterProps) {
  const [highlight, setHighlight] = useState(false)
  const [prevValue, setPrevValue] = useState(value)

  useEffect(() => {
    // Only trigger highlight animation if the value changes
    if (value !== prevValue) {
      setPrevValue(value)
      setHighlight(true)
      
      // Reset highlight after animation completes
      const timer = setTimeout(() => {
        setHighlight(false)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [value, prevValue])

  return (
    <div className={cn(
      "transition-all duration-300 ease-in-out",
      highlight && "bg-primary/10 scale-105", 
      className
    )}>
      {children}
    </div>
  )
} 