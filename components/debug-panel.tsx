"use client"

// Debug panel to track cursor position and context

import { useState, useEffect } from "react"
import type { CursorState } from "@/lib/latex/cursor-manager"
import { parseLatex, findCommandAtPosition } from "@/lib/latex/latex-parser"
import { isValidCursorPosition } from "@/lib/latex/cursor-manager"
import { ChevronRight, ChevronDown } from "lucide-react"

interface EditorState {
  content: string
  cursor: CursorState
}

interface DebugPanelProps {
  editorState: EditorState | null
  lastKey?: string
}

// New interface for AST node display
interface ASTNodeProps {
  node: any
  depth?: number
  isLast?: boolean
}

// Component to render a single AST node with collapsible children
function ASTNode({ node, depth = 0, isLast = false }: ASTNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  
  // Handle undefined or null nodes
  if (!node) return null
  
  const hasChildren = node.children && node.children.length > 0
  
  return (
    <div className="text-xs">
      <div 
        className="flex items-start hover:bg-muted/50 rounded"
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {hasChildren ? (
          <button 
            className="mr-1 mt-0.5 focus:outline-none" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4"></span>
        )}
        
        <div className="flex-1">
          <span className="font-semibold">{node.type}</span>
          {node.content && (
            <span className="ml-2 text-muted-foreground">
              "{node.content.substring(0, 20)}{node.content.length > 20 ? '...' : ''}"
            </span>
          )}
          <span className="ml-2 text-gray-500">
            ({node.start}-{node.end})
          </span>
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child: any, index: number) => (
            <ASTNode 
              key={`${child.type}-${index}-${child.start}`}
              node={child}
              depth={depth + 1}
              isLast={index === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function DebugPanel({ editorState, lastKey = "" }: DebugPanelProps) {
  const [lastKeyEvent, setLastKeyEvent] = useState<string>("None")
  const [commandContext, setCommandContext] = useState<string>("None")
  const [inMathEnvironment, setInMathEnvironment] = useState<boolean>(false)
  const [positionSide, setPositionSide] = useState<string>("N/A")
  const [isValidPosition, setIsValidPosition] = useState<boolean>(true)
  const [lastShortcut, setLastShortcut] = useState<string>("None")
  const [argumentInfo, setArgumentInfo] = useState<string>("None")
  const [parsedAst, setParsedAst] = useState<any[]>([])

  // Listen for key events globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifiers = []
      if (e.ctrlKey) modifiers.push("Ctrl")
      if (e.altKey) modifiers.push("Alt")
      if (e.shiftKey) modifiers.push("Shift")
      if (e.metaKey) modifiers.push("Meta")

      const modifierString = modifiers.length > 0 ? `${modifiers.join("+")}+` : ""
      setLastKeyEvent(`${modifierString}${e.key}`)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Find all argument positions in the text
  const findAllArguments = (text: string): { start: number; end: number }[] => {
    const args: { start: number; end: number }[] = []
    let braceLevel = 0
    let currentArgStart = -1

    for (let i = 0; i < text.length; i++) {
      if (text[i] === "{") {
        braceLevel++
        if (braceLevel === 1) {
          currentArgStart = i + 1 // Position after the opening brace
        }
      } else if (text[i] === "}") {
        if (braceLevel === 1 && currentArgStart !== -1) {
          // End of a top-level argument
          args.push({ start: currentArgStart, end: i })
          currentArgStart = -1
        }
        braceLevel = Math.max(0, braceLevel - 1)
      }
    }

    return args
  }

  // Update command context when cursor position changes
  useEffect(() => {
    if (editorState) {
      const { content } = editorState
      const { position } = editorState.cursor

      // Check if current position is valid
      const isValid = isValidCursorPosition(content, position.index)
      setIsValidPosition(isValid)

      // Determine cursor position side (left or right of character)
      if (position.index === 0) {
        setPositionSide("Left of first character")
      } else if (position.index === content.length) {
        setPositionSide("Right of last character")
      } else {
        const charBefore = content[position.index - 1]
        const charAfter = content[position.index]
        setPositionSide(`Right of '${charBefore}', Left of '${charAfter}'`)
      }

      // Parse the content to find tokens
      const tokens = parseLatex(content)
      
      // Set the parsed AST for visualization
      setParsedAst(tokens)

      // Check if we're in a math environment
      let inMath = false
      for (const token of tokens) {
        if (token.type === "math" && position.index >= token.start && position.index <= token.end) {
          inMath = true
          break
        }
      }
      setInMathEnvironment(inMath)

      // Find all arguments in the text
      const allArgs = findAllArguments(content)

      // Check if cursor is inside any argument
      let inArg = false
      let argIndex = -1

      for (let i = 0; i < allArgs.length; i++) {
        const arg = allArgs[i]
        if (position.index >= arg.start && position.index <= arg.end) {
          inArg = true
          argIndex = i
          break
        }
      }

      if (inArg) {
        setArgumentInfo(`In argument ${argIndex + 1} of ${allArgs.length}`)
      } else {
        setArgumentInfo("Not in any argument")
      }

      // Find if we're in a command context
      const commandAtPosition = findCommandAtPosition(tokens, position.index)

      if (commandAtPosition) {
        // Get command name
        const commandName = commandAtPosition.children?.find((child) => child.type === "command-name")
        const commandNameText = commandName ? commandName.content : "unknown"

        // Get arguments
        const args = commandAtPosition.children?.filter((child) => child.type === "command-args") || []
        const optArgs = commandAtPosition.children?.filter((child) => child.type === "command-optional") || []

        // Determine which argument we're in, if any
        let inArg = false
        let argIndex = -1
        let inOptArg = false
        let optArgIndex = -1

        for (let i = 0; i < args.length; i++) {
          const arg = args[i]
          if (position.index >= arg.start && position.index <= arg.end) {
            inArg = true
            argIndex = i
            break
          }
        }

        for (let i = 0; i < optArgs.length; i++) {
          const optArg = optArgs[i]
          if (position.index >= optArg.start && position.index <= optArg.end) {
            inOptArg = true
            optArgIndex = i
            break
          }
        }

        if (inOptArg) {
          setCommandContext(`\\${commandNameText} (in optional arg ${optArgIndex + 1} of ${optArgs.length})`)
        } else if (inArg) {
          setCommandContext(`\\${commandNameText} (in arg ${argIndex + 1} of ${args.length})`)
        } else if (commandName && position.index > commandName.start && position.index < commandName.end) {
          setCommandContext(`\\${commandNameText} (in command name)`)
        } else {
          setCommandContext(`\\${commandNameText} (between args or at command)`)
        }
      } else {
        setCommandContext("None")
      }
    }
  }, [editorState])

  // Listen for custom shortcut events
  useEffect(() => {
    const handleShortcut = (e: CustomEvent) => {
      setLastShortcut(e.detail.shortcut)
    }

    window.addEventListener("latex-shortcut", handleShortcut as EventListener)
    return () => {
      window.removeEventListener("latex-shortcut", handleShortcut as EventListener)
    }
  }, [])

  // Add tab position tracking
  useEffect(() => {
    if (editorState) {
      const { content } = editorState
      const { position } = editorState.cursor

      // Listen for tab events
      const handleTabEvent = (e: CustomEvent) => {
        const { from, to } = e.detail
        setLastShortcut(`Tab from ${from} to ${to}`)
      }

      window.addEventListener("latex-shortcut", handleTabEvent as EventListener)
      return () => {
        window.removeEventListener("latex-shortcut", handleTabEvent as EventListener)
      }
    }
  }, [editorState])

  if (!editorState) {
    return <div className="p-4 bg-background border-t">Loading editor...</div>
  }

  const { cursor } = editorState
  const { position, context } = cursor

  return (
    <div className="p-4 bg-background border-t font-mono text-sm">
      <h3 className="font-semibold mb-2">Debug Panel</h3>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <h4 className="text-xs font-semibold mb-1">Cursor Position</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Index:</div>
            <div>{position.index}</div>
            <div>Line:</div>
            <div>{position.line + 1}</div>
            <div>Column:</div>
            <div>{position.column + 1}</div>
            <div>Position:</div>
            <div>{positionSide}</div>
            <div>Valid Position:</div>
            <div className={isValidPosition ? "text-green-600" : "text-red-600"}>{isValidPosition ? "Yes" : "No"}</div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold mb-1">Cursor Context</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Context:</div>
            <div>{context}</div>
            <div>In Math:</div>
            <div className={inMathEnvironment ? "text-blue-600" : "text-gray-600"}>
              {inMathEnvironment ? "Yes" : "No"}
            </div>
            <div>Command:</div>
            <div>{commandContext}</div>
            <div>Argument:</div>
            <div>{argumentInfo}</div>
            {cursor.selection.start && (
              <>
                <div>Selection:</div>
                <div>
                  {cursor.selection.start.index} - {cursor.selection.end?.index}
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold mb-1">Input Events</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Last Key Event:</div>
            <div>{lastKeyEvent}</div>
            <div>Last Key Pressed:</div>
            <div>{lastKey || "None"}</div>
            <div>Last Shortcut:</div>
            <div>{lastShortcut}</div>
            <div>Tab Navigation:</div>
            <div>{lastShortcut}</div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold mb-1">Character Info</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {position.index < editorState.content.length && (
              <>
                <div>Current Char:</div>
                <div>
                  "{editorState.content[position.index]}" (Code: {editorState.content.charCodeAt(position.index)})
                </div>
              </>
            )}
            {position.index > 0 && (
              <>
                <div>Previous Char:</div>
                <div>
                  "{editorState.content[position.index - 1]}" (Code:{" "}
                  {editorState.content.charCodeAt(position.index - 1)})
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* AST Visualization Section */}
      <div>
        <h4 className="text-xs font-semibold mb-2">LaTeX AST Structure</h4>
        <div className="bg-muted/30 p-2 rounded-md max-h-60 overflow-auto">
          {parsedAst.length > 0 ? (
            <div className="ast-tree">
              {parsedAst.map((node, index) => (
                <ASTNode 
                  key={`${node.type}-${index}-${node.start}`} 
                  node={node}
                  isLast={index === parsedAst.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No AST available</div>
          )}
        </div>
      </div>
    </div>
  )
}
