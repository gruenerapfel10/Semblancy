import { cn } from "@/lib/utils"

interface DotBackgroundProps {
  className?: string
  children?: React.ReactNode
  dotSize?: "small" | "medium" | "large"
  dotColor?: "light" | "normal" | "contrast"
}

export default function DotBackground({ 
  className, 
  children,
  dotSize = "medium",
  dotColor = "normal"
}: DotBackgroundProps) {
  // Determine dot size based on prop
  const getDotSize = () => {
    switch (dotSize) {
      case "small": return "[background-size:16px_16px]";
      case "large": return "[background-size:28px_28px]";
      default: return "[background-size:20px_20px]";
    }
  };

  // Determine dot color intensity based on prop
  const getLightDotColor = () => {
    switch (dotColor) {
      case "light": return "[background-image:radial-gradient(#d4d4d475_1.5px,transparent_1.5px)]";
      case "contrast": return "[background-image:radial-gradient(#a0a0a0_2px,transparent_2px)]";
      default: return "[background-image:radial-gradient(#d4d4d4_1.5px,transparent_1.5px)]";
    }
  };

  // Determine dark mode dot color intensity based on prop
  const getDarkDotColor = () => {
    switch (dotColor) {
      case "light": return "dark:[background-image:radial-gradient(#40404050_1.5px,transparent_1.5px)]";
      case "contrast": return "dark:[background-image:radial-gradient(#606060_2px,transparent_2px)]";
      default: return "dark:[background-image:radial-gradient(#404040_1.5px,transparent_1.5px)]";
    }
  };

  return (
    <div className={cn("relative w-full bg-white dark:bg-black", className)}>
      <div
        className={cn(
          "absolute inset-0",
          getDotSize(),
          getLightDotColor(),
          getDarkDotColor(),
          "transition-opacity duration-700",
          className?.includes("dot-fade") ? "opacity-30" : "opacity-100"
        )}
      />
      {children}
    </div>
  )
}
