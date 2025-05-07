"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypewriterProps {
  words: string | string[]
  className?: string
  speed?: number
  delay?: number
  cursor?: boolean
  align?: 'left' | 'center' | 'right'
  loop?: boolean
  startDelay?: number
  onComplete?: () => void
  show?: boolean
}

export function Typewriter({
  words,
  className,
  speed = 50,
  delay = 1000,
  cursor = true,
  align = 'left',
  loop = false,
  startDelay = 0,
  onComplete,
  show = true,
}: TypewriterProps) {
  const [text, setText] = useState("")
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hasStarted, setHasStarted] = useState(!startDelay)
  const wordsArray = Array.isArray(words) ? words : [words]

  // Handle start delay
  useEffect(() => {
    if (!show) return
    if (startDelay && !hasStarted) {
      const timeout = setTimeout(() => {
        setHasStarted(true)
      }, startDelay)
      return () => clearTimeout(timeout)
    }
  }, [startDelay, hasStarted, show])

  useEffect(() => {
    if (!show || !hasStarted) return
    
    const currentWord = wordsArray[wordIndex]
    let timeout: NodeJS.Timeout

    if (!isDeleting && text.length < currentWord.length) {
      // Typing
      timeout = setTimeout(() => {
        setText(currentWord.slice(0, text.length + 1))
      }, speed)
    } else if (isDeleting && text.length > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setText(currentWord.slice(0, text.length - 1))
      }, speed / 2)
    } else if (!isDeleting && text.length === currentWord.length) {
      // Pause at end of word
      if (wordsArray.length > 1 && loop) {
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, delay)
      } else if (!isComplete) {
        setIsComplete(true)
        onComplete?.()
      }
    } else if (isDeleting && text.length === 0) {
      // Move to next word
      setIsDeleting(false)
      setWordIndex((prev) => (prev + 1) % wordsArray.length)
    }

    return () => clearTimeout(timeout)
  }, [text, isDeleting, wordIndex, words, speed, delay, wordsArray, loop, hasStarted, show, isComplete, onComplete])

  const alignmentClasses = {
    left: "text-left justify-start",
    center: "text-center justify-center",
    right: "text-right justify-end",
  }

  if (!show) return null

  return (
    <div className={cn("flex", alignmentClasses[align], className)}>
      <div className="inline-block">
        {text}
        {cursor && !isComplete && hasStarted && (
          <span className="ml-[2px] inline-block h-[1em] w-[2px] animate-blink bg-current" />
        )}
      </div>
    </div>
  )
} 