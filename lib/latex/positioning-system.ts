/**
 * positioning-system.ts
 * 
 * This file provides a standardized system for handling positions within LaTeX content.
 * All positions are LEFT-BASED and INCLUSIVE:
 * - Position 0 refers to before the first character
 * - All indices refer to the position BEFORE the character
 */

import { getCursorContext } from './latex-parser';
import { parseLatex } from './latex-parser';
import type { ParsedToken } from './latex-parser';
import { defaultRegistry } from './commands';

/**
 * Represents a position within LaTeX content
 */
export interface Position {
  index: number;      // Character index (0-based)
  isValid: boolean;   // Whether this is a valid cursor position
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
  
  // Rule 0: Never allow cursor at math delimiters
  if (isAtMathDelimiter(text, index)) {
    return false;
  }
  
  const context = getCursorContext(text, index);
  
  // Rule 1: Never inside command names for first-class commands
  // For second-class commands like ^ and _, allow positioning
  if (context.context === "command-name" && context.token) {
    const commandChar = context.token.content;
    const commandClass = defaultRegistry.getCommandClass(commandChar);
    
    // If it's not a second-class command, disallow positioning inside the command name
    if (commandClass !== 'second') {
      return false;
    }
  }
  
  // Rule 2: Never between command and its arguments for first-class commands
  // For second-class commands like ^ and _, allow positioning
  if (context.command) {
    const command = context.command;
    
    // Check if this is a command with a command name
    const commandNameToken = command.children?.find(child => child.type === "command-name");
    if (commandNameToken) {
      const commandName = commandNameToken.content;
      const commandClass = defaultRegistry.getCommandClass(commandName);
      
      // If it's a first-class command, apply the normal positioning rules
      if (commandClass !== 'second') {
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
 * Checks if a position is at a math delimiter
 * @param text The text content
 * @param index The cursor position to check
 * @returns True if the position is directly at a math delimiter
 */
export function isAtMathDelimiter(text: string, index: number): boolean {
  // Nothing to check if index is out of bounds
  if (index < 0 || index >= text.length) {
    return false;
  }
  
  // Get all math tokens
  const tokens = parseLatex(text);
  
  // For each math token, check if our index matches its delimiters
  for (const token of tokens) {
    if (token.type === "math") {
      // Check for opening delimiter positions
      // Since positions are LEFT-BASED INCLUSIVE, the position of opening $ is token.start
      if (index === token.start + 1) {
        return true; // Position is at opening delimiter
      }
      
      // Check for display math ($$) - the position of the second $ is token.start + 1
      if (text.substring(token.start, token.start + 2) === '$$' && index === token.start + 1) {
        return true; // Position is at second $ of opening $$
      }
      
      // Check for closing delimiter positions
      // For inline math ($), the position of closing $ is token.end - 1
      if (text.substring(token.start, token.start + 2) !== '$$' && 
          text.substring(token.end - 2, token.end) !== '$$' &&
          index === token.end - 1) {
        return true; // Position is at closing $ for inline math
      }
      
      // For display math ($$), the positions of closing $$ are token.end - 2 and token.end - 1
      if (text.substring(token.end - 2, token.end) === '$$') {
        if (index === token.end - 2 || index === token.end - 1) {
          return true; // Position is at first or second $ of closing $$
        }
      }
    }
  }
  
  return false;
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
        if (isValidPosition(text, token.start)) {
          commandStarts.push(token.start)
        }
        if (isValidPosition(text, token.end)) {
          commandEnds.push(token.end)
        }

        // Find all argument tokens (both regular and optional)
        const args =
          token.children?.filter((child) => child.type === "command-args" || child.type === "command-optional") || []

        // Add the start and end positions of each argument
        for (const arg of args) {
          // Only add if the positions are valid
          if (isValidPosition(text, arg.start)) {
            argumentBoundaries.push(arg.start)
          }
          if (isValidPosition(text, arg.end)) {
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
        if (isValidPosition(text, token.start)) {
          mathBoundaries.push(token.start)
        }
        if (isValidPosition(text, token.end)) {
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
        if (isValidPosition(text, i)) {
          wordBoundaries.push(i)
        }
      } else if (!isWordChar && inWord) {
        // End of a word
        inWord = false
        if (isValidPosition(text, i)) {
          wordBoundaries.push(i)
        }
      }
    }
    
    i++
  }

  // Find all other valid positions not covered by specific categories
  for (let i = 0; i <= text.length; i++) {
    if (isValidPosition(text, i) && 
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
 * Find all valid positions for tabbing in the document
 */
export function findTabStops(text: string): Position[] {
  // Reuse the getTabStops function and convert to Position objects
  const tabStops = getTabStops(text);
  return tabStops.allPositions.map(index => createPosition(text, index));
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