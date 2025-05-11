import { getCursorContext } from "../latex-parser"
import * as PS from "../positioning-system"
import { CommandOptions, TokenContext } from "./command-types"

/**
 * Build a LaTeX command string with arguments
 * @param commandName Command name without backslash
 * @param args Array of argument strings
 * @returns Formatted command string
 */
export function buildCommandString(commandName: string, args: string[] = []): string {
  let commandStr = `\\${commandName}`
  
  // Add provided arguments
  args.forEach(arg => {
    commandStr += `{${arg}}`
  })
  
  // Add empty arguments if none or only one provided
  if (args.length === 0) {
    commandStr += "{}{}";
  } else if (args.length === 1) {
    commandStr += "{}";
  }
  
  return commandStr;
}

/**
 * Check if position is right before a math environment
 * @param text Content text
 * @param position Current position
 * @returns True if position is right before a math environment
 */
export function isBeforeMathEnvironment(text: string, position: number): boolean {
  return (
    position === 0 && 
    text.length > 0 && 
    (text[0] === '$' || (text.length > 1 && text.substring(0, 2) === '$$'))
  );
}

/**
 * Check if context is inside a command argument
 * @param context The cursor context string
 * @returns True if inside a command argument
 */
export function isInsideCommandArgument(context: string): boolean {
  return context === "command-args" || context === "command-optional" || context === "command";
}

/**
 * Insert a command into a command argument
 * @param text Original text
 * @param position Cursor position
 * @param commandStr Command string to insert
 * @param context The full cursor context object
 * @param requiresMathWrap Whether to wrap with math
 * @param options Command insertion options
 * @returns New text and cursor position
 */
export function insertIntoCommandArgument(
  text: string, 
  position: number, 
  commandStr: string, 
  context: TokenContext,
  requiresMathWrap: boolean,
  options: CommandOptions
): { newText: string; newCursorPos: number } {
  const prefix = requiresMathWrap ? "$" : ""
  const suffix = requiresMathWrap ? "$" : ""
  
  // Get the token from context
  const argToken = context.token
  
  if (!argToken) {
    // Fallback to regular insertion if no token is available
    return insertAtPosition(text, position, commandStr, requiresMathWrap, options);
  }
  
  const beforeArg = text.substring(0, argToken.start)
  const afterArg = text.substring(argToken.end)
  const argContent = text.substring(argToken.start, position) + 
                    prefix + commandStr + suffix + 
                    text.substring(position, argToken.end)
  
  const newText = beforeArg + argContent + afterArg
  
  // Calculate cursor position
  const newCursorPos = calculateCursorPositionForArgument(
    commandStr,
    argToken.start + (position - argToken.start) + prefix.length,
    options
  )
  
  return { newText, newCursorPos }
}

/**
 * Insert a command at a regular position
 * @param text Original text
 * @param position Cursor position
 * @param commandStr Command string to insert
 * @param requiresMathWrap Whether to wrap with math
 * @param options Command insertion options
 * @returns New text and cursor position
 */
export function insertAtPosition(
  text: string,
  position: number,
  commandStr: string,
  requiresMathWrap: boolean,
  options: CommandOptions
): { newText: string; newCursorPos: number } {
  const prefix = requiresMathWrap ? "$" : ""
  const suffix = requiresMathWrap ? "$" : ""
  
  const newText = text.substring(0, position) + 
                 prefix + commandStr + suffix + 
                 text.substring(position)
  
  // Calculate cursor position
  const newCursorPos = calculateCursorPositionForArgument(
    commandStr,
    position + prefix.length,
    options
  )
  
  return { newText, newCursorPos }
}

/**
 * Calculate cursor position within a command based on argument index
 * @param commandStr The command string including arguments
 * @param basePosition The base position where the command starts
 * @param options Options containing argument index info
 * @returns The calculated cursor position
 */
export function calculateCursorPositionForArgument(
  commandStr: string, 
  basePosition: number,
  options: CommandOptions = {}
): number {
  // Find all argument positions
  const argPositions: number[] = []
  let openBraceLevel = 0
  
  for (let i = 0; i < commandStr.length; i++) {
    if (commandStr[i] === '{') {
      openBraceLevel++;
      if (openBraceLevel === 1) {
        // Start of an argument
        argPositions.push(i + 1); // +1 to position inside the brace
      }
    } else if (commandStr[i] === '}') {
      openBraceLevel--;
    }
  }
  
  // If no argument positions found, return the end of the command
  if (argPositions.length === 0) {
    return basePosition + commandStr.length;
  }
  
  // Determine target argument index
  let targetIndex: number;
  
  if (options.cursorArgumentIndex !== undefined) {
    // Use specified argument index
    if (options.cursorArgumentIndex < 0) {
      // Negative index means counting from the end (-1 is last arg)
      targetIndex = argPositions.length + options.cursorArgumentIndex;
    } else {
      targetIndex = options.cursorArgumentIndex;
    }
    
    // Clamp to valid range
    targetIndex = Math.max(0, Math.min(argPositions.length - 1, targetIndex));
  } else if (options.positionInFirstArg === false) {
    // Legacy behavior: position in second argument if positionInFirstArg is false
    targetIndex = Math.min(1, argPositions.length - 1);
  } else {
    // Default behavior: position in first argument
    targetIndex = 0;
  }
  
  // Return position
  return basePosition + argPositions[targetIndex];
}

/**
 * Get context for insertion at a position
 * @param text The text content
 * @param position The insertion position
 * @returns Context information with position info and token context
 */
export function getInsertionContext(text: string, position: number): {
  posInfo: ReturnType<typeof PS.positionInfo>;
  contextInfo: TokenContext
} {
  // Ensure we're at a valid cursor position
  if (!PS.isValidPosition(text, position)) {
    position = PS.nextValidPosition(text, position).index
  }
  
  // Get comprehensive position info
  const posInfo = PS.positionInfo(text, position)
  
  // Get the full context for token information
  const contextInfo = getCursorContext(text, position) as TokenContext
  
  return { posInfo, contextInfo }
} 