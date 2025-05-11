/**
 * LaTeX Parser Module
 * 
 * This module provides functions for parsing and working with LaTeX content.
 * All indices and positions in this module follow the standardized LEFT-BASED
 * INCLUSIVE positioning system:
 * - Position 0 refers to before the first character
 * - All indices refer to the position BEFORE the character
 * - Token ranges (start/end) follow the same convention
 */

import { defaultRegistry } from "./commands";

export interface ParsedToken {
  type: "text" | "command" | "command-name" | "command-args" | "command-optional" | "math" | "math-content"
  start: number
  end: number
  content: string
  parent?: ParsedToken
  children?: ParsedToken[]
  inMath?: boolean // Track if token is inside math environment
}

export function parseLatex(text: string): ParsedToken[] {
  const tokens: ParsedToken[] = []
  let i = 0

  function parseMathContent(startIndex: number, endIndex: number): ParsedToken[] {
    // Parse the content inside a math environment
    const mathTokens: ParsedToken[] = []
    let j = startIndex

    while (j < endIndex) {
      // Check for backslash commands (like \frac)
      if (text[j] === "\\") {
        const cmdStart = j
        const backslashPos = j
        j++ // Skip backslash

        // Extract potential command name
        let commandName = ""
        const commandNameStart = j
        while (j < endIndex && /[a-zA-Z]/.test(text[j])) {
          commandName += text[j]
          j++
        }

        // Check if this is a valid registered command
        const isValidCommand = commandName.length > 0 && defaultRegistry.getBackslashCommand(commandName);
        
        if (!isValidCommand) {
          // Not a valid command - treat as regular text
          mathTokens.push({
            type: "text",
            start: backslashPos,
            end: backslashPos + 1,
            content: "\\",
            inMath: true,
          });
          
          // If we extracted command characters, add them as text too
          if (commandName.length > 0) {
            mathTokens.push({
              type: "text",
              start: commandNameStart,
              end: j,
              content: commandName,
              inMath: true,
            });
          }
          
          continue;
        }

        const commandNameToken: ParsedToken = {
          type: "command-name",
          start: cmdStart + 1, // Skip the backslash
          end: j,
          content: commandName,
          inMath: true,
        }

        // Look for optional arguments in square brackets
        const args: ParsedToken[] = []

        // Check for optional arguments in square brackets first
        if (j < endIndex && text[j] === "[") {
          const optArgStart = j
          j++ // Skip opening bracket

          let bracketCount = 1
          let optArgContent = ""
          const optArgContentStart = j

          while (j < endIndex && bracketCount > 0) {
            if (text[j] === "[") bracketCount++
            else if (text[j] === "]") bracketCount--

            if (bracketCount > 0) {
              optArgContent += text[j]
            }
            j++
          }

          // Parse nested content inside optional arguments recursively
          const nestedOptTokens = parseMathContent(optArgContentStart, j - 1)

          args.push({
            type: "command-optional",
            start: optArgStart + 1, // Inside the brackets
            end: j - 1, // Before the closing bracket
            content: optArgContent,
            inMath: true,
            children: nestedOptTokens.length > 0 ? nestedOptTokens : undefined,
          })
        }

        // Look for command arguments in curly braces
        while (j < endIndex && text[j] === "{") {
          const argStart = j
          j++ // Skip opening brace

          let braceCount = 1
          let argContent = ""
          const argContentStart = j

          while (j < endIndex && braceCount > 0) {
            if (text[j] === "{") braceCount++
            else if (text[j] === "}") braceCount--

            if (braceCount > 0) {
              argContent += text[j]
            }
            j++
          }

          // Parse nested content inside arguments recursively
          const nestedTokens = parseMathContent(argContentStart, j - 1)

          args.push({
            type: "command-args",
            start: argStart + 1, // Inside the braces
            end: j - 1, // Before the closing brace
            content: argContent,
            inMath: true,
            children: nestedTokens.length > 0 ? nestedTokens : undefined,
          })
        }

        const commandToken: ParsedToken = {
          type: "command",
          start: cmdStart,
          end: j,
          content: text.substring(cmdStart, j),
          children: [commandNameToken, ...args],
          inMath: true,
        }

        mathTokens.push(commandToken)
        continue
      }
      
      // Check for character commands - use registry to determine which characters are commands
      const commandChars = defaultRegistry.getCommandCharacters();
      const secondClassCommandChars = defaultRegistry.getSecondClassCommandCharacters();
      const currentChar = text[j];
      
      if (commandChars.includes(currentChar)) {
        const cmdStart = j;
        j++; // Skip the operator character
        
        // Create command name token using the character
        const commandNameToken: ParsedToken = {
          type: "command-name",
          start: cmdStart,
          end: cmdStart + 1,
          content: currentChar,
          inMath: true,
        }
        
        const args: ParsedToken[] = [];
        
        // Check for argument in curly braces
        if (j < endIndex && text[j] === "{") {
          const argStart = j;
          j++; // Skip opening brace
          
          let braceCount = 1;
          let argContent = "";
          const argContentStart = j;
          
          while (j < endIndex && braceCount > 0) {
            if (text[j] === "{") braceCount++;
            else if (text[j] === "}") braceCount--;
            
            if (braceCount > 0) {
              argContent += text[j];
            }
            j++;
          }
          
          // Parse nested content inside the argument recursively
          const nestedTokens = parseMathContent(argContentStart, j - 1);
          
          args.push({
            type: "command-args",
            start: argStart + 1, // Inside the braces
            end: j - 1, // Before the closing brace
            content: argContent,
            inMath: true,
            children: nestedTokens.length > 0 ? nestedTokens : undefined,
          });
        } else {
          // Handle single character argument without braces (e.g., ^2 instead of ^{2})
          // Only for second-class commands that can work without explicit braces
          if (j < endIndex && secondClassCommandChars.includes(currentChar)) {
            const argContent = text[j];
            
            args.push({
              type: "command-args",
              start: j,
              end: j + 1,
              content: argContent,
              inMath: true
            });
            
            j++;
          }
        }
        
        const commandToken: ParsedToken = {
          type: "command",
          start: cmdStart,
          end: j,
          content: text.substring(cmdStart, j),
          children: [commandNameToken, ...args],
          inMath: true,
        };
        
        mathTokens.push(commandToken);
        continue;
      }

      // Regular math content (not part of a command)
      const textStart = j;
      
      // Skip text until we reach a potential command character
      while (j < endIndex) {
        // Check if current character is a backslash
        if (text[j] === "\\") break;
        
        // Check if current character is a registered command character
        if (commandChars.includes(text[j])) break;
        
        j++;
      }

      if (j > textStart) {
        mathTokens.push({
          type: "text",
          start: textStart,
          end: j,
          content: text.substring(textStart, j),
          inMath: true,
        });
      }
    }

    return mathTokens;
  }

  while (i < text.length) {
    // Check for math environments ($$...$$)
    if (text.substring(i, i + 2) === "$$") {
      const start = i
      i += 2 // Skip opening $$

      // Find closing $$
      const mathEndIndex = text.indexOf("$$", i)
      if (mathEndIndex === -1) {
        // No closing $$, treat the rest as math content
        const mathContentStart = i
        const mathContentEnd = text.length

        // Parse the math content to find commands
        const mathContentTokens = parseMathContent(mathContentStart, mathContentEnd)

        const mathContent: ParsedToken = {
          type: "math-content",
          start: mathContentStart,
          end: mathContentEnd,
          content: text.substring(mathContentStart, mathContentEnd),
          inMath: true,
          children: mathContentTokens,
        }

        const mathToken: ParsedToken = {
          type: "math",
          start,
          end: mathContentEnd,
          content: text.substring(start, mathContentEnd),
          children: [mathContent],
          inMath: true,
        }

        tokens.push(mathToken)
        break
      } else {
        const mathContentStart = i
        const mathContentEnd = mathEndIndex

        // Parse the math content to find commands
        const mathContentTokens = parseMathContent(mathContentStart, mathContentEnd)

        const mathContent: ParsedToken = {
          type: "math-content",
          start: mathContentStart,
          end: mathContentEnd,
          content: text.substring(mathContentStart, mathContentEnd),
          inMath: true,
          children: mathContentTokens,
        }

        const mathToken: ParsedToken = {
          type: "math",
          start,
          end: mathEndIndex + 2,
          content: text.substring(start, mathEndIndex + 2),
          children: [mathContent],
          inMath: true,
        }

        tokens.push(mathToken)
        i = mathEndIndex + 2
      }
      continue
    }

    // Check for inline math ($...$)
    if (text[i] === "$" && text[i + 1] !== "$") {
      const start = i
      i++ // Skip opening $

      // Find closing $
      const mathEndIndex = text.indexOf("$", i)
      if (mathEndIndex === -1) {
        // No closing $, treat the rest as math content
        const mathContentStart = i
        const mathContentEnd = text.length

        // Parse the math content to find commands
        const mathContentTokens = parseMathContent(mathContentStart, mathContentEnd)

        const mathContent: ParsedToken = {
          type: "math-content",
          start: mathContentStart,
          end: mathContentEnd,
          content: text.substring(mathContentStart, mathContentEnd),
          inMath: true,
          children: mathContentTokens,
        }

        const mathToken: ParsedToken = {
          type: "math",
          start,
          end: mathContentEnd,
          content: text.substring(start, mathContentEnd),
          children: [mathContent],
          inMath: true,
        }

        tokens.push(mathToken)
        break
      } else {
        const mathContentStart = i
        const mathContentEnd = mathEndIndex

        // Parse the math content to find commands
        const mathContentTokens = parseMathContent(mathContentStart, mathContentEnd)

        const mathContent: ParsedToken = {
          type: "math-content",
          start: mathContentStart,
          end: mathContentEnd,
          content: text.substring(mathContentStart, mathContentEnd),
          inMath: true,
          children: mathContentTokens,
        }

        const mathToken: ParsedToken = {
          type: "math",
          start,
          end: mathEndIndex + 1,
          content: text.substring(start, mathEndIndex + 1),
          children: [mathContent],
          inMath: true,
        }

        tokens.push(mathToken)
        i = mathEndIndex + 1
      }
      continue
    }

    // Check for LaTeX commands outside math (\command{...})
    if (text[i] === "\\") {
      // Outside of math environment, \ is just regular text
      const textStart = i;
      i++; // Move past the backslash
      
      tokens.push({
        type: "text",
        start: textStart,
        end: textStart + 1,
        content: "\\",
        inMath: false,
      })
      continue;
    }

    // Regular text
    const textStart = i
    while (
      i < text.length &&
      text[i] !== "\\" &&
      text.substring(i, i + 2) !== "$$" &&
      (text[i] !== "$" || text[i + 1] === "$")
    ) {
      i++
    }

    if (i > textStart) {
      tokens.push({
        type: "text",
        start: textStart,
        end: i,
        content: text.substring(textStart, i),
        inMath: false,
      })
    }
  }

  return tokens
}

// Find the most specific command token at a specific position
export function findCommandAtPosition(tokens: ParsedToken[], position: number): ParsedToken | null {
  // First, find all commands that contain the position
  const matchingCommands: ParsedToken[] = []

  function findCommands(tokenList: ParsedToken[]) {
    for (const token of tokenList) {
      // Check if this token is a command and contains the position
      if (token.type === "command" && position >= token.start && position <= token.end) {
        matchingCommands.push(token)
      }

      // Check children recursively
      if (token.children) {
        findCommands(token.children)
      }
    }
  }

  findCommands(tokens)

  // If no commands found, return null
  if (matchingCommands.length === 0) {
    return null
  }

  // Sort commands by length (shortest first) to find the most specific (innermost) command
  matchingCommands.sort((a, b) => a.end - a.start - (b.end - b.start))

  // Return the most specific (innermost) command
  return matchingCommands[0]
}

/**
 * Gets the cursor context at a specific position
 * Position is LEFT-BASED INCLUSIVE (position 0 is before the first character)
 * @param text The text content
 * @param position The cursor position (0-based, position before character)
 * @returns An object describing the cursor context
 */
export function getCursorContext(
  text: string,
  position: number,
): {
  context: string
  inMath: boolean
  command?: ParsedToken
  token?: ParsedToken
} {
  const tokens = parseLatex(text)

  // Find the token that contains the cursor
  let containingToken: ParsedToken | undefined
  let context = "text"
  let inMath = false

  // First check if we're in a math environment
  for (const token of tokens) {
    if (token.type === "math" && position >= token.start && position <= token.end) {
      inMath = true
      break
    }
  }

  // Find the command at the current position (if any)
  const commandAtPosition = findCommandAtPosition(tokens, position)

  // Find the containing token
  for (const token of tokens) {
    if (position >= token.start && position <= token.end) {
      containingToken = token
      context = token.type

      // Check for nested tokens
      if (token.children) {
        for (const child of token.children) {
          if (position >= child.start && position <= child.end) {
            // Don't override if we found a command and this is just math-content
            if (!(commandAtPosition && child.type === "math-content")) {
              containingToken = child
              context = child.type
            }

            // Check for deeper nesting
            if (child.children) {
              for (const grandchild of child.children) {
                if (position >= grandchild.start && position <= grandchild.end) {
                  // Don't override if we found a command and this is just text
                  if (!(commandAtPosition && grandchild.type === "text")) {
                    containingToken = grandchild
                    context = grandchild.type
                  }
                }
              }
            }

            break
          }
        }
      }

      break
    }
  }

  // Special handling for empty arguments
  if (commandAtPosition) {
    const args = commandAtPosition.children?.filter((child) => 
      child.type === "command-args" || child.type === "command-optional") || [];
      
    // Check if we're in an empty argument
    for (const arg of args) {
      // For empty arguments, start and end might be the same position
      // We need to handle this special case
      if (arg.start === arg.end && position === arg.start) {
        containingToken = arg;
        context = arg.type;
        break;
      }
    }
  }

  // If we found a command, override the context
  if (commandAtPosition) {
    context = "command"

    // Check if we're in a specific part of the command
    const commandName = commandAtPosition.children?.find((child) => child.type === "command-name")
    const args = commandAtPosition.children?.filter((child) => child.type === "command-args") || []
    const optArgs = commandAtPosition.children?.filter((child) => child.type === "command-optional") || []

    // Check if we're in an optional argument
    for (const optArg of optArgs) {
      if (position >= optArg.start && position <= optArg.end) {
        context = "command-optional"
        containingToken = optArg;
        break
      }
    }

    // Check if we're in a regular argument
    for (const arg of args) {
      if (position >= arg.start && position <= arg.end) {
        context = "command-args"
        containingToken = arg;
        break
      }
    }

    if (commandName && position >= commandName.start && position <= commandName.end) {
      context = "command-name"
      containingToken = commandName;
    }
  }

  return {
    context,
    inMath,
    command: commandAtPosition || undefined,
    token: containingToken,
  }
}

// Helper function to get all nested commands and their arguments
export function getAllNestedCommands(text: string): ParsedToken[] {
  const tokens = parseLatex(text)
  const commands: ParsedToken[] = []

  function extractCommands(tokenList: ParsedToken[]) {
    for (const token of tokenList) {
      if (token.type === "command") {
        commands.push(token)
      }

      // Process children recursively
      if (token.children) {
        extractCommands(token.children)
      }
    }
  }

  extractCommands(tokens)
  return commands
}

// Add this debug function to help us understand the token structure
// Add this at the end of the file

export function debugTokens(tokens: ParsedToken[], indent = 0): void {
  const indentStr = " ".repeat(indent * 2)

  for (const token of tokens) {
    console.log(`${indentStr}${token.type}: "${token.content}" (${token.start}-${token.end})`)

    if (token.children && token.children.length > 0) {
      console.log(`${indentStr}Children:`)
      debugTokens(token.children, indent + 1)
    }
  }
}

/**
 * Normalize adjacent math environments by inserting a space between them
 * This ensures cleaner rendering and easier editing
 * @param text The LaTeX content to normalize
 * @returns Normalized LaTeX content with spaces between adjacent math environments
 */
export function normalizeAdjacentMathEnvironments(text: string): string {
  if (!text) return text;
  
  // Use a proper state machine approach for better correctness
  let result = '';
  let i = 0;
  
  // Simple state machine to track math environment context
  let inInlineMath = false; // $...$
  let inDisplayMath = false; // $$...$$
  
  while (i < text.length) {
    const char = text[i];
    
    // Handle dollar sign
    if (char === '$') {
      // Check for display math ($$)
      if (i + 1 < text.length && text[i + 1] === '$') {
        // Check if we need to add a space between adjacent math environments
        if (i > 0 && text[i - 1] === '$') {
          // We have $$ right after a $ - insert a space before
          result += ' $';
          i++;
          continue;
        }
        
        // Toggle display math state
        inDisplayMath = !inDisplayMath;
        result += '$$';
        i += 2;
        continue;
      } else {
        // Check if we need to add a space between adjacent inline math environments
        if (i > 0 && text[i - 1] === '$' && !inDisplayMath) {
          // We have $ right after a $ (but not part of $$) - insert a space before
          result += ' $';
          i++;
          continue;
        }
        
        // Toggle inline math state if not in display math
        if (!inDisplayMath) {
          inInlineMath = !inInlineMath;
        }
      }
    }
    
    // Add the character to the result
    result += char;
    i++;
  }
  
  return result;
}

/**
 * Finds an expression before cursor for potential inclusion in a command
 * Useful for identifying text segments that could be arguments to LaTeX commands
 * @param text The full text
 * @param cursorPos The cursor position
 * @returns The expression and its start position, or null if none found
 */
export function findExpressionBeforeCursor(
  text: string, 
  cursorPos: number,
  context?: { context: string; inMath: boolean; token?: ParsedToken; command?: ParsedToken }
): { expr: string; startPos: number } | null {
  // Get context if not provided
  if (!context) {
    context = getCursorContext(text, cursorPos);
  }
  
  // Define if we're in a command argument
  const inCommandArgument = context.context === "command-args" || context.context === "command-optional";
  
  // If we're in a command argument, don't try to find expressions outside it
  if (inCommandArgument && context.token) {
    const argToken = context.token;
    
    // Check if we're in an empty argument
    if (argToken.start === argToken.end && cursorPos === argToken.start) {
      return null;
    }
    
    // Ensure we're really inside the argument, not at its boundaries
    if (cursorPos <= argToken.start || cursorPos > argToken.end) {
      return null;
    }
    
    // Check if there's whitespace immediately before the cursor
    let i = cursorPos - 1;
    
    // If there's whitespace right before the cursor, don't grab any expression
    if (i < argToken.start || /\s/.test(text[i])) {
      return null;
    }
    
    // Check if there's a parenthesized expression before the cursor
    let parenCount = 0;
    let foundClosingParen = false;
    
    // If we find a closing parenthesis, look for the matching opening one
    if (i >= argToken.start && text[i] === ")") {
      foundClosingParen = true;
      parenCount = 1;
      i--;
      
      while (i >= argToken.start && parenCount > 0) {
        if (text[i] === ")") parenCount++;
        else if (text[i] === "(") parenCount--;
        i--;
      }
      
      // If we found a matching opening parenthesis
      if (parenCount === 0) {
        const startPos = i + 1; // Position of the opening parenthesis
        const expr = text.substring(startPos, cursorPos);
        return { expr, startPos };
      }
    }
    
    // If no parenthesized expression, look for continuous text (no spaces)
    if (!foundClosingParen) {
      i = cursorPos - 1;
      const endPos = i + 1;
      
      // Find the start of the continuous text (stopping at whitespace)
      while (i >= argToken.start && !/\s/.test(text[i])) {
        i--;
      }
      
      const startPos = i + 1;
      
      if (startPos < endPos && startPos >= argToken.start) {
        const expr = text.substring(startPos, endPos);
        
        // Only return if the expression isn't empty
        if (expr.trim().length > 0) {
          return { expr, startPos };
        }
      }
    }
    
    return null;
  } else {
    // Regular text, not in a command argument
    
    // Check if there's whitespace immediately before the cursor
    let i = cursorPos - 1;
    
    // If there's whitespace right before the cursor, don't grab any expression
    if (i < 0 || /\s/.test(text[i])) {
      return null;
    }
    
    // Check if there's a parenthesized expression before the cursor
    let parenCount = 0;
    let foundClosingParen = false;
    
    // If we find a closing parenthesis, look for the matching opening one
    if (i >= 0 && text[i] === ")") {
      foundClosingParen = true;
      parenCount = 1;
      i--;
      
      while (i >= 0 && parenCount > 0) {
        if (text[i] === ")") parenCount++;
        else if (text[i] === "(") parenCount--;
        i--;
      }
      
      // If we found a matching opening parenthesis
      if (parenCount === 0) {
        const startPos = i + 1; // Position of the opening parenthesis
        const expr = text.substring(startPos, cursorPos);
        return { expr, startPos };
      }
    }
    
    // If no parenthesized expression, look for continuous text (no spaces)
    if (!foundClosingParen) {
      i = cursorPos - 1;
      const endPos = i + 1;
      
      // Find the start of the continuous text (stopping at whitespace)
      while (i >= 0 && !/\s/.test(text[i])) {
        i--;
      }
      
      const startPos = i + 1;
      
      if (startPos < endPos) {
        const expr = text.substring(startPos, endPos);
        
        // Only return if the expression isn't empty
        if (expr.trim().length > 0) {
          return { expr, startPos };
        }
      }
    }
    
    return null;
  }
}

/**
 * Finds a LaTeX command immediately before the cursor position
 * @param text The full text
 * @param position The cursor position
 * @returns Command info or null if no command found
 */
export function findCommandBeforeCursor(
  text: string, 
  position: number
): { command: string; startPos: number; endPos: number } | null {
  const tokens = parseLatex(text);
  
  // Look for commands that end exactly at the cursor position
  for (const token of tokens) {
    if (token.type === "command" && token.end === position) {
      return {
        command: text.substring(token.start, token.end),
        startPos: token.start,
        endPos: token.end
      };
    }
    
    // If this token has children (e.g., math environment), check them too
    if (token.children) {
      for (const child of token.children) {
        if (child.type === "command" && child.end === position) {
          return {
            command: text.substring(child.start, child.end),
            startPos: child.start,
            endPos: child.end
          };
        }
        
        // Go one level deeper if needed
        if (child.children) {
          for (const grandchild of child.children) {
            if (grandchild.type === "command" && grandchild.end === position) {
              return {
                command: text.substring(grandchild.start, grandchild.end),
                startPos: grandchild.start,
                endPos: grandchild.end
              };
            }
          }
        }
      }
    }
  }
  
  return null;
}
