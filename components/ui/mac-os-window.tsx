import type React from "react"
import { cn } from "@/lib/utils"

interface MacOSWindowProps {
  title?: string
  className?: string
  children: React.ReactNode
  variant?: "light" | "dark" | "auto"
  showDots?: boolean
}

export function MacOSWindow({ 
  title = "Untitled Window", 
  className = "", 
  children,
  variant = "auto",
  showDots = true
}: MacOSWindowProps) {
  const getBgColorClass = () => {
    switch (variant) {
      case "light": return "bg-white border-gray-200"
      case "dark": return "bg-gray-900 border-gray-800"
      default: return "bg-background border-border"
    }
  }

  return (
    <div className={cn(
      "rounded-lg shadow-lg border overflow-hidden transition-colors duration-200",
      getBgColorClass(),
      className
    )}>
      {/* Window title bar */}
      <div className={cn(
        "px-4 py-2 flex items-center border-b transition-colors duration-200",
        variant === "light" ? "bg-gray-100 border-gray-200" :
        variant === "dark" ? "bg-gray-800 border-gray-700" :
        "bg-muted border-border"
      )}>
        {/* Traffic light buttons */}
        {showDots && (
          <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors duration-200" />
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-200" />
          </div>
        )}

        {/* Window title */}
        <div className={cn(
          "text-sm font-medium flex-1 text-center",
          variant === "light" ? "text-gray-700" :
          variant === "dark" ? "text-gray-300" :
          "text-foreground"
        )}>{title}</div>

        {/* Empty space to balance the traffic lights */}
        {showDots && <div className="w-14" />}
      </div>

      {/* Window content */}
      <div className="">{children}</div>
    </div>
  )
}
