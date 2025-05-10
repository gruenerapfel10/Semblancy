"use client"

import React, { useEffect, useRef, useState } from "react"
import { LatexEditor } from "../lib/latex/latex-editor"
import { KeyHandler } from "../lib/latex/key-handler"
import { getCursorContext } from "../lib/latex/latex-parser"
import * as PS from "../lib/latex/positioning-system"
import { DebugPanel } from "@/components/debug-panel"
import { getCursorState, type CursorState, globalTabTrap, useTabManagement } from "@/lib/latex/cursor-manager"
import { Button } from "@/components/ui/button"
import { CalculatorIcon as MathOperationIcon } from "lucide-react"
import { parseLatex, debugTokens } from "@/lib/latex/latex-parser"

interface LatexEditorProps {
  value: string
  onChange: (value: string) => void
  onCursorChange?: (selectionStart: number, selectionEnd: number) => void
  onKeyDown?: (key: string) => void
  className?: string
  style?: React.CSSProperties
}

export default function LatexEditorComponent({
  value,
  onChange,
  onCursorChange,
  onKeyDown,
  className = "",
  style = {},
}: LatexEditorProps) {
  // Track last key pressed for text shortcuts
  const [lastKey, setLastKey] = useState<string | null>(null)
  
  // Create refs for the textarea and editor
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<LatexEditor | null>(null)
  const keyHandlerRef = useRef<KeyHandler | null>(null)
  
  // Initialize the editor
  useEffect(() => {
    if (!editorRef.current) {
      // Create the editor with callbacks
      editorRef.current = new LatexEditor(value, {
        onContentChange: (content, selectionStart, selectionEnd) => {
          // Notify parent of content change
          onChange(content)
          
          // Update textarea selection if it exists
          if (textareaRef.current) {
            textareaRef.current.value = content
            textareaRef.current.selectionStart = selectionStart
            textareaRef.current.selectionEnd = selectionEnd
          }
        },
        onCursorChange: (selectionStart, selectionEnd) => {
          // Update textarea selection if it exists
          if (textareaRef.current) {
            textareaRef.current.selectionStart = selectionStart
            textareaRef.current.selectionEnd = selectionEnd
            textareaRef.current.focus()
          }
          
          // Notify parent of cursor change if callback provided
          if (onCursorChange) {
            onCursorChange(selectionStart, selectionEnd);
          }
        }
      })

      // Create key handler
      keyHandlerRef.current = new KeyHandler({
        editor: editorRef.current,
        textareaRef,
      })
    }
  }, [onChange, onCursorChange])

  // Sync value from props to editor
  useEffect(() => {
    if (editorRef.current && textareaRef.current) {
      const currentContent = editorRef.current.getContent()
      if (currentContent !== value) {
        // Preserve selection when value changes externally
        const { selectionStart, selectionEnd } = textareaRef.current
        editorRef.current.setContent(value, selectionStart, selectionEnd)
      }
    }
  }, [value])

  // Update content and notify parent
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    const selectionStart = e.target.selectionStart
    const selectionEnd = e.target.selectionEnd

    // Check for text shortcuts
    const posInfo = PS.positionInfo(newContent, selectionStart)
    const inMath = posInfo.inMath

    if (inMath && lastKey === " ") {
      // Look for word boundaries before the cursor
      const textBeforeCursor = newContent.substring(0, selectionStart)

      // Simple check for "pi" followed by space
      if (textBeforeCursor.endsWith("pi ")) {
        // Replace "pi " with "\pi "
        const wordStart = selectionStart - 3 // Length of "pi "
        const replacedContent = newContent.substring(0, wordStart) + "\\pi " + newContent.substring(selectionStart)
        
        // Update content with replaced text
        if (editorRef.current) {
          editorRef.current.setContent(replacedContent, wordStart + 4, wordStart + 4) // Length of "\pi "
        }
        return
      }
    }

    // Update editor content
    if (editorRef.current) {
      editorRef.current.setContent(newContent, selectionStart, selectionEnd)
    }
  }

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Store last key pressed for text shortcuts
    setLastKey(e.key)
    
    // Notify parent of key press if callback provided
    if (onKeyDown) {
      onKeyDown(e.key);
    }
    
    // Use the key handler for special keys
    if (keyHandlerRef.current) {
      if (keyHandlerRef.current.handleKeyDown(e)) {
        // If the key was handled, prevent default behavior
        e.preventDefault()
      }
    }
  }

  // Track selection changes
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (editorRef.current && keyHandlerRef.current) {
      keyHandlerRef.current.handleSelect(e)
      
      // Notify parent of selection change if callback provided
      if (onCursorChange && e.currentTarget) {
        const { selectionStart, selectionEnd } = e.currentTarget;
        onCursorChange(selectionStart, selectionEnd);
      }
    }
  }

  // Track mouse clicks
  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (editorRef.current && keyHandlerRef.current) {
      keyHandlerRef.current.handleClick(e)
      
      // Notify parent of cursor change if callback provided
      if (onCursorChange) {
        const { selectionStart, selectionEnd } = e.currentTarget;
        onCursorChange(selectionStart, selectionEnd);
      }
    }
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onSelect={handleSelect}
      onClick={handleClick}
      className={`latex-editor ${className}`}
      style={{
        fontFamily: "monospace",
        padding: "10px",
        minHeight: "200px",
        width: "100%",
        ...style,
      }}
      spellCheck={false}
    />
  )
}
