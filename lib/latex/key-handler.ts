import type React from "react"
import type { LatexEditor } from "./latex-editor"
import { getCursorContext } from "./latex-parser"
import { parseLatex } from "./latex-parser"
import type { ParsedToken } from "./latex-parser"
import { CommandManager } from "./command-manager"
import * as PS from "./positioning-system"
import type { Command, EditorShortcutContext, ShortcutConfig } from "./commands/command-types"
import { defaultRegistry } from "./commands"

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

  // Helper to check if a shortcut configuration matches the event
  private checkShortcutMatch(shortcut: ShortcutConfig, event: React.KeyboardEvent<HTMLTextAreaElement>): boolean {
    const { key, ctrlKey, metaKey, shiftKey } = event;
    const osCtrlKey = navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? metaKey : ctrlKey;

    if (shortcut.key !== key) return false;
    if (Boolean(shortcut.ctrlKey) !== osCtrlKey) return false;
    if (Boolean(shortcut.metaKey) !== metaKey) return false;
    if (Boolean(shortcut.shiftKey) !== shiftKey) return false;
    
    return true;
  }

  // Handle keyboard shortcuts
  handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): boolean {
    const { key, ctrlKey, metaKey, shiftKey } = event
    const { selectionStart, selectionEnd, value: text } = event.currentTarget

    // Create shortcut context for command evaluation
    const editorState = this.editor.getState();
    const currentPosInfo = PS.positionInfo(editorState.content, selectionStart);
    const cursorContext = getCursorContext(editorState.content, selectionStart);
    
    const shortcutContext: EditorShortcutContext = {
        text: editorState.content,
        selectionStart,
        selectionEnd,
        posInfo: currentPosInfo,
        inMath: cursorContext.inMath,
        context: cursorContext.context
    };

    // Process command shortcuts from registry
    const namedCommands = this.commandManager.registry.getNamedCommands();
    for (const { name: commandName, command } of namedCommands) {
        if (command.shortcut) {
            const shortcuts = Array.isArray(command.shortcut) ? command.shortcut : [command.shortcut];
            for (const sc of shortcuts) {
                if (this.checkShortcutMatch(sc, event)) {
                    if (!sc.condition || sc.condition(shortcutContext)) {
                        event.preventDefault();
                        const args = sc.getArgs ? sc.getArgs(shortcutContext) : [];
                        const options = { ...sc.options, isShortcutInvocation: true }; 
                        this.commandManager.insertCommand(commandName, selectionStart, args, options);
                        return true;
                    }
                }
            }
        }
    }

    // Special handling for second-class commands (^ and _)
    if ((key === "^" || key === "_") && cursorContext.inMath) {
      // These are special second-class commands that need direct handling
      const commandName = key;
      event.preventDefault();
      this.commandManager.insertCommand(commandName, selectionStart, [], { isShortcutInvocation: true });
      return true;
    }

    // Auto-complete braces - keep this as a special case since it's not a formal command
    if (key === "(" || key === "[" || key === "{") {
      const closingBrace = key === "(" ? ")" : key === "[" ? "]" : "}"

      // Insert the opening and closing braces and position cursor between them
      const newContent = text.substring(0, selectionStart) + key + closingBrace + text.substring(selectionEnd)
      const cursorPosition = selectionStart + 1 // Position cursor after the opening brace

      // Update editor state through proper channel
      this.editor.setContent(newContent, cursorPosition, cursorPosition)
      event.preventDefault()
      return true
    }

    // Handle Tab key for argument navigation - keep this as it's for navigation, not command insertion
    if (key === "Tab") {
      event.preventDefault()

      // Find the next tab position using positioning system's centralized function
      const nextTabStop = PS.findNextTabStop(text, selectionStart, !shiftKey)

      if (nextTabStop) {
        const nextPos = nextTabStop.index;
        
        // Set cursor to the next position through proper channel
        this.editor.setCursor(nextPos, nextPos)
        return true
      }

      // Default tab behavior if no positions found
      const newContent = text.substring(0, selectionStart) + "  " + text.substring(selectionEnd)
      this.editor.setContent(newContent, selectionStart + 2, selectionStart + 2)
      return true
    }

    // Handle arrow keys for cursor movement - keep this as it's for navigation, not command insertion
    if (key === "ArrowLeft") {
      // Only handle if there's no selection and we're not at the start
      if (selectionStart === selectionEnd && selectionStart > 0) {
        const prevPos = PS.prevValidPosition(text, selectionStart).index

        // If the previous valid position is different from where arrow would normally go
        if (prevPos !== selectionStart - 1) {
          event.preventDefault()

          // Update the editor cursor position through proper channel
          this.editor.setCursor(prevPos, prevPos)
          return true
        }
      }
    } else if (key === "ArrowRight") {
      // Only handle if there's no selection and we're not at the end
      if (selectionStart === selectionEnd && selectionStart < text.length) {
        const nextPos = PS.nextValidPosition(text, selectionStart).index

        // If the next valid position is different from where arrow would normally go
        if (nextPos !== selectionStart + 1) {
          event.preventDefault()

          // Update the editor cursor position through proper channel
          this.editor.setCursor(nextPos, nextPos)
          return true
        }
      }
    }

    // Special shortcut for display math environment ($$) - keep this as it's special case
    if (key === "$" && shiftKey) {
      // Insert math environment with $$
      event.preventDefault()
      const newContent = text.substring(0, selectionStart) + "$$$$" + text.substring(selectionEnd)

      // Position cursor between the $$ pairs
      const cursorPosition = selectionStart + 2

      this.editor.setContent(newContent, cursorPosition, cursorPosition)
      return true
    }

    // Handle undo/redo as special cases since they're editor-level operations
    if ((ctrlKey || metaKey) && key === "z") {
      event.preventDefault()
      if (shiftKey) {
        this.editor.redo()
      } else {
        this.editor.undo()
      }
      return true
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
