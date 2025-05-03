"use client";
import { useState, useEffect, useRef } from 'react';
import { MathJax, MathJaxContext } from "better-react-mathjax";
import styles from './LatexEditor.module.css';

const SHORTCUTS = {
  'mat': {
    template: '\\begin{bmatrix}#\\end{bmatrix}',
    cursorOffset: -12,
    defaultContent: '1 & 2 & 3 \\\\ 4 & 5 & 6',
  },
  '/': {
    template: '\\frac{#}{}',
    cursorOffset: -1,
  },
  'sqrt': {
    template: '\\sqrt{#}',
    cursorOffset: -1,
  },
  'vec': {
    template: '\\begin{bmatrix}#\\end{bmatrix}',
    cursorOffset: -12,
    defaultContent: '1 \\\\ 2 \\\\ 3',
  },
  '^': {
    template: '^{#}',
    cursorOffset: -1,
  },
  '_': {
    template: '_{#}',
    cursorOffset: -1,
  }
};

export default function LatexEditor({ value = '', onChange, placeholder = '\\text{Start typing...}' }) {
  const [editorState, setEditorState] = useState({
    content: value,
    cursorPosition: 0,
    currentWord: '',
  });
  const [showCursor, setShowCursor] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showDebug, setShowDebug] = useState(false);
  const [rawLatex, setRawLatex] = useState(value);
  
  const editorRef = useRef(null);
  const renderAreaRef = useRef(null);

  // Blink cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  // Update cursor position based on input position
  const updateCursorPosition = () => {
    if (!editorRef.current || !renderAreaRef.current) return;

    const input = editorRef.current;
    const renderArea = renderAreaRef.current;
    
    // Get the text before cursor
    const textBeforeCursor = input.value.slice(0, input.selectionStart);
    
    // Create a temporary span to measure text width
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.style.font = window.getComputedStyle(input).font;
    span.textContent = textBeforeCursor;
    
    // Add to render area temporarily
    renderArea.appendChild(span);
    
    // Get position
    const rect = span.getBoundingClientRect();
    const renderRect = renderArea.getBoundingClientRect();
    
    // Calculate position relative to render area
    const x = rect.width;
    const y = Math.floor((input.selectionStart / input.value.length) * input.scrollHeight);
    
    // Clean up
    renderArea.removeChild(span);
    
    setCursorPosition({ x, y });
  };

  const handleInput = (e) => {
    const newContent = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // Get the current word being typed
    let wordStart = cursorPosition;
    while (wordStart > 0 && /[a-zA-Z]/.test(newContent[wordStart - 1])) {
      wordStart--;
    }
    const currentWord = newContent.slice(wordStart, cursorPosition);

    setEditorState({
      content: newContent,
      cursorPosition,
      currentWord,
    });

    // Update cursor position
    updateCursorPosition();

    // Check for shortcuts
    if (SHORTCUTS[currentWord]) {
      e.preventDefault();
      insertShortcut(currentWord, wordStart);
    }

    // Update raw LaTeX for debugging
    setRawLatex(newContent);
    
    // Notify parent of changes
    onChange?.(newContent);
  };

  const insertShortcut = (shortcut, wordStart) => {
    const template = SHORTCUTS[shortcut].template;
    const defaultContent = SHORTCUTS[shortcut].defaultContent || '';
    const cursorOffset = SHORTCUTS[shortcut].cursorOffset;

    const newContent = 
      editorState.content.slice(0, wordStart) +
      template.replace('#', defaultContent) +
      editorState.content.slice(editorState.cursorPosition);

    const newCursorPos = wordStart + template.length + cursorOffset;

    setEditorState(prev => ({
      ...prev,
      content: newContent,
      cursorPosition: newCursorPos,
      currentWord: '',
    }));

    // Set cursor position after state update
    setTimeout(() => {
      editorRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      editorRef.current?.focus();
    }, 0);

    // Notify parent of changes
    onChange?.(newContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabKey();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      insertNewMatrixRow();
    } else if (e.key === 'ArrowRight' && e.altKey) {
      e.preventDefault();
      moveToNextCell();
    }
  };

  const handleTabKey = () => {
    const newContent = 
      editorState.content.slice(0, editorState.cursorPosition) +
      ' & ' +
      editorState.content.slice(editorState.cursorPosition);

    setEditorState(prev => ({
      ...prev,
      content: newContent,
      cursorPosition: editorState.cursorPosition + 3,
    }));

    setTimeout(() => {
      editorRef.current?.setSelectionRange(
        editorState.cursorPosition + 3,
        editorState.cursorPosition + 3
      );
    }, 0);

    onChange?.(newContent);
  };

  const insertNewMatrixRow = () => {
    const content = editorState.content;
    const pos = editorState.cursorPosition;
    
    // Find the current matrix boundaries
    const matrixStart = content.lastIndexOf('\\begin{bmatrix}', pos);
    const matrixEnd = content.indexOf('\\end{bmatrix}', pos);
    
    if (matrixStart === -1 || matrixEnd === -1) return;
    
    // Get the current row structure
    const currentRow = content
      .slice(matrixStart, matrixEnd)
      .split('\\\\')
      .pop()
      .trim()
      .split('&')
      .length;

    // Create new row with same number of cells
    const newRow = Array(currentRow).fill('').join(' & ');
    
    const newContent = 
      content.slice(0, pos) + 
      ' \\\\ ' + 
      newRow +
      content.slice(pos);

    setEditorState(prev => ({
      ...prev,
      content: newContent,
      cursorPosition: pos + 4,
    }));

    onChange?.(newContent);
  };

  const moveToNextCell = () => {
    const content = editorState.content;
    const pos = editorState.cursorPosition;
    
    const nextAmpersand = content.indexOf('&', pos);
    if (nextAmpersand !== -1) {
      setEditorState(prev => ({
        ...prev,
        cursorPosition: nextAmpersand + 2,
      }));
      setTimeout(() => {
        editorRef.current?.setSelectionRange(nextAmpersand + 2, nextAmpersand + 2);
      }, 0);
    }
  };

  // Update cursor position when selection changes
  useEffect(() => {
    const input = editorRef.current;
    if (!input) return;

    const handleSelectionChange = () => {
      updateCursorPosition();
    };

    input.addEventListener('selectionchange', handleSelectionChange);
    return () => input.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Update when value prop changes
  useEffect(() => {
    if (value !== editorState.content) {
      setEditorState(prev => ({
        ...prev,
        content: value,
      }));
      setRawLatex(value);
    }
  }, [value]);

  return (
    <MathJaxContext>
      <div className={styles.editorContainer}>
        <div className={styles.toolbar}>
          <button onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
          <div className={styles.shortcuts}>
            <span>Shortcuts: mat (matrix), vec (vector), / (fraction), sqrt, ^, _</span>
            <span>Tab: new column, Shift+Enter: new row, Alt+→: next cell</span>
          </div>
        </div>

        {showDebug && (
          <div className={styles.debugPanel}>
            <pre>{rawLatex}</pre>
          </div>
        )}

        <div className={styles.editor}>
          <div className={styles.inputArea}>
            <textarea
              ref={editorRef}
              value={editorState.content}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className={styles.hiddenInput}
              spellCheck="false"
            />
          </div>
          <div className={styles.renderArea} ref={renderAreaRef}>
            <MathJax dynamic>
              {`\\[${editorState.content || placeholder}\\]`}
            </MathJax>
            <div 
              className={`${styles.cursor} ${showCursor ? styles.cursorVisible : ''}`}
              style={{
                left: `${cursorPosition.x}px`,
                top: `${cursorPosition.y}px`
              }}
            />
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
} 