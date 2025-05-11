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
      // Only trigger if not inside existing command arguments
      return true;
    }
    // No getArgs needed, execute will handle it if isShortcutInvocation is true and args are empty
    // No cursorArgumentIndex set here - we'll determine that in the execute method
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
    
    // Determine if we need to wrap with math
    const requiresMathWrap = (!posInfo.inMath && 
                           !posInfo.isAfterOpeningMath && 
                           !posInfo.isBeforeClosingMath &&
                           options.wrapWithMath !== false) || 
                           options.wrapWithMath === true; // Default to true if not in math or explicitly forced
    
    // Insert command based on context
    let newContent: string;
    let newCursorPos: number;
    
    // If we have text to replace, handle it directly
    if (textToReplace && replacementLength > 0) {
      const beforeContent = text.substring(0, currentPosition);
      const afterContent = text.substring(currentPosition + replacementLength);
      
      const prefix = requiresMathWrap ? "$" : "";
      const suffix = requiresMathWrap ? "$" : "";
      
      newContent = beforeContent + prefix + commandStr + suffix + afterContent;
      
      // Find the position for the target argument
      const targetArgIndex = options.cursorArgumentIndex ?? 0; // Default to numerator if not set
      let openBraceCount = 0;
      let argOpenPositions = [];
      
      for (let i = 0; i < commandStr.length; i++) {
        if (commandStr[i] === '{') {
          openBraceCount++;
          if (openBraceCount === 1) {
            argOpenPositions.push(i + 1); // Position inside brace
          }
        } else if (commandStr[i] === '}') {
          openBraceCount--;
        }
      }
      
      // Set cursor position based on the target argument
      const targetPos = targetArgIndex < argOpenPositions.length 
        ? argOpenPositions[targetArgIndex] 
        : (argOpenPositions.length > 0 ? argOpenPositions[argOpenPositions.length - 1] : commandStr.length);
      
      newCursorPos = beforeContent.length + prefix.length + targetPos;
    } else {
      // Re-evaluate context at potentially modified currentPosition for insertion
      const finalInsertionContext = getInsertionContext(text, currentPosition);

      if (isInsideCommandArgument(finalInsertionContext.posInfo.context)) {
        const result = insertIntoCommandArgument(
          text, currentPosition, commandStr, finalInsertionContext.contextInfo, requiresMathWrap, options
        );
        newContent = result.newText;
        newCursorPos = result.newCursorPos;
      } else {
        const result = insertAtPosition(
          text, currentPosition, commandStr, requiresMathWrap, options
        );
        newContent = result.newText;
        newCursorPos = result.newCursorPos;
      }
    }
    
    // Update content in editor
    editor.setContent(newContent, newCursorPos, newCursorPos);
    return newCursorPos;
  }
} 