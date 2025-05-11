import { LatexEditor } from "../latex-editor";
import { Command, CommandOptions, EditorShortcutContext, ShortcutConfig, CommandPattern } from "./command-types";
import { buildCommandString, getInsertionContext, insertAtPosition, insertIntoCommandArgument, isInsideCommandArgument } from "./command-utils";
import { findExpressionBeforeCursor } from "../latex-parser";
import * as PS from "../positioning-system"; // For PS.positionInfo in shortcut condition

/**
 * Command implementation for LaTeX fraction (\frac)
 */
export class FractionCommand implements Command {
  // Define how this command is recognized in LaTeX text
  pattern: CommandPattern = {
    identifier: 'frac',
    patternType: 'backslash',
    commandClass: 'first'
  };
  
  shortcut: ShortcutConfig = {
    key: "/",
    condition: (context: EditorShortcutContext) => {
      return true;
    }
  };

  execute(
    editor: LatexEditor,
    position: number,
    args: string[] = [],
    options: CommandOptions = {}
  ): number {
    const state = editor.getState();
    const text = state.content;
    let currentArgs = [...args];
    let currentPosition = position;
    let textToReplace = "";
    let replacementLength = 0;
    let contentWrapped = false;

    // Get insertion context
    // Note: If called by shortcut, position is selectionStart from KeyHandler
    const { posInfo, contextInfo } = getInsertionContext(text, currentPosition);

    // If triggered by a shortcut and no explicit arguments were passed by the shortcut config,
    // try to find text before the cursor to use as the numerator.
    if (options.isShortcutInvocation && currentArgs.length === 0) {
      const expressionInfo = findExpressionBeforeCursor(text, currentPosition, contextInfo);
      if (expressionInfo) {
        // Content found to wrap - we'll set cursor to the denominator later
        contentWrapped = true;
        
        // Check if we're wrapping a command that already has math delimiters
        let expr = expressionInfo.expr;
        let hadMathDelimiters = false;
        
        if (expr.startsWith('$') && expr.endsWith('$')) {
          // Remove outer math delimiters
          expr = expr.slice(1, -1);
          hadMathDelimiters = true;
        }
        
        currentArgs = [expr];
        textToReplace = expressionInfo.expr;
        replacementLength = currentPosition - expressionInfo.startPos;
        currentPosition = expressionInfo.startPos; // Insert fraction at the start of the expression
        
        // Force math wrapping if the expression had math delimiters
        if (hadMathDelimiters) {
          options.wrapWithMath = true;
        }
      }
    }
    
    // Set cursor position based on whether content was wrapped
    // Only override if not explicitly set in options
    if (options.cursorArgumentIndex === undefined) {
      // If we wrapped content, position in denominator (second arg)
      // If no content wrapped, position in numerator (first arg)
      options.cursorArgumentIndex = contentWrapped ? 1 : 0;
    }
    
    // Build command string using currentArgs (which might have been populated by shortcut logic)
    const commandStr = buildCommandString("frac", currentArgs);
    
    // Check if the cursor is immediately before a math opening delimiter
    const isBeforeOpeningMath = currentPosition < text.length && text[currentPosition] === '$';
    
    // Determine if we need to wrap with math
    const requiresMathWrap = (!posInfo.inMath && 
                           !posInfo.isAfterOpeningMath && 
                           !posInfo.isBeforeClosingMath &&
                           !isBeforeOpeningMath &&
                           options.wrapWithMath !== false) || 
                           options.wrapWithMath === true; // Default to true if not in math or explicitly forced
    
    // STEP 1: Determine the insertion strategy and generate the new content
    let newContent: string;
    let insertionInfo: {
      basePosition: number;
      commandStart: number;
      commandString: string;
      needsExplicitCursorCalculation: boolean;
    };
    
    // If cursor is right before math opening delimiter, insert inside the math environment
    if (isBeforeOpeningMath) {
      const beforeContent = text.substring(0, currentPosition);
      const afterContent = text.substring(currentPosition); // Include the $ and everything after
      
      // Move past the $ character
      const mathContent = afterContent.substring(1);
      // Find the closing $ if it exists
      const closingMathIdx = mathContent.indexOf('$');
      
      if (closingMathIdx !== -1) {
        // Insert fraction inside math environment
        const beforeMath = beforeContent + '$';
        const mathBeforeFraction = mathContent.substring(0, 0); // Nothing before fraction
        const mathAfterFraction = mathContent.substring(0, closingMathIdx);
        const afterMath = mathContent.substring(closingMathIdx);
        
        newContent = beforeMath + mathBeforeFraction + commandStr + mathAfterFraction + afterMath;
        
        insertionInfo = {
          basePosition: beforeMath.length + mathBeforeFraction.length,
          commandStart: 0,
          commandString: commandStr,
          needsExplicitCursorCalculation: true
        };
      } else {
        // No closing math delimiter found, fall back to normal insertion
        const result = insertAtPosition(
          text, currentPosition, commandStr, requiresMathWrap, options
        );
        newContent = result.newText;
        
        insertionInfo = {
          basePosition: currentPosition + (requiresMathWrap ? 1 : 0),
          commandStart: 0,
          commandString: commandStr,
          needsExplicitCursorCalculation: false
        };
      }
    }
    // If we have text to replace, handle it directly
    else if (textToReplace && replacementLength > 0) {
      const beforeContent = text.substring(0, currentPosition);
      const afterContent = text.substring(currentPosition + replacementLength);
      
      const prefix = requiresMathWrap ? "$" : "";
      const suffix = requiresMathWrap ? "$" : "";
      
      newContent = beforeContent + prefix + commandStr + suffix + afterContent;
      
      insertionInfo = {
        basePosition: beforeContent.length + prefix.length,
        commandStart: 0,
        commandString: commandStr,
        needsExplicitCursorCalculation: true
      };
    } else {
      // Re-evaluate context at potentially modified currentPosition for insertion
      const finalInsertionContext = getInsertionContext(text, currentPosition);

      if (isInsideCommandArgument(finalInsertionContext.posInfo.context)) {
        const result = insertIntoCommandArgument(
          text, currentPosition, commandStr, finalInsertionContext.contextInfo, requiresMathWrap, options
        );
        newContent = result.newText;
        
        insertionInfo = {
          basePosition: currentPosition + (requiresMathWrap ? 1 : 0),
          commandStart: 0,
          commandString: commandStr,
          needsExplicitCursorCalculation: false
        };
      } else {
        const result = insertAtPosition(
          text, currentPosition, commandStr, requiresMathWrap, options
        );
        newContent = result.newText;
        
        insertionInfo = {
          basePosition: currentPosition + (requiresMathWrap ? 1 : 0),
          commandStart: 0,
          commandString: commandStr,
          needsExplicitCursorCalculation: false
        };
      }
    }
    
    // STEP 2: Calculate the cursor position using a centralized approach
    let newCursorPos: number;
    
    if (insertionInfo.needsExplicitCursorCalculation) {
      newCursorPos = this.calculateCursorPosition(
        newContent,
        insertionInfo.basePosition,
        insertionInfo.commandString,
        options
      );
    } else {
      // Using the default cursor position from the insertion utility
      const targetArgIndex = options.cursorArgumentIndex ?? 0;
      newCursorPos = this.calculateCursorPosition(
        newContent,
        insertionInfo.basePosition,
        insertionInfo.commandString,
        { cursorArgumentIndex: targetArgIndex }
      );
    }
    
    // Update content in editor
    editor.setContent(newContent, newCursorPos, newCursorPos);
    return newCursorPos;
  }
  
  /**
   * Centralized method to calculate cursor position for a command
   * using the positioning system
   */
  private calculateCursorPosition(
    newContent: string,
    basePosition: number,
    commandStr: string,
    options: CommandOptions = {}
  ): number {
    // Extract command structure from the newContent
    const commandStartPos = basePosition;
    const commandEndPos = basePosition + commandStr.length;
    
    // Get tab stops within the command
    const tabStops = PS.getTabStops(newContent);
    
    // Filter tab stops to only include argument boundaries within our command
    const argPositions = tabStops.argumentBoundaries.filter(pos => 
      pos > commandStartPos && pos < commandEndPos
    );
    
    // If no argument positions found, return the end of the command
    if (argPositions.length === 0) {
      return commandEndPos;
    }
    
    // Sort argument positions
    argPositions.sort((a, b) => a - b);
    
    // Determine target argument index
    let targetIndex: number;
    
    if (options.cursorArgumentIndex !== undefined) {
      // Use specified argument index
      if (options.cursorArgumentIndex < 0) {
        // Negative index means counting from the end (-1 is last arg)
        targetIndex = Math.floor(argPositions.length / 2) + options.cursorArgumentIndex;
      } else {
        // Each argument has at least 2 boundaries (start and end)
        // So to get the position inside the first argument, we need index 0
        targetIndex = options.cursorArgumentIndex * 2;
      }
      
      // Clamp to valid range
      targetIndex = Math.max(0, Math.min(argPositions.length - 1, targetIndex));
    } else {
      // Default behavior: position in first argument (position 0)
      targetIndex = 0;
    }
    
    // Get the position
    const targetPos = argPositions[targetIndex];
    
    // Ensure it's a valid position, if not find the nearest valid one
    if (!PS.isValidPosition(newContent, targetPos)) {
      const validPosition = PS.nextValidPosition(newContent, targetPos - 1);
      return validPosition.index;
    }
    
    return targetPos;
  }
} 