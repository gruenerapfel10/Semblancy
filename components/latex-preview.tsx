"use client"

import { useEffect, useRef } from "react"
import { renderLatexMarkdown } from "@/lib/latex-markdown-renderer"

interface LatexPreviewProps {
  content: string
}

export function LatexPreview({ content }: LatexPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  // Update the preview when content changes
  useEffect(() => {
    if (previewRef.current) {
      const renderedHTML = renderLatexMarkdown(content)
      previewRef.current.innerHTML = renderedHTML
    }
  }, [content])

  return <div ref={previewRef} className="prose prose-sm max-w-none p-4 dark:prose-invert bg-background" />
}
