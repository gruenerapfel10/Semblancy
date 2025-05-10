import { getCursorState, type CursorState } from "./cursor-manager"

export interface EditorState {
  content: string
  cursor: CursorState
  history: {
    past: string[]
    future: string[]
  }
}

export interface EditorAction {
  type: "SET_CONTENT" | "SET_CURSOR" | "UNDO" | "REDO"
  payload?: any
}

export function createInitialEditorState(initialContent = ""): EditorState {
  return {
    content: initialContent,
    cursor: getCursorState(initialContent, 0, 0),
    history: {
      past: [],
      future: [],
    },
  }
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_CONTENT": {
      const { content, selectionStart, selectionEnd } = action.payload

      // Add current state to history only if content changed
      const past =
        state.content !== content
          ? [...(state.history.past || []), state.content].slice(-50) // Limit history size
          : [...(state.history.past || [])]

      return {
        ...state,
        content,
        cursor: getCursorState(content, selectionStart, selectionEnd),
        history: {
          past,
          future: [],
        },
      }
    }

    case "SET_CURSOR": {
      const { selectionStart, selectionEnd } = action.payload
      return {
        ...state,
        cursor: getCursorState(state.content, selectionStart, selectionEnd),
      }
    }

    case "UNDO": {
      if (!state.history.past || state.history.past.length === 0) return state

      const past = [...(state.history.past || [])]
      const previousContent = past.pop()

      return {
        ...state,
        content: previousContent || "",
        cursor: getCursorState(previousContent || "", 0, 0),
        history: {
          past,
          future: [state.content, ...(state.history.future || [])],
        },
      }
    }

    case "REDO": {
      if (!state.history.future || state.history.future.length === 0) return state

      const future = [...(state.history.future || [])]
      const nextContent = future.shift()

      return {
        ...state,
        content: nextContent || "",
        cursor: getCursorState(nextContent || "", 0, 0),
        history: {
          past: [...(state.history.past || []), state.content],
          future,
        },
      }
    }

    default:
      return state
  }
}
