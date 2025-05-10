"use client"

import { useState, useRef, useEffect } from "react"
import LatexEditor from "@/components/latex-editor"
import { LatexPreview } from "@/components/latex-preview"
import { ShortcutHelp } from "@/components/shortcut-help"
import { ThemeToggle } from "@/components/theme-toggle"
import { DebugPanel } from "@/components/debug-panel"
import { getCursorState } from "@/lib/cursor-manager"
import "./latex.css"

export default function Home() {
  const [content, setContent] = useState<string>(
    "# Custom LaTeX and Markdown Renderer\n\nThis is a **Markdown** and *LaTeX* editor with a custom renderer.\n\n## Example LaTeX Expressions\n\n1. The quadratic formula: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n2. Try a command with braces: \\textbf{bold text} and \\textit{italic text}\n\n3. Nested commands: $$\\frac{\\sqrt{x^2 + y^2}}{\\sin(\\theta)}$$\n\n4. Multiple arguments: $$\\frac{1}{2}$$ and $$\\sqrt[3]{x}$$\n\n5. Inline math: $E = mc^2$ and $\\frac{1}{2}$\n\n6. Greek letters: $\\alpha, \\beta, \\gamma, \\delta, \\pi$\n\n7. Operators: $a \\times b$, $c \\div d$, $e \\leq f$, $g \\geq h$\n\n8. Summation: $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$\n\nTry editing this content or adding your own LaTeX expressions!",
  )
  const [lastKey, setLastKey] = useState<string>("")
  const [editorState, setEditorState] = useState({
    content: content,
    cursor: getCursorState(content, 0, 0)
  })
  
  // Update editorState when content changes
  useEffect(() => {
    setEditorState(prev => ({
      content: content,
      cursor: prev.cursor
    }))
  }, [content])
  
  // Track cursor position changes
  const handleEditorUpdate = (selectionStart: number, selectionEnd: number) => {
    setEditorState(prev => ({
      content: prev.content,
      cursor: getCursorState(content, selectionStart, selectionEnd)
    }))
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="flex-none border-b bg-background px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold">LaTeX Editor with Custom Renderer</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ShortcutHelp />
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 border-r flex flex-col min-w-0">
          <div className="flex-none px-4 py-2 text-sm font-medium border-b">Editor</div>
          <div className="flex-1 overflow-auto">
            <LatexEditor 
              value={content} 
              onChange={setContent} 
              onCursorChange={handleEditorUpdate}
              onKeyDown={(key) => setLastKey(key)}
            />
          </div>
          <DebugPanel editorState={editorState} lastKey={lastKey} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-none px-4 py-2 text-sm font-medium border-b">Preview</div>
          <div className="flex-1 overflow-auto p-4">
            <LatexPreview content={content} />
          </div>
        </div>
      </div>
    </main>
  )
}
