import { getCursorContext } from "./latex-parser"
import { parseLatex } from "./latex-parser"
import type { ParsedToken } from "./latex-parser"
import * as PS from "./positioning-system"

export interface CursorPosition {
  index: number
  line: number
  column: number
}

export interface CursorState {
  position: CursorPosition
  context: string
  inMath: boolean
  selection: {
    start: CursorPosition | null
    end: CursorPosition | null
  }
}

/**
 * Calculate line and column information from a character index
 */
export function calculateCursorPosition(text: string, index: number): CursorPosition {
  // Calculate line and column from index
  const textBeforeCursor = text.substring(0, index)
  const lines = textBeforeCursor.split("\n")
  const line = lines.length - 1
  const column = lines[lines.length - 1].length

  return {
    index,
    line,
    column,
  }
}

/**
 * Get comprehensive cursor state at a position
 */
export function getCursorState(text: string, selectionStart: number, selectionEnd: number): CursorState {
  const cursorContext = getCursorContext(text, selectionStart)

  return {
    position: calculateCursorPosition(text, selectionStart),
    context: cursorContext.context,
    inMath: cursorContext.inMath,
    selection: {
      start: selectionStart !== selectionEnd ? calculateCursorPosition(text, selectionStart) : null,
      end: selectionStart !== selectionEnd ? calculateCursorPosition(text, selectionEnd) : null,
    },
  }
}

/**
 * Determine if a dollar sign at the given position is an opening delimiter
 * @param text The text content
 * @param position Position of the dollar sign
 * @returns True if it's an opening delimiter, false otherwise
 */
function isDollarSignOpening(text: string, position: number): boolean {
  if (text[position] !== '$') return false;
  
  // Count dollar signs before this position - if even, it's an opening delimiter
  const textBefore = text.substring(0, position);
  const mathEnvironmentsBefore = textBefore.split('$').length - 1;
  return mathEnvironmentsBefore % 2 === 0;
}

/**
 * Determine if a dollar sign at the given position is a closing delimiter
 * @param text The text content
 * @param position Position of the dollar sign
 * @returns True if it's a closing delimiter, false otherwise
 */
function isDollarSignClosing(text: string, position: number): boolean {
  if (text[position] !== '$') return false;
  
  // Count dollar signs before this position - if odd, it's a closing delimiter
  const textBefore = text.substring(0, position);
  const mathEnvironmentsBefore = textBefore.split('$').length - 1;
  return mathEnvironmentsBefore % 2 === 1;
}

/**
 * Check if a position is valid for cursor placement.
 * This is a wrapper around the positioning system's isValidPosition
 * @deprecated Use positioning-system.isValidPosition instead
 */
export function isValidCursorPosition(text: string, position: number): boolean {
  return PS.isValidPosition(text, position);
}

/**
 * Check if position is immediately adjacent to a math delimiter (inside the math environment)
 * @param text The text content
 * @param position The position to check
 * @returns True if position is immediately adjacent to a math delimiter
 */
function isAdjacentToMathDelimiter(text: string, position: number): boolean {
  if (position <= 0 || position >= text.length) {
    return false;
  }
  
  // Special case: Between adjacent math environments should not be considered adjacent
  if (position > 0 && position < text.length && 
      text[position-1] === '$' && text[position] === '$') {
    return false; // Don't consider this position adjacent to a delimiter
  }
  
  // Check if we're immediately after an opening $ delimiter
  if (position > 0 && text[position-1] === '$') {
    // Check if this is an opening $
    if (isDollarSignOpening(text, position-1)) {
      return true; // Position immediately after an opening $ is adjacent
    }
    
    return false; // Not adjacent if after a closing $
  }
  
  // Check if we're immediately before a closing $ delimiter
  if (position < text.length && text[position] === '$') {
    // Check if this is a closing $
    if (isDollarSignClosing(text, position)) {
      return true; // Position immediately before a closing $ is adjacent
    }
    
    return false; // Not adjacent if before an opening $
  }
  
  return false;
}

/**
 * Check if a position is at a math delimiter
 */
export function isAtMathDelimiter(text: string, position: number): boolean {
  // If position is at a $ character or immediately after one
  if ((position >= 0 && position < text.length && text[position] === '$') ||
      (position > 0 && text[position - 1] === '$')) {
    return true;
  }
  return false;
}

/**
 * Check if position is immediately after a closing math delimiter
 * @param text The text content
 * @param position The position to check
 * @returns True if position is after a closing delimiter
 */
function isAfterClosingMathDelimiter(text: string, position: number): boolean {
  if (position <= 0 || position >= text.length) {
    return false;
  }
  
  // Check if previous char is $ and we're not in math mode
  if (text[position - 1] === '$') {
    const contextBefore = getCursorContext(text, position - 1);
    const contextCurrent = getCursorContext(text, position);
    
    return contextBefore.inMath && !contextCurrent.inMath;
  }
  
  return false;
}

/**
 * Check if position is immediately before an opening math delimiter
 * @param text The text content
 * @param position The position to check
 * @returns True if position is before an opening delimiter
 */
function isBeforeOpeningMathDelimiter(text: string, position: number): boolean {
  if (position < 0 || position >= text.length) {
    return false;
  }
  
  // Check if next char is $ and we're not in math mode
  if (position < text.length - 1 && text[position + 1] === '$') {
    const contextAfter = getCursorContext(text, position + 1);
    const contextCurrent = getCursorContext(text, position);
    
    return !contextCurrent.inMath && contextAfter.inMath;
  }
  
  return false;
}

/**
 * Get the next valid cursor position
 * @deprecated Use positioning-system.nextValidPosition instead
 */
export function getNextValidPosition(text: string, currentPosition: number): number {
  const nextPos = PS.nextValidPosition(text, currentPosition);
  return nextPos.index;
}

/**
 * Get the previous valid cursor position
 * @deprecated Use positioning-system.prevValidPosition instead
 */
export function getPreviousValidPosition(text: string, currentPosition: number): number {
  const prevPos = PS.prevValidPosition(text, currentPosition);
  return prevPos.index;
}

/**
 * Find all valid cursor positions in a text
 * @deprecated Use positioning-system.findTabStops instead
 */
export function findAllValidPositions(text: string): number[] {
  const positions = PS.findTabStops(text);
  return positions.map(p => p.index);
}

/**
 * Tab stops structure for organizing valid positions
 */
export interface TabStops {
  allPositions: number[] // All valid tab stops in order
  commandStarts: number[] // Start positions of commands
  commandEnds: number[] // End positions of commands
  argumentBoundaries: number[] // Boundaries of command arguments
  wordBoundaries: number[] // Word boundaries in text
  mathBoundaries: number[] // Math environment boundaries
  otherValidPositions: number[] // Other valid cursor positions
}

/**
 * Get all possible tab stops in the document, prioritized by importance
 */
export function getTabStops(text: string): TabStops {
  // We'll store all possible tab positions categorized by type
  const commandStarts: number[] = []
  const commandEnds: number[] = []
  const argumentBoundaries: number[] = []
  const wordBoundaries: number[] = []
  const mathBoundaries: number[] = []
  const otherValidPositions: number[] = []
  
  // Special case: Add positions between adjacent math environments
  for (let i = 1; i < text.length; i++) {
    if (text[i-1] === '$' && text[i] === '$') {
      // Position between adjacent dollar signs is always valid and an important tab stop
      mathBoundaries.push(i);
    }
  }

  // Use the LaTeX parser to get a structured representation of the content
  const tokens = parseLatex(text)

  // Recursive function to find all command-related tab positions
  function processTokens(tokenList: ParsedToken[]) {
    for (const token of tokenList) {
      // If this is a command, process it
      if (token.type === "command") {
        // Only add if the position is valid
        if (PS.isValidPosition(text, token.start)) {
          commandStarts.push(token.start)
        }
        if (PS.isValidPosition(text, token.end)) {
          commandEnds.push(token.end)
        }

        // Find all argument tokens (both regular and optional)
        const args =
          token.children?.filter((child) => child.type === "command-args" || child.type === "command-optional") || []

        // Add the start and end positions of each argument
        for (const arg of args) {
          // Only add if the positions are valid
          if (PS.isValidPosition(text, arg.start)) {
            argumentBoundaries.push(arg.start)
          }
          if (PS.isValidPosition(text, arg.end)) {
            argumentBoundaries.push(arg.end)
          }

          // Process nested content inside this argument
          if (arg.children && arg.children.length > 0) {
            processTokens(arg.children)
          }
        }
      }

      // If this token is a math environment, add its boundaries
      if (token.type === "math") {
        if (PS.isValidPosition(text, token.start)) {
          mathBoundaries.push(token.start)
        }
        if (PS.isValidPosition(text, token.end)) {
          mathBoundaries.push(token.end)
        }
      }

      // If this token has children (like math environments), process them recursively
      if (token.children && token.type !== "command") {
        processTokens(token.children)
      }
    }
  }

  // Start the recursive processing
  processTokens(tokens)

  // Now find word boundaries in text content
  let inWord = false
  let i = 0

  while (i < text.length) {
    // Skip positions inside commands
    let insideCommand = false
    for (let j = 0; j < commandStarts.length; j++) {
      if (i >= commandStarts[j] && i <= commandEnds[j]) {
        insideCommand = true
        break
      }
    }
    
    if (!insideCommand) {
      // In regular text, detect word boundaries
      const isWordChar = /[\w]/.test(text[i])
      
      if (isWordChar && !inWord) {
        // Start of a word
        inWord = true
        if (PS.isValidPosition(text, i)) {
          wordBoundaries.push(i)
        }
      } else if (!isWordChar && inWord) {
        // End of a word
        inWord = false
        if (PS.isValidPosition(text, i)) {
          wordBoundaries.push(i)
        }
      }
    }
    
    i++
  }

  // Find all other valid positions not covered by specific categories
  for (let i = 0; i <= text.length; i++) {
    if (PS.isValidPosition(text, i) && 
        !commandStarts.includes(i) && 
        !commandEnds.includes(i) &&
        !argumentBoundaries.includes(i) &&
        !wordBoundaries.includes(i) &&
        !mathBoundaries.includes(i)) {
      otherValidPositions.push(i)
    }
  }

  // Create combined list of all valid positions
  const allPositions = [
    ...argumentBoundaries,
    ...commandStarts,
    ...commandEnds,
    ...mathBoundaries,
    ...wordBoundaries,
    ...otherValidPositions
  ]

  // Sort and remove duplicates
  const uniquePositions = [...new Set(allPositions)].sort((a, b) => a - b)

  return {
    allPositions: uniquePositions,
    commandStarts,
    commandEnds,
    argumentBoundaries,
    wordBoundaries,
    mathBoundaries,
    otherValidPositions
  }
}

/**
 * Find the next or previous tab stop position
 * @deprecated Use positioning-system.findNextTabStop instead
 */
export function findNextTabStop(text: string, currentPosition: number, goForward: boolean): number | null {
  const nextTabStop = PS.findNextTabStop(text, currentPosition, goForward);
  return nextTabStop ? nextTabStop.index : null;
}

/**
 * Manage tab order for the entire application
 * This lets us control tab behavior across all components
 */
export interface TabTrap {
  isEnabled: boolean;
  handleTabKey: (e: KeyboardEvent) => boolean;
  registerElement: (el: HTMLElement, priority: number) => void;
  unregisterElement: (el: HTMLElement) => void;
  initialize: () => void;
  cleanup: () => void;
}

/**
 * Create a global tab trap to manage tab navigation across the entire application
 */
export function createGlobalTabTrap(): TabTrap {
  let isEnabled = false;
  const tabbableElements: Map<HTMLElement, { element: HTMLElement, priority: number }> = new Map();
  let sortedElements: HTMLElement[] = [];
  
  const registerElement = (el: HTMLElement, priority: number = 0) => {
    tabbableElements.set(el, { element: el, priority });
    rebuildSortedElements();
  };
  
  const unregisterElement = (el: HTMLElement) => {
    tabbableElements.delete(el);
    rebuildSortedElements();
  };
  
  const rebuildSortedElements = () => {
    // Convert map to array and sort by priority
    const elements = Array.from(tabbableElements.values());
    elements.sort((a, b) => b.priority - a.priority); // Higher priority first
    sortedElements = elements.map(item => item.element);
  };
  
  const findNextTabbableElement = (currentElement: HTMLElement | null, forward: boolean): HTMLElement | null => {
    if (sortedElements.length === 0) return null;
    
    if (!currentElement) {
      // If no current element, return first or last depending on direction
      return forward ? sortedElements[0] : sortedElements[sortedElements.length - 1];
    }
    
    const currentIndex = sortedElements.indexOf(currentElement);
    if (currentIndex === -1) {
      // Current element not in our list
      return forward ? sortedElements[0] : sortedElements[sortedElements.length - 1];
    }
    
    // Calculate next index with wraparound
    const nextIndex = forward 
      ? (currentIndex + 1) % sortedElements.length
      : (currentIndex - 1 + sortedElements.length) % sortedElements.length;
      
    return sortedElements[nextIndex];
  };
  
  const handleTabKey = (e: KeyboardEvent): boolean => {
    if (!isEnabled || e.key !== 'Tab') return false;
    
    const forward = !e.shiftKey;
    const activeElement = document.activeElement as HTMLElement;
    
    // If we're in a textarea/editor that has its own tab handling, let it handle the tab
    if (activeElement && 
        (activeElement.tagName === 'TEXTAREA' || 
         activeElement.contentEditable === 'true') &&
        activeElement.classList.contains('latex-editor')) {
      return false; // Let the editor handle it
    }
    
    const nextElement = findNextTabbableElement(activeElement, forward);
    if (nextElement) {
      e.preventDefault();
      nextElement.focus();
      return true;
    }
    
    return false;
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    handleTabKey(e);
  };
  
  const initialize = () => {
    if (!isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      isEnabled = true;
    }
  };
  
  const cleanup = () => {
    if (isEnabled) {
      document.removeEventListener('keydown', handleKeyDown);
      isEnabled = false;
    }
  };
  
  return {
    isEnabled,
    handleTabKey,
    registerElement,
    unregisterElement,
    initialize,
    cleanup,
  };
}

// Singleton instance for app-wide tab management
export const globalTabTrap = createGlobalTabTrap();

/**
 * React hook for managing tabbing in any component
 */
export function useTabManagement(elementRef: React.RefObject<HTMLElement>, priority: number = 0) {
  if (typeof window !== 'undefined') {
    // Only run on client-side
    if (elementRef.current) {
      globalTabTrap.registerElement(elementRef.current, priority);
    }
    
    return {
      cleanup: () => {
        if (elementRef.current) {
          globalTabTrap.unregisterElement(elementRef.current);
        }
      }
    };
  }
  
  // Return no-op on server
  return { cleanup: () => {} };
}
