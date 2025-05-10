import { createInitialEditorState, editorReducer, type EditorState, type EditorAction } from "./editor-core"
import { normalizeAdjacentMathEnvironments } from "./latex-parser"
import * as PS from "./positioning-system"

export interface LatexEditorOptions {
  onContentChange?: (content: string, selectionStart: number, selectionEnd: number) => void
  onCursorChange?: (selectionStart: number, selectionEnd: number) => void
}

export class LatexEditor {
  private state: EditorState
  private options: LatexEditorOptions
  private dispatch: (action: EditorAction) => void

  constructor(initialContent: string = "", options: LatexEditorOptions = {}) {
    this.state = createInitialEditorState(initialContent)
    this.options = options
    this.dispatch = (action: EditorAction) => {
      this.state = editorReducer(this.state, action)
    }
  }

  getState(): EditorState {
    return this.state
  }

  getContent(): string {
    return this.state.content
  }

  getCursor(): { selectionStart: number; selectionEnd: number } {
    return {
      selectionStart: this.state.cursor.position.index,
      selectionEnd: this.state.cursor.selection.end?.index || this.state.cursor.position.index,
    }
  }

  setContent(content: string, selectionStart: number, selectionEnd: number): void {
    // Normalize adjacent math environments
    const normalizedContent = normalizeAdjacentMathEnvironments(content);
    
    // Adjust cursor positions if content was changed by normalization
    let adjustedSelectionStart = selectionStart;
    let adjustedSelectionEnd = selectionEnd;
    
    if (normalizedContent !== content) {
      // Content was changed - try to preserve cursor position
      // Simple approach: if cursor is after a change, adjust by the difference in length
      const lengthDiff = normalizedContent.length - content.length;
      
      // If the cursor is after character changes, adjust positions
      if (lengthDiff !== 0) {
        // Check if positions need to be adjusted due to normalization
        if (selectionStart > content.length / 2) {
          adjustedSelectionStart = Math.min(normalizedContent.length, selectionStart + lengthDiff);
        }
        
        if (selectionEnd > content.length / 2) {
          adjustedSelectionEnd = Math.min(normalizedContent.length, selectionEnd + lengthDiff);
        }
      }
    }
    
    // Ensure cursor positions are valid in the new content
    const validStart = PS.isValidPosition(normalizedContent, adjustedSelectionStart) 
      ? adjustedSelectionStart 
      : PS.nextValidPosition(normalizedContent, adjustedSelectionStart).index;
      
    const validEnd = PS.isValidPosition(normalizedContent, adjustedSelectionEnd)
      ? adjustedSelectionEnd
      : PS.nextValidPosition(normalizedContent, adjustedSelectionEnd).index;
    
    // Update the state
    this.dispatch({
      type: "SET_CONTENT",
      payload: {
        content: normalizedContent,
        selectionStart: validStart,
        selectionEnd: validEnd,
      },
    })

    // Notify listeners
    if (this.options.onContentChange) {
      this.options.onContentChange(normalizedContent, validStart, validEnd)
    }
  }

  setCursor(selectionStart: number, selectionEnd: number): void {
    const content = this.state.content;
    
    // Ensure cursor positions are valid
    const validStart = PS.isValidPosition(content, selectionStart) 
      ? selectionStart 
      : PS.nextValidPosition(content, selectionStart).index;
      
    const validEnd = PS.isValidPosition(content, selectionEnd)
      ? selectionEnd
      : PS.nextValidPosition(content, selectionEnd).index;
    
    this.dispatch({
      type: "SET_CURSOR",
      payload: {
        selectionStart: validStart,
        selectionEnd: validEnd,
      },
    })

    // Notify listeners
    if (this.options.onCursorChange) {
      this.options.onCursorChange(validStart, validEnd)
    }
  }

  undo(): void {
    this.dispatch({
      type: "UNDO",
    })

    // Notify listeners of the change
    const { content, cursor } = this.state
    if (this.options.onContentChange) {
      const { position, selection } = cursor
      const selectionStart = position.index
      const selectionEnd = selection.end?.index || selectionStart
      this.options.onContentChange(content, selectionStart, selectionEnd)
    }
  }

  redo(): void {
    this.dispatch({
      type: "REDO",
    })

    // Notify listeners of the change
    const { content, cursor } = this.state
    if (this.options.onContentChange) {
      const { position, selection } = cursor
      const selectionStart = position.index
      const selectionEnd = selection.end?.index || selectionStart
      this.options.onContentChange(content, selectionStart, selectionEnd)
    }
  }
}
