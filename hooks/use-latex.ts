"use client"

import type React from "react"

// React hook for the frontend

import { useEffect, useRef, useReducer, useCallback } from "react"
import { LatexEditor } from "@/lib/latex/latex-editor"
import { KeyHandler } from "@/lib/latex/key-handler"
import type { EditorState } from "@/lib/latex/editor-core"

interface UseLatexOptions {
  initialContent?: string
  onChange?: (content: string) => void
  onCursorChange?: (cursorState: EditorState["cursor"]) => void
}

interface UseLatexState {
  editor: LatexEditor | null
  keyHandler: KeyHandler | null
  editorState: EditorState | null
}

type UseLatexAction =
  | { type: "INIT_EDITOR"; payload: { editor: LatexEditor; keyHandler: KeyHandler } }
  | { type: "UPDATE_STATE"; payload: EditorState }

function latexReducer(state: UseLatexState, action: UseLatexAction): UseLatexState {
  switch (action.type) {
    case "INIT_EDITOR":
      return {
        ...state,
        editor: action.payload.editor,
        keyHandler: action.payload.keyHandler,
        editorState: action.payload.editor.getState(),
      }
    case "UPDATE_STATE":
      return {
        ...state,
        editorState: action.payload,
      }
    default:
      return state
  }
}

export function useLatex(options: UseLatexOptions = {}) {
  const [state, dispatch] = useReducer(latexReducer, {
    editor: null,
    keyHandler: null,
    editorState: null,
  })

  const editorRef = useRef<LatexEditor | null>(null)
  const keyHandlerRef = useRef<KeyHandler | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Initialize editor and key handler
  useEffect(() => {
    const editor = new LatexEditor({
      initialContent: options.initialContent || "",
      onChange: options.onChange,
      onCursorChange: options.onCursorChange,
    })

    const keyHandler = new KeyHandler({ editor })

    editorRef.current = editor
    keyHandlerRef.current = keyHandler

    dispatch({
      type: "INIT_EDITOR",
      payload: { editor, keyHandler },
    })

    // Subscribe to editor state changes
    const unsubscribe = editor.subscribe((editorState) => {
      dispatch({ type: "UPDATE_STATE", payload: editorState })
    })

    return () => {
      unsubscribe()
    }
  }, [options.initialContent, options.onChange, options.onCursorChange])

  // Handle content change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editorRef.current) {
      try {
        const { value, selectionStart, selectionEnd } = e.target
        editorRef.current.setContent(value, selectionStart || 0, selectionEnd || 0)
      } catch (error) {
        console.error("Error in handleChange:", error)
      }
    }
  }, [])

  // Handle cursor movement
  const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (keyHandlerRef.current) {
      keyHandlerRef.current.handleSelect(e)
    }
  }, [])

  // Handle mouse clicks
  const handleClick = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (keyHandlerRef.current) {
      keyHandlerRef.current.handleClick(e)
    }
  }, [])

  // Handle key commands
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (keyHandlerRef.current) {
      // Let the key handler process the event first
      keyHandlerRef.current.handleKeyDown(e)
    }
  }, [])

  return {
    textareaRef,
    editorState: state.editorState,
    editor: editorRef.current,
    handleChange,
    handleSelect,
    handleClick,
    handleKeyDown,
  }
}
