"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: React.ReactNode
  show?: boolean
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
  delay?: number
  className?: string
  once?: boolean
}

export function FadeIn({
  children,
  show = true,
  direction = "up",
  duration = 0.5,
  delay = 0,
  className,
  once = false,
}: FadeInProps) {
  // Calculate initial and animate properties based on direction
  const directionValues = {
    up: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 } },
    none: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  }

  const { initial, animate } = directionValues[direction]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={initial}
          animate={animate}
          exit={{ opacity: 0 }}
          transition={{ duration, delay, ease: "easeOut" }}
          className={cn(className)}
          viewport={{ once }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 