/**
 * positioning-system.ts
 * 
 * This file provides a standardized system for handling positions within LaTeX content.
 * All positions are LEFT-BASED and INCLUSIVE:
 * - Position 0 refers to before the first character
 * - All indices refer to the position BEFORE the character
 */

import { getCursorContext } from './latex-parser';
import type { ParsedToken } from './latex-parser';

/**
 * Represents a position within LaTeX content
 */
export interface Position {
  index: number;      // Character index (0-based)
  isValid: boolean;   // Whether this is a valid cursor position
}

/**
 * Creates a position object at the given index
 */
export function createPosition(text: string, index: number): Position {
  const isValid = isValidPosition(text, index);
  return { index, isValid };
}

/**
 * Checks if a position is valid for cursor placement
 */
export function isValidPosition(text: string, index: number): boolean {
  // Boundary checks
  if (index < 0 || index > text.length) {
    return false;
  }
  
  // Always allow at the very beginning or end of the text
  if (index === 0 || index === text.length) {
    return true;
  }
  
  const context = getCursorContext(text, index);
  
  // Rule 1: Never inside command names
  if (context.context === "command-name") {
    return false;
  }
  
  // Rule 2: Never between command and its arguments
  if (context.command) {
    const command = context.command;
    const cmdArgs = command.children?.filter(
      child => child.type === "command-args" || child.type === "command-optional"
    ) || [];
    
    // Check if we're inside the command but not inside an argument
    if (index > command.start && index < command.end) {
      let insideArg = false;
      for (const arg of cmdArgs) {
        if (index >= arg.start && index <= arg.end) {
          insideArg = true;
          break;
        }
      }
      
      // If not inside an argument but inside the command, we're between command and args
      if (!insideArg && context.context === "command") {
        return false;
      }
    }
  }
  
  // Rule 3: Never immediately after opening or before closing math delimiters
  if (index > 0 && index < text.length) {
    // Simple direct checks for being immediately after a $ opening delimiter
    if (index > 0 && text[index - 1] === '$') {
      // If we're inside math now but weren't before, this must be after an opening delimiter
      const beforeContext = getCursorContext(text, index - 1);
      const currentContext = getCursorContext(text, index);
      if (!beforeContext.inMath && currentContext.inMath) {
        return false;
      }
    }
    
    // Check if we're immediately before a closing $ delimiter
    if (index < text.length && text[index] === '$') {
      // If we're inside math now but not after, this must be before a closing delimiter
      const currentContext = getCursorContext(text, index);
      const afterContext = getCursorContext(text, index + 1);
      if (currentContext.inMath && !afterContext.inMath) {
        return false;
      }
    }
  }
  
  // Rule 4: Valid at any other position
  return true;
}

/**
 * Move to the next valid position
 */
export function nextValidPosition(text: string, currentIndex: number): Position {
  if (currentIndex >= text.length) {
    return createPosition(text, text.length);
  }
  
  let nextIndex = currentIndex + 1;
  
  // Skip over invalid positions
  while (nextIndex <= text.length && !isValidPosition(text, nextIndex)) {
    nextIndex++;
  }
  
  // If we've gone beyond the text boundary, return the end position
  if (nextIndex > text.length) {
    return createPosition(text, text.length);
  }
  
  return createPosition(text, nextIndex);
}

/**
 * Move to the previous valid position
 */
export function prevValidPosition(text: string, currentIndex: number): Position {
  if (currentIndex <= 0) {
    return createPosition(text, 0);
  }
  
  let prevIndex = currentIndex - 1;
  
  // Skip over invalid positions
  while (prevIndex >= 0 && !isValidPosition(text, prevIndex)) {
    prevIndex--;
  }
  
  // If we've gone below 0, return the start position
  if (prevIndex < 0) {
    return createPosition(text, 0);
  }
  
  return createPosition(text, prevIndex);
}

/**
 * Checks if a position is inside math mode
 */
export function isInMathMode(text: string, index: number): boolean {
  const context = getCursorContext(text, index);
  return context.inMath;
}

/**
 * Checks if position is immediately after a math delimiter opening
 */
export function isAfterMathOpening(text: string, index: number): boolean {
  if (index <= 0 || index >= text.length) {
    return false;
  }
  
  // If character before is $ and we're in math mode but weren't before, this is after opening
  if (text[index - 1] === '$') {
    const beforeContext = getCursorContext(text, index - 1);
    const atContext = getCursorContext(text, index);
    return !beforeContext.inMath && atContext.inMath;
  }
  
  return false;
}

/**
 * Checks if position is immediately before a math delimiter closing
 */
export function isBeforeMathClosing(text: string, index: number): boolean {
  if (index < 0 || index >= text.length) {
    return false;
  }
  
  // If character at position is $ and we're in math mode but won't be after, this is before closing
  if (text[index] === '$') {
    const atContext = getCursorContext(text, index);
    const afterContext = getCursorContext(text, index + 1);
    return atContext.inMath && !afterContext.inMath;
  }
  
  return false;
}

/**
 * Find all valid positions for tabbing in the document
 */
export function findTabStops(text: string): Position[] {
  const validPositions: Position[] = [];
  
  // Check each position in the text
  for (let i = 0; i <= text.length; i++) {
    if (isValidPosition(text, i)) {
      validPositions.push(createPosition(text, i));
    }
  }
  
  return validPositions;
}

/**
 * Find the next tab stop from the current position
 */
export function findNextTabStop(text: string, currentIndex: number, goForward: boolean): Position | null {
  const tabStops = findTabStops(text);
  if (tabStops.length === 0) return null;
  
  if (goForward) {
    // Find the next position after the current index
    for (const pos of tabStops) {
      if (pos.index > currentIndex) {
        return pos;
      }
    }
    
    // If no position found, wrap around to the first position
    return tabStops[0];
  } else {
    // Find the previous position before the current index
    for (let i = tabStops.length - 1; i >= 0; i--) {
      if (tabStops[i].index < currentIndex) {
        return tabStops[i];
      }
    }
    
    // If no position found, wrap around to the last position
    return tabStops[tabStops.length - 1];
  }
}

/**
 * Calculate position information from an index
 */
export function positionInfo(text: string, index: number): {
  position: Position;
  inMath: boolean;
  context: string;
  isAfterOpeningMath: boolean;
  isBeforeClosingMath: boolean;
} {
  const position = createPosition(text, index);
  const cursorContext = getCursorContext(text, index);
  
  return {
    position,
    inMath: cursorContext.inMath,
    context: cursorContext.context,
    isAfterOpeningMath: isAfterMathOpening(text, index),
    isBeforeClosingMath: isBeforeMathClosing(text, index)
  };
} 