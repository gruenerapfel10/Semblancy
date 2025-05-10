import type React from "react"
import type { LatexEditor } from "./latex-editor"
import { getCursorContext } from "./latex-parser"
import { getNextValidPosition, getPreviousValidPosition, isValidCursorPosition, calculateCursorPosition, findNextTabStop } from "../cursor-manager"
import { parseLatex } from "./latex-parser"
import type { ParsedToken } from "./latex-parser"
import { CommandManager } from "../command-manager"
import * as PS from "./positioning-system"

export interface KeyHandlerOptions {
  editor: LatexEditor
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export class KeyHandler {
  private editor: LatexEditor
  private textareaRef: React.RefObject<HTMLTextAreaElement | null>
  private commandManager: CommandManager

  constructor(options: KeyHandlerOptions) {
    this.editor = options.editor
    this.textareaRef = options.textareaRef
    this.commandManager = new CommandManager(this.editor)
  }

  // Find parent command of a token - keep this utility here as it's specific to key handling
  private findParentCommand(tokens: ParsedToken[], token: ParsedToken): ParsedToken | null {
    for (const t of tokens) {
      if (t.type === "command" && t.children) {
        for (const child of t.children) {
          if (child === token) {
            return t
          }
        }

        // Recursively check children
        if (t.children) {
          const result = this.findParentCommand(t.children, token)
          if (result) return result
        }
      }

      // Check other token types with children
      if (t.children) {
        const result = this.findParentCommand(t.children, token)
        if (result) return result
      }
    }

    return null
  }

  // Handle keyboard shortcuts
  handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): boolean {
    const { key, ctrlKey, metaKey, shiftKey } = event
    const { selectionStart, selectionEnd, value } = event.currentTarget
    const posInfo = PS.positionInfo(value, selectionStart)

    // Auto-complete braces
    if (key === "(" || key === "[" || key === "{") {
      const closingBrace = key === "(" ? ")" : key === "[" ? "]" : "}"

      // Insert the opening and closing braces and position cursor between them
      const newContent = value.substring(0, selectionStart) + key + closingBrace + value.substring(selectionEnd)
      const cursorPosition = selectionStart + 1 // Position cursor after the opening brace

      this.editor.setContent(newContent, cursorPosition, cursorPosition)

      // Force update the textarea cursor position
      setTimeout(() => {
        if (this.textareaRef.current) {
          this.textareaRef.current.selectionStart = cursorPosition
          this.textareaRef.current.selectionEnd = cursorPosition
          this.textareaRef.current.focus()
        }
      }, 0)

      event.preventDefault()
      return true
    }

    // Handle Tab key for argument navigation
    if (key === "Tab") {
      event.preventDefault()

      // Find the next tab position using positioning system's centralized function
      const nextTabStop = PS.findNextTabStop(value, selectionStart, !shiftKey)

      if (nextTabStop) {
        const nextPos = nextTabStop.index;
        
        // Set cursor to the next position
        this.editor.setCursor(nextPos, nextPos)

        // Also update the textarea directly for immediate visual feedback
        if (this.textareaRef.current) {
          this.textareaRef.current.selectionStart = nextPos
          this.textareaRef.current.selectionEnd = nextPos
          this.textareaRef.current.focus()
        }

        return true
      }

      // Default tab behavior if no positions found
      const newContent = value.substring(0, selectionStart) + "  " + value.substring(selectionEnd)
      this.editor.setContent(newContent, selectionStart + 2, selectionStart + 2)
      return true
    }

    // Handle arrow keys for cursor movement
    if (key === "ArrowLeft") {
      // Only handle if there's no selection and we're not at the start
      if (selectionStart === selectionEnd && selectionStart > 0) {
        const prevPos = PS.prevValidPosition(value, selectionStart).index

        // If the previous valid position is different from where arrow would normally go
        if (prevPos !== selectionStart - 1) {
          event.preventDefault()

          // Update the editor cursor position
          this.editor.setCursor(prevPos, prevPos)

          // Also update the textarea directly for immediate visual feedback
          if (this.textareaRef.current) {
            this.textareaRef.current.selectionStart = prevPos
            this.textareaRef.current.selectionEnd = prevPos
            this.textareaRef.current.focus()
          }

          return true
        }
      }
    } else if (key === "ArrowRight") {
      // Only handle if there's no selection and we're not at the end
      if (selectionStart === selectionEnd && selectionStart < value.length) {
        const nextPos = PS.nextValidPosition(value, selectionStart).index

        // If the next valid position is different from where arrow would normally go
        if (nextPos !== selectionStart + 1) {
          event.preventDefault()

          // Update the editor cursor position
          this.editor.setCursor(nextPos, nextPos)

          // Also update the textarea directly for immediate visual feedback
          if (this.textareaRef.current) {
            this.textareaRef.current.selectionStart = nextPos
            this.textareaRef.current.selectionEnd = nextPos
            this.textareaRef.current.focus()
          }

          return true
        }
      }
    }

    // Handle the "/" shortcut for fractions
    if (key === "/") {
      event.preventDefault()
      
      // Use the command manager to insert a fraction with smart cursor positioning
      const cursorPos = this.commandManager.insertFraction(selectionStart)
      
      // Force update the textarea cursor position
      setTimeout(() => {
        if (this.textareaRef.current) {
          this.textareaRef.current.selectionStart = cursorPos
          this.textareaRef.current.selectionEnd = cursorPos
          this.textareaRef.current.focus()
        }
      }, 0)
      
      return true
    }

    // Special shortcuts that work outside math environments
    if (key === "$" && shiftKey) {
      // Insert math environment with $$
      event.preventDefault()
      const newContent = value.substring(0, selectionStart) + "$$$$" + value.substring(selectionEnd)

      // Position cursor between the $$ pairs
      const cursorPosition = selectionStart + 2

      this.editor.setContent(newContent, cursorPosition, cursorPosition)

      // Force update the textarea cursor position
      setTimeout(() => {
        if (this.textareaRef.current) {
          this.textareaRef.current.selectionStart = cursorPosition
          this.textareaRef.current.selectionEnd = cursorPosition
          this.textareaRef.current.focus()
        }
      }, 0)

      return true
    }

    // Handle undo/redo
    if ((ctrlKey || metaKey) && key === "z") {
      event.preventDefault()
      if (shiftKey) {
        this.editor.redo()
      } else {
        this.editor.undo()
      }
      return true
    }
    
    // Handle sqrt with Ctrl+R (root)
    if ((ctrlKey || metaKey) && key === "r") {
      event.preventDefault()
      const cursorPos = this.commandManager.insertSqrt(selectionStart)
      
      // Force update the textarea cursor position
      setTimeout(() => {
        if (this.textareaRef.current) {
          this.textareaRef.current.selectionStart = cursorPos
          this.textareaRef.current.selectionEnd = cursorPos
          this.textareaRef.current.focus()
        }
      }, 0)
      
      return true
    }
    
    // Handle color with Ctrl+K
    if ((ctrlKey || metaKey) && key === "k") {
      event.preventDefault()
      const cursorPos = this.commandManager.insertColor(selectionStart, {
        // Demonstrate using a different argument index
        cursorArgumentIndex: 0 // Position cursor in first arg (red value)
      })
      
      // Force update the textarea cursor position
      setTimeout(() => {
        if (this.textareaRef.current) {
          this.textareaRef.current.selectionStart = cursorPos
          this.textareaRef.current.selectionEnd = cursorPos
          this.textareaRef.current.focus()
        }
      }, 0)
      
      return true
    }
    
    // Handle superscript with Ctrl+Up and subscript with Ctrl+Down
    if (ctrlKey || metaKey) {
      if (key === "ArrowUp") {
        event.preventDefault()
        const cursorPos = this.commandManager.insertSuperscript(selectionStart)
        
        // Force update the textarea cursor position
        setTimeout(() => {
          if (this.textareaRef.current) {
            this.textareaRef.current.selectionStart = cursorPos
            this.textareaRef.current.selectionEnd = cursorPos
            this.textareaRef.current.focus()
          }
        }, 0)
        
        return true
      } else if (key === "ArrowDown") {
        event.preventDefault()
        const cursorPos = this.commandManager.insertSubscript(selectionStart)
        
        // Force update the textarea cursor position
        setTimeout(() => {
          if (this.textareaRef.current) {
            this.textareaRef.current.selectionStart = cursorPos
            this.textareaRef.current.selectionEnd = cursorPos
            this.textareaRef.current.focus()
          }
        }, 0)
        
        return true
      }
    }

    return false
  }

  // Update cursor position
  handleSelect(event: React.SyntheticEvent<HTMLTextAreaElement>): void {
    const { selectionStart, selectionEnd } = event.currentTarget
    this.editor.setCursor(selectionStart, selectionEnd)
  }

  // Handle mouse clicks
  handleClick(event: React.MouseEvent<HTMLTextAreaElement>): void {
    const { selectionStart, selectionEnd } = event.currentTarget
    this.editor.setCursor(selectionStart, selectionEnd)
  }
}
