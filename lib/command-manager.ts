import type { LatexEditor } from "./latex-editor"
import { getCursorContext } from "./latex-parser"
import type { ParsedToken } from "./latex-parser"
import { parseLatex } from "./latex-parser"
import { isValidCursorPosition, getNextValidPosition, getPreviousValidPosition, isAtMathDelimiter } from "./cursor-manager"
import * as PS from "./positioning-system"

// Define a proper type for our context objects
interface TokenContext {
  context: string;
  inMath: boolean;
  token?: ParsedToken;
  command?: ParsedToken;
}

export interface CommandInsertionOptions {
  wrapWithMath?: boolean // Whether to wrap with $ if not in math mode
  positionInFirstArg?: boolean // Whether to position cursor in first arg (vs second)
  useTextBeforeCursor?: boolean // Whether to use text before cursor as first arg
  cursorArgumentIndex?: number // Index of argument to position cursor in (0-based, -1 for last)
}

export class CommandManager {
  private editor: LatexEditor

  constructor(editor: LatexEditor) {
    this.editor = editor
  }

  /**
   * Insert a command at a specific position
   * @param commandName Command name without backslash
   * @param position Position to insert the command
   * @param args Array of argument strings
   * @param options Options for insertion
   * @returns The new cursor position
   */
  insertCommand(
    commandName: string,
    position: number,
    args: string[] = [],
    options: CommandInsertionOptions = {}
  ): number {
    const state = this.editor.getState()
    const text = state.content
    
    // Ensure we're at a valid cursor position
    if (!PS.isValidPosition(text, position)) {
      position = PS.nextValidPosition(text, position).index
    }
    
    // Get comprehensive position info
    const posInfo = PS.positionInfo(text, position)
    
    // Build the command with arguments
    let commandStr = this.buildCommandString(commandName, args)
    
    // Aggressive check for math mode - never wrap if in math mode or after $ delimiter
    const requiresMathWrap = !posInfo.inMath && 
                             !posInfo.isAfterOpeningMath && 
                             !posInfo.isBeforeClosingMath && 
                             options.wrapWithMath !== false
    
    // Handle special case: inserting at the beginning of a math environment
    if (this.isBeforeMathEnvironment(text, position)) {
      return this.insertCommandAtStartOfMathEnvironment(commandName, args, options)
    }
    
    // Handle different insertion contexts
    let newContent: string
    let cursorPosition: number
    
    // Get the full context to properly handle command arguments
    const fullContext = getCursorContext(text, position)
    
    if (this.isInsideCommandArgument(posInfo.context)) {
      // We're inside a command argument - insert within this argument
      const { newText, newCursorPos } = this.insertIntoCommandArgument(
        text, position, commandStr, fullContext, requiresMathWrap, options
      )
      newContent = newText
      cursorPosition = newCursorPos
    } else {
      // Regular insertion at cursor position
      const { newText, newCursorPos } = this.insertAtPosition(
        text, position, commandStr, requiresMathWrap, options
      )
      newContent = newText
      cursorPosition = newCursorPos
    }
    
    // Update content in editor
    this.editor.setContent(newContent, cursorPosition, cursorPosition)
    return cursorPosition
  }
  
  /**
   * Build a LaTeX command string with arguments
   * @param commandName Command name without backslash
   * @param args Array of argument strings
   * @returns Formatted command string
   */
  private buildCommandString(commandName: string, args: string[] = []): string {
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
  private isBeforeMathEnvironment(text: string, position: number): boolean {
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
  private isInsideCommandArgument(context: string): boolean {
    return context === "command-args" || context === "command-optional";
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
  private insertIntoCommandArgument(
    text: string, 
    position: number, 
    commandStr: string, 
    context: TokenContext,
    requiresMathWrap: boolean,
    options: CommandInsertionOptions
  ): { newText: string; newCursorPos: number } {
    const prefix = requiresMathWrap ? "$" : ""
    const suffix = requiresMathWrap ? "$" : ""
    
    // Get the token from context
    const argToken = context.token
    
    if (!argToken) {
      // Fallback to regular insertion if no token is available
      return this.insertAtPosition(text, position, commandStr, requiresMathWrap, options);
    }
    
    const beforeArg = text.substring(0, argToken.start)
    const afterArg = text.substring(argToken.end)
    const argContent = text.substring(argToken.start, position) + 
                       prefix + commandStr + suffix + 
                       text.substring(position, argToken.end)
    
    const newText = beforeArg + argContent + afterArg
    
    // Calculate cursor position
    const newCursorPos = this.calculateCursorPositionForArgument(
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
  private insertAtPosition(
    text: string,
    position: number,
    commandStr: string,
    requiresMathWrap: boolean,
    options: CommandInsertionOptions
  ): { newText: string; newCursorPos: number } {
    const prefix = requiresMathWrap ? "$" : ""
    const suffix = requiresMathWrap ? "$" : ""
    
    const newText = text.substring(0, position) + 
                    prefix + commandStr + suffix + 
                    text.substring(position)
    
    // Calculate cursor position
    const newCursorPos = this.calculateCursorPositionForArgument(
      commandStr,
      position + prefix.length,
      options
    )
    
    return { newText, newCursorPos }
  }
  
  /**
   * Insert a command at the start of a math environment
   * @param commandName Command name
   * @param args Command arguments
   * @param options Command options
   * @returns Cursor position
   */
  private insertCommandAtStartOfMathEnvironment(
    commandName: string,
    args: string[] = [],
    options: CommandInsertionOptions = {}
  ): number {
    const state = this.editor.getState()
    const text = state.content
    
    // Build the command string
    const commandStr = this.buildCommandString(commandName, args)
    
    let newContent: string;
    let cursorPosition: number;
    
    // Check if it's display math ($$) or inline math ($)
    if (text.length > 1 && text.substring(0, 2) === '$$') {
      // Display math - insert after $$
      newContent = '$$' + commandStr + text.substring(2);
      
      // Calculate cursor position (after $$ + inside appropriate argument)
      cursorPosition = this.calculateCursorPositionForArgument(
        commandStr,
        2, // After $$
        options
      );
    } else {
      // Inline math - insert after $
      newContent = '$' + commandStr + text.substring(1);
      
      // Calculate cursor position (after $ + inside appropriate argument)
      cursorPosition = this.calculateCursorPositionForArgument(
        commandStr,
        1, // After $
        options
      );
    }
    
    // Update content in editor
    this.editor.setContent(newContent, cursorPosition, cursorPosition);
    return cursorPosition;
  }
  
  /**
   * Calculate cursor position within a command based on argument index
   * @param commandStr The command string including arguments
   * @param basePosition The base position where the command starts
   * @param options Options containing argument index info
   * @returns The calculated cursor position
   */
  private calculateCursorPositionForArgument(
    commandStr: string, 
    basePosition: number,
    options: CommandInsertionOptions
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
   * Inserts a command and uses text before cursor as first argument
   * @param commandName Command name without backslash
   * @param position Position to insert the command
   * @param options Options for insertion
   * @returns The new cursor position
   */
  insertCommandWithTextBeforeCursor(
    commandName: string,
    position: number,
    options: CommandInsertionOptions = {}
  ): number {
    const state = this.editor.getState()
    const text = state.content
    
    // Ensure we're at a valid cursor position
    if (!PS.isValidPosition(text, position)) {
      position = PS.nextValidPosition(text, position).index
    }
    
    // Get comprehensive position info
    const posInfo = PS.positionInfo(text, position)
    
    // Get the full context for token information
    const fullContext = getCursorContext(text, position)
    
    // If we're immediately after a math opening delimiter, NEVER wrap
    if (posInfo.isAfterOpeningMath) {
      return this.insertCommand(commandName, position, [], {
        ...options,
        wrapWithMath: false, // Force no wrapping
      })
    }
    
    // We always need to check for text before cursor if not in a command argument
    if (!this.isInsideCommandArgument(posInfo.context)) {
      // Find text before cursor that could be used as an argument
      const beforeText = this.findExpressionBeforeCursor(text, position, fullContext)
      
      // Only use the text if it's not empty or just whitespace
      if (beforeText && beforeText.expr.trim().length > 0) {
        // Make sure the text doesn't contain math delimiters
        if (!beforeText.expr.includes('$')) {
          // We have meaningful text to use as the first argument
          return this.insertCommandWithWrapper(
            commandName,
            beforeText.startPos,
            position,
            beforeText.expr,
            options
          )
        }
      }
    }
    
    // No meaningful text before cursor or we're in a command argument
    // Just insert the command at the current position
    const cursorPosition = this.insertCommand(commandName, position, [], options)
    
    // Force update the textarea cursor position
    this.editor.setCursor(cursorPosition, cursorPosition)
    
    return cursorPosition
  }
  
  /**
   * Insert a command that wraps existing text
   * @param commandName Command name without backslash
   * @param startPos Start position of text to wrap
   * @param endPos End position of text to wrap
   * @param textToWrap Text to use as first argument (optimization to avoid substring)
   * @param options Options for insertion
   * @returns The new cursor position
   */
  insertCommandWithWrapper(
    commandName: string,
    startPos: number,
    endPos: number,
    textToWrap: string,
    options: CommandInsertionOptions = {}
  ): number {
    const state = this.editor.getState()
    const text = state.content
    
    // Get comprehensive position info
    const posInfo = PS.positionInfo(text, startPos)
    
    // Get the full context for token information
    const fullContext = getCursorContext(text, startPos)
    
    // Build the command string
    const commandStr = `\\${commandName}{${textToWrap}}{}`
    
    // Determine if we need math mode wrapping - never wrap if already in math
    const needsMathWrap = !posInfo.inMath && options.wrapWithMath !== false
    const prefix = needsMathWrap ? "$" : ""
    const suffix = needsMathWrap ? "$" : ""
    
    // Create new content
    let newContent: string
    let cursorPosition: number
    
    // Handle different insertion contexts
    if (this.isInsideCommandArgument(posInfo.context) && fullContext.token) {
      // We're inside a command argument, insert only within this argument
      const argToken = fullContext.token
      
      // Make sure the start and end positions are within this argument
      if (startPos >= argToken.start && endPos <= argToken.end) {
        const beforeInArg = text.substring(argToken.start, startPos)
        const afterInArg = text.substring(endPos, argToken.end)
        
        const newArgContent = beforeInArg + commandStr + afterInArg
        
        newContent = text.substring(0, argToken.start) + newArgContent + text.substring(argToken.end)
        
        // Calculate cursor position based on argument index
        cursorPosition = this.calculateCursorPositionForArgument(
          commandStr,
          argToken.start + beforeInArg.length,
          // Default to second argument if not explicitly specified
          { ...options, positionInFirstArg: options.cursorArgumentIndex === undefined ? false : undefined }
        )
      } else {
        // Invalid range, fallback to simple insertion
        return this.insertCommand(commandName, startPos, [], options)
      }
    } else {
      // Regular insertion with wrapping
      newContent = text.substring(0, startPos) + 
                   prefix + commandStr + suffix + 
                   text.substring(endPos)
      
      // Calculate cursor position based on argument index
      cursorPosition = this.calculateCursorPositionForArgument(
        commandStr,
        startPos + prefix.length,
        // Default to second argument if not explicitly specified
        { ...options, positionInFirstArg: options.cursorArgumentIndex === undefined ? false : undefined }
      )
    }
    
    // Update content in editor and force update cursor position
    this.editor.setContent(newContent, cursorPosition, cursorPosition)
    
    // Return the cursor position
    return cursorPosition
  }
  
  /**
   * Find expression before cursor for potential inclusion in a command
   * @param text The full text
   * @param cursorPos The cursor position
   * @param context The cursor context object
   * @returns The expression and its start position, or null if none found
   */
  findExpressionBeforeCursor(
    text: string, 
    cursorPos: number,
    context?: TokenContext
  ): { expr: string; startPos: number } | null {
    // Get context if not provided
    if (!context) {
      context = getCursorContext(text, cursorPos)
    }
    
    // If we're in a command argument, don't try to find expressions outside it
    // This is crucial for handling empty arguments
    if (this.isInsideCommandArgument(context.context) && context.token) {
      const argToken = context.token
      
      // Check if we're in an empty argument
      if (argToken.start === argToken.end && cursorPos === argToken.start) {
        return null;
      }
      
      // Ensure we're really inside the argument, not at its boundaries
      if (cursorPos <= argToken.start || cursorPos > argToken.end) {
        return null;
      }
      
      // Check if there's whitespace immediately before the cursor
      let i = cursorPos - 1
      
      // If there's whitespace right before the cursor, don't grab any expression
      if (i < argToken.start || /\s/.test(text[i])) {
        return null
      }
      
      // Check if there's a parenthesized expression before the cursor
      let parenCount = 0
      let foundClosingParen = false
      
      // If we find a closing parenthesis, look for the matching opening one
      if (i >= argToken.start && text[i] === ")") {
        foundClosingParen = true
        parenCount = 1
        i--
        
        while (i >= argToken.start && parenCount > 0) {
          if (text[i] === ")") parenCount++
          else if (text[i] === "(") parenCount--
          i--
        }
        
        // If we found a matching opening parenthesis
        if (parenCount === 0) {
          const startPos = i + 1 // Position of the opening parenthesis
          const expr = text.substring(startPos, cursorPos)
          return { expr, startPos }
        }
      }
      
      // If no parenthesized expression, look for continuous text (no spaces)
      if (!foundClosingParen) {
        i = cursorPos - 1
        const endPos = i + 1
        
        // Find the start of the continuous text (stopping at whitespace)
        while (i >= argToken.start && !/\s/.test(text[i])) {
          i--
        }
        
        const startPos = i + 1
        
        if (startPos < endPos && startPos >= argToken.start) {
          const expr = text.substring(startPos, endPos)
          
          // Only return if the expression isn't empty
          if (expr.trim().length > 0) {
            return { expr, startPos }
          }
        }
      }
      
      return null
    } else {
      // Regular text, not in a command argument
      
      // Check if there's whitespace immediately before the cursor
      let i = cursorPos - 1
      
      // If there's whitespace right before the cursor, don't grab any expression
      if (i < 0 || /\s/.test(text[i])) {
        return null
      }
      
      // Check if there's a parenthesized expression before the cursor
      let parenCount = 0
      let foundClosingParen = false
      
      // If we find a closing parenthesis, look for the matching opening one
      if (i >= 0 && text[i] === ")") {
        foundClosingParen = true
        parenCount = 1
        i--
        
        while (i >= 0 && parenCount > 0) {
          if (text[i] === ")") parenCount++
          else if (text[i] === "(") parenCount--
          i--
        }
        
        // If we found a matching opening parenthesis
        if (parenCount === 0) {
          const startPos = i + 1 // Position of the opening parenthesis
          const expr = text.substring(startPos, cursorPos)
          return { expr, startPos }
        }
      }
      
      // If no parenthesized expression, look for continuous text (no spaces)
      if (!foundClosingParen) {
        i = cursorPos - 1
        const endPos = i + 1
        
        // Find the start of the continuous text (stopping at whitespace)
        while (i >= 0 && !/\s/.test(text[i])) {
          i--
        }
        
        const startPos = i + 1
        
        if (startPos < endPos) {
          const expr = text.substring(startPos, endPos)
          
          // Only return if the expression isn't empty
          if (expr.trim().length > 0) {
            return { expr, startPos }
          }
        }
      }
      
      return null
    }
  }

  /**
   * Insert a fraction command at the current position
   * @param position Position to insert the fraction
   * @param options Additional options for insertion
   * @returns The new cursor position
   */
  insertFraction(position: number, options: CommandInsertionOptions = {}): number {
    const state = this.editor.getState()
    const text = state.content
    
    // Ensure we're at a valid cursor position
    if (!PS.isValidPosition(text, position)) {
      position = PS.nextValidPosition(text, position).index
    }
    
    // Get comprehensive position info
    const posInfo = PS.positionInfo(text, position)
    
    // Get full context for token information
    const fullContext = getCursorContext(text, position)
    
    // Extra safety for math mode - NEVER add math wrapping if in math mode or around delimiters
    if (posInfo.inMath || posInfo.isAfterOpeningMath || posInfo.isBeforeClosingMath) {
      // Force the insertion without wrapping
      const cursorPos = this.insertCommand("frac", position, [], {
        ...options,
        wrapWithMath: false, // Force no wrapping
      });
      this.editor.setCursor(cursorPos, cursorPos);
      return cursorPos;
    }
    
    // Check if we're inside a command argument
    const inCommandArgument = this.isInsideCommandArgument(posInfo.context)

    // Special case: check if there's a command immediately to the left of the cursor
    const commandToLeft = this.findCommandImmediatelyBeforeCursor(text, position)
    
    if (commandToLeft) {
      // We found a command immediately before the cursor, wrap it with fraction
      return this.wrapCommandWithFraction(commandToLeft, position, {
        ...options,
        wrapWithMath: posInfo.inMath ? false : options.wrapWithMath,
      })
    }
    
    // Default to first argument (numerator)
    let defaultCursorArgumentIndex = 0
    
    // Only look for text before cursor if we're not already in a command argument
    if (!inCommandArgument) {
      // Check if there's text before cursor that could be used as numerator
      const beforeText = this.findExpressionBeforeCursor(text, position, fullContext)
      
      // If we have text to wrap, position in second argument (denominator)
      if (beforeText && beforeText.expr.trim().length > 0) {
        defaultCursorArgumentIndex = 1
      }
    }
    
    // Only use our calculated default if user hasn't specified an index
    const cursorPos = this.insertCommandWithTextBeforeCursor("frac", position, {
      cursorArgumentIndex: options.cursorArgumentIndex !== undefined 
        ? options.cursorArgumentIndex 
        : defaultCursorArgumentIndex,
      wrapWithMath: true,
      ...options // Allow overriding other defaults
    })
    
    // Make extra sure the cursor is updated
    this.editor.setCursor(cursorPos, cursorPos)
    
    return cursorPos
  }
  
  /**
   * Find a command immediately before the cursor position
   * @param text The full text
   * @param position The cursor position
   * @returns Command info or null if no command found
   */
  private findCommandImmediatelyBeforeCursor(
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
  
  /**
   * Wrap an existing command with a fraction
   * @param commandInfo Information about the command to wrap
   * @param position Current cursor position
   * @param options Additional options
   * @returns The new cursor position
   */
  private wrapCommandWithFraction(
    commandInfo: { command: string; startPos: number; endPos: number },
    position: number,
    options: CommandInsertionOptions = {}
  ): number {
    const state = this.editor.getState()
    const text = state.content
    
    // Get position info at the start of the command
    const posInfo = PS.positionInfo(text, commandInfo.startPos)
    
    // Build the new fraction string
    const prefix = posInfo.inMath ? "" : "$"
    const suffix = posInfo.inMath ? "" : "$"
    
    // Create the new content with the command as the numerator
    const newContent = 
      text.substring(0, commandInfo.startPos) + 
      prefix + "\\frac{" + commandInfo.command + "}{}" + suffix + 
      text.substring(commandInfo.endPos)
    
    // Calculate cursor position in the denominator
    const cursorPosition = 
      commandInfo.startPos + 
      prefix.length + 
      "\\frac{".length + 
      commandInfo.command.length + 
      "}{".length
    
    // Update the editor content
    this.editor.setContent(newContent, cursorPosition, cursorPosition)
    
    // Make extra sure the cursor is updated
    this.editor.setCursor(cursorPosition, cursorPosition)
    
    return cursorPosition
  }
  
  /**
   * Insert a square root command at the current position
   * @param position Position to insert the sqrt
   * @returns The new cursor position
   */
  insertSqrt(position: number): number {
    return this.insertCommandWithTextBeforeCursor("sqrt", position, {
      positionInFirstArg: true, // Position cursor inside the sqrt
      wrapWithMath: true
    })
  }
  
  /**
   * Insert a subscript at the current position
   * @param position Position to insert the subscript
   * @returns The new cursor position
   */
  insertSubscript(position: number): number {
    const state = this.editor.getState()
    const text = state.content
    const posInfo = PS.positionInfo(text, position)
    
    // Find text before cursor that could be used as base
    const beforeText = this.findExpressionBeforeCursor(text, position)
    
    // Determine if we need math mode wrapping
    const needsMathWrap = !posInfo.inMath
    const prefix = needsMathWrap ? "$" : ""
    const suffix = needsMathWrap ? "$" : ""
    
    let newContent: string
    let cursorPosition: number
    
    if (beforeText) {
      // We have text to use as the base
      newContent = text.substring(0, beforeText.startPos) + 
                  prefix + beforeText.expr + "_{}" + suffix + 
                  text.substring(position)
      
      // Position cursor in the subscript
      cursorPosition = beforeText.startPos + prefix.length + beforeText.expr.length + 2
    } else {
      // No text before cursor to use
      newContent = text.substring(0, position) + 
                  prefix + "_{}" + suffix + 
                  text.substring(position)
      
      // Position cursor in the subscript
      cursorPosition = position + prefix.length + 2
    }
    
    // Update content in editor
    this.editor.setContent(newContent, cursorPosition, cursorPosition)
    return cursorPosition
  }
  
  /**
   * Insert a superscript at the current position
   * @param position Position to insert the superscript
   * @returns The new cursor position
   */
  insertSuperscript(position: number): number {
    const state = this.editor.getState()
    const text = state.content
    const posInfo = PS.positionInfo(text, position)
    
    // Find text before cursor that could be used as base
    const beforeText = this.findExpressionBeforeCursor(text, position)
    
    // Determine if we need math mode wrapping
    const needsMathWrap = !posInfo.inMath
    const prefix = needsMathWrap ? "$" : ""
    const suffix = needsMathWrap ? "$" : ""
    
    let newContent: string
    let cursorPosition: number
    
    if (beforeText) {
      // We have text to use as the base
      newContent = text.substring(0, beforeText.startPos) + 
                  prefix + beforeText.expr + "^{}" + suffix + 
                  text.substring(position)
      
      // Position cursor in the superscript
      cursorPosition = beforeText.startPos + prefix.length + beforeText.expr.length + 2
    } else {
      // No text before cursor to use
      newContent = text.substring(0, position) + 
                  prefix + "^{}" + suffix + 
                  text.substring(position)
      
      // Position cursor in the superscript
      cursorPosition = position + prefix.length + 2
    }
    
    // Update content in editor
    this.editor.setContent(newContent, cursorPosition, cursorPosition)
    return cursorPosition
  }
  
  /**
   * Insert a matrix command
   * @param position Position to insert the matrix
   * @param rows Number of rows
   * @param cols Number of columns
   * @returns The new cursor position
   */
  insertMatrix(position: number, rows: number = 2, cols: number = 2): number {
    const state = this.editor.getState()
    const text = state.content
    const posInfo = PS.positionInfo(text, position)
    
    // Build matrix content
    let matrixContent = "\\begin{pmatrix}\n"
    for (let i = 0; i < rows; i++) {
      const cells = Array(cols).fill(" ")
      matrixContent += cells.join(" & ")
      if (i < rows - 1) {
        matrixContent += " \\\\\n"
      }
    }
    matrixContent += "\n\\end{pmatrix}"
    
    // Determine if we need math mode wrapping
    const needsMathWrap = !posInfo.inMath
    const prefix = needsMathWrap ? "$" : ""
    const suffix = needsMathWrap ? "$" : ""
    
    // Create new content
    let newContent: string
    
    // Get the full context
    const fullContext = getCursorContext(text, position)
    
    // Handle different insertion contexts
    if (this.isInsideCommandArgument(posInfo.context) && fullContext.token) {
      // We're inside a command argument, insert only within this argument
      const argToken = fullContext.token
      const beforeArg = text.substring(0, argToken.start)
      const afterArg = text.substring(argToken.end)
      const argContent = text.substring(argToken.start, position) + matrixContent + text.substring(position, argToken.end)
      
      newContent = beforeArg + argContent + afterArg
    } else {
      // Regular insertion at cursor position
      newContent = text.substring(0, position) + prefix + matrixContent + suffix + text.substring(position)
    }
    
    // Position cursor after the first \begin{pmatrix} and newline
    const cursorOffset = (this.isInsideCommandArgument(posInfo.context) ? 0 : prefix.length) + matrixContent.indexOf("\n") + 1
    const cursorPosition = position + cursorOffset
    
    // Update content in editor
    this.editor.setContent(newContent, cursorPosition, cursorPosition)
    return cursorPosition
  }

  /**
   * Insert a color command
   * @param position Position to insert the color command
   * @param options Options for insertion
   * @returns The new cursor position
   */
  insertColor(position: number, options: CommandInsertionOptions = {}): number {
    // Create color command with RGB arguments \color{r}{g}{b}{text}
    const colorArgs = ['255', '0', '0', ''] // Default to red with empty text
    
    return this.insertCommand("color", position, colorArgs, {
      cursorArgumentIndex: 3, // Position in text argument by default
      wrapWithMath: true,
      ...options // Allow overriding defaults
    })
  }
} 