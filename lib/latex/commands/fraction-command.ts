import { LatexEditor } from "../latex-editor";
import { Command, CommandOptions, EditorShortcutContext, ShortcutConfig, CommandPattern } from "./command-types";
import { buildCommandString, getInsertionContext, insertAtPosition, insertIntoCommandArgument, isInsideCommandArgument } from "./command-utils";
import { findExpressionBeforeCursor, getCursorContext, getArgumentScope } from "../latex-parser";
import * as PS from "../positioning-system";

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
    let contentWrapped = false;
    let isWrappingMathContent = false;
    
    // Extended structure to store the text to wrap and its position
    let textToWrap = {
      text: "",
      startIndex: position,
      endIndex: position
    };

    // Get insertion context at current position
    const { posInfo, contextInfo } = getInsertionContext(text, position);
    
    // Check if user is inside a command argument and extract relevant text
    if (isInsideCommandArgument(posInfo.context)) {
      // Use the new getArgumentScope function to get precise argument boundaries
      const argScope = getArgumentScope(text, position);
      
      if (argScope) {
        // Extract only the text from the current argument scope UP TO the cursor position
        const textLeftOfCursor = text.substring(argScope.start, position);
        
        // Get the last space-delimited word with its position
        textToWrap = this.getLastWordWithPosition(textLeftOfCursor, argScope.start);
        
        console.log('User is inside command argument. Last word (left of cursor):', textToWrap.text);
      } else {
        // Fallback to the previous approach if getArgumentScope returns null
        const cursorContext = getCursorContext(text, position);
        
        if (cursorContext.token && cursorContext.token.start !== undefined && cursorContext.token.end !== undefined) {
          // Only get text up to the cursor position
          const textLeftOfCursor = text.substring(cursorContext.token.start, position);
          
          // Get the last space-delimited word with its position
          textToWrap = this.getLastWordWithPosition(textLeftOfCursor, cursorContext.token.start);
          
          //   console.log('User is inside command argument (fallback). Last word (left of cursor):', textToWrap);
        }
      }
    } else {
      // User is not inside an argument, get only the text to the left of cursor
      const textLeftOfCursor = text.substring(0, position);
      
      // Get the last space-delimited word with its position
      textToWrap = this.getLastWordWithPosition(textLeftOfCursor, 0);
      
      //   console.log('User is not inside command argument. Last word (left of cursor):', textToWrap);
    }
    
    console.log('Text to wrap:', textToWrap.text, 'Start:', textToWrap.startIndex, 'End:', textToWrap.endIndex);
    
    // Check if we're wrapping text that already has math delimiters
    const mathPattern = /^\$(.*)\$$/;
    const mathMatch = textToWrap.text.match(mathPattern);
    
    if (mathMatch) {
      isWrappingMathContent = true;
      // Extract the content between $ delimiters
      textToWrap.text = mathMatch[1];
      console.log('Extracted math content:', textToWrap.text);
    }
    
    // If we have text to wrap, use it as the first argument
    if (textToWrap.text.trim() !== "") {
      contentWrapped = true;
      
      // If there are no args provided yet, initialize with the text to wrap
      if (args.length === 0) {
        args = [textToWrap.text, ""];
      } else if (args.length === 1) {
        // If only one arg, assume it's the numerator and overwrite it
        args[0] = textToWrap.text;
        // Add an empty denominator if needed
        args.push("");
      } else {
        // Multiple args already exist, update the first one
        args[0] = textToWrap.text;
      }
      
      // Update position to be the start of the text to wrap
      // The insertion will occur here, and we'll delete the original text
      position = textToWrap.startIndex;
    }
    
    // Always force cursor to second argument (denominator) when wrapping math content
    if (isWrappingMathContent || contentWrapped) {
      options.cursorArgumentIndex = 1; // Position in second argument (denominator)
    } else if (options.cursorArgumentIndex === undefined) {
      // Default: no content to wrap, position in first argument (numerator)
      options.cursorArgumentIndex = 0;
    }
    
    // Build command string using args
    const commandStr = buildCommandString("frac", args);
    
    // Check if the cursor is immediately before a math opening delimiter
    const isBeforeOpeningMath = position < text.length && text[position] === '$';
    
    // Special handling for determining math wrapping
    let requiresMathWrap = false;
    
    if (isWrappingMathContent) {
      // If we're wrapping existing math content, we don't need to add extra math delimiters
      // Because we're already replacing content that was inside $ $
      requiresMathWrap = false;
    } else {
      // Standard determination for requiring math wrap
      requiresMathWrap = (!posInfo.inMath && 
                           !posInfo.isAfterOpeningMath && 
                           !posInfo.isBeforeClosingMath &&
                           !isBeforeOpeningMath &&
                           options.wrapWithMath !== false) || 
                         options.wrapWithMath === true;
    }
    
    // If we have text to wrap, we need to remove it from the content first
    let modifiedText = text;
    if (contentWrapped) {
      // Remove the text to wrap by replacing that segment with empty string
      modifiedText = text.substring(0, textToWrap.startIndex) + text.substring(textToWrap.endIndex);
    }
    
    // For wrapping math content, we need special handling to ensure proper math environment
    let insertionResult;
    if (isWrappingMathContent) {
      // The content was originally within $ $, so we insert our fraction within those
      // We handle this specially to avoid nested math environments
      
      // Create our insertion with the $ signs managed properly
      const beforeContent = modifiedText.substring(0, position);
      const afterContent = modifiedText.substring(position);
      
      // Insert with proper math environment formatting
      const newContent = beforeContent + "$" + commandStr + "$" + afterContent;
      
      insertionResult = {
        newContent: newContent,
        basePosition: position + 1 // +1 for the opening $
      };
    } else {
      // Standard insertion for normal text
      insertionResult = this.handleInsertion(
        modifiedText, 
        position, 
        commandStr, 
        requiresMathWrap, 
        options, 
        posInfo, 
        contextInfo, 
        isBeforeOpeningMath
      );
    }
    
    // Calculate cursor position - with special handling for math content
    let newCursorPos;
    
    if (isWrappingMathContent) {
      // For math content, manually find the position of the second argument
      // Start with the base position (after the "$" and "\frac{")
      const basePos = insertionResult.basePosition; // This is after the opening $
      
      // Find the position of the second argument
      const closingBraceOfFirstArg = this.findNthClosingBrace(insertionResult.newContent, basePos, 1);
      
      if (closingBraceOfFirstArg !== -1) {
        // Position should be right after the closing brace of first arg and opening brace of second arg
        // So +2 for "}{" (close first arg, open second arg)
        newCursorPos = closingBraceOfFirstArg + 2;
      } else {
        // Fallback to standard positioning if we can't find the precise position
        newCursorPos = this.calculateCursorPosition(
          insertionResult.newContent,
          insertionResult.basePosition,
          commandStr,
          options
        );
      }
    } else {
      // Standard cursor positioning for normal content
      newCursorPos = this.calculateCursorPosition(
        insertionResult.newContent,
        insertionResult.basePosition,
        commandStr,
        options
      );
    }
    
    // Update content in editor
    editor.setContent(insertionResult.newContent, newCursorPos, newCursorPos);
    return newCursorPos;
  }

  /**
   * Find the position of the nth closing brace from a starting position
   * Used to locate argument boundaries in LaTeX commands
   */
  private findNthClosingBrace(text: string, startPos: number, n: number): number {
    let count = 0;
    let braceLevel = 0;
    let pos = startPos;
    
    // Scan forward looking for the nth top-level closing brace
    while (pos < text.length) {
      if (text[pos] === '{') {
        braceLevel++;
      } else if (text[pos] === '}') {
        braceLevel--;
        // If we're back at the top level, count this closing brace
        if (braceLevel === 0) {
          count++;
          // If this is the nth one, return its position
          if (count === n) {
            return pos;
          }
        }
      }
      pos++;
    }
    
    return -1; // Not found
  }

  /**
   * Extracts the last space-delimited word from a string along with its position
   */
  private getLastWordWithPosition(
    text: string, 
    baseOffset: number
  ): { text: string; startIndex: number; endIndex: number } {
    if (!text) {
      return { text: "", startIndex: baseOffset, endIndex: baseOffset };
    }
    
    // Find the last space in the text
    const lastSpaceIndex = text.lastIndexOf(" ");
    
    // If no space found or space is the last character, handle accordingly
    if (lastSpaceIndex === -1) {
      // No spaces, the whole text is the word
      return { 
        text: text, 
        startIndex: baseOffset, 
        endIndex: baseOffset + text.length 
      };
    } else if (lastSpaceIndex === text.length - 1) {
      // Space is the last character, get the previous word
      const trimmedText = text.trimEnd();
      return this.getLastWordWithPosition(trimmedText, baseOffset);
    } else {
      // Return everything after the last space
      const word = text.substring(lastSpaceIndex + 1);
      return { 
        text: word, 
        startIndex: baseOffset + lastSpaceIndex + 1, 
        endIndex: baseOffset + text.length 
      };
    }
  }

  /**
   * Extracts the last space-delimited word from a string
   */
  private getLastWord(text: string): string {
    if (!text) return "";
    
    // Find the last space in the text
    const lastSpaceIndex = text.lastIndexOf(" ");
    
    // If no space found or space is the last character, handle accordingly
    if (lastSpaceIndex === -1) {
      // No spaces, the whole text is the word
      return text;
    } else if (lastSpaceIndex === text.length - 1) {
      // Space is the last character, get the previous word
      const trimmedText = text.trimEnd();
      return this.getLastWord(trimmedText);
    } else {
      // Return everything after the last space
      return text.substring(lastSpaceIndex + 1);
    }
  }

  /**
   * Handle insertion of the fraction command based on context
   */
  private handleInsertion(
    text: string,
    position: number,
    commandStr: string,
    requiresMathWrap: boolean,
    options: CommandOptions,
    posInfo: any,
    contextInfo: any,
    isBeforeOpeningMath: boolean
  ): { newContent: string, basePosition: number } {
    // Case 1: Cursor is right before math opening delimiter
    if (isBeforeOpeningMath) {
      return this.insertBeforeMathDelimiter(text, position, commandStr, options);
    }
    
    // Case 2: Inside a command argument
    if (isInsideCommandArgument(posInfo.context)) {
      const result = insertIntoCommandArgument(
        text, position, commandStr, contextInfo, requiresMathWrap, options
      );
      
      return {
        newContent: result.newText,
        basePosition: position + (requiresMathWrap ? 1 : 0)
      };
    }
    
    // Case 3: Standard insertion
    const result = insertAtPosition(
      text, position, commandStr, requiresMathWrap, options
    );
    
    return {
      newContent: result.newText,
      basePosition: position + (requiresMathWrap ? 1 : 0)
    };
  }

  /**
   * Handle insertion when cursor is before math delimiter
   */
  private insertBeforeMathDelimiter(
    text: string,
    position: number,
    commandStr: string,
    options: CommandOptions
  ): { newContent: string, basePosition: number } {
    const beforeContent = text.substring(0, position);
    const afterContent = text.substring(position);
      
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
        
      const newContent = beforeMath + mathBeforeFraction + commandStr + mathAfterFraction + afterMath;
        
      return {
        newContent,
        basePosition: beforeMath.length + mathBeforeFraction.length
        };
    }
    
        // No closing math delimiter found, fall back to normal insertion
        const result = insertAtPosition(
      text, position, commandStr, false, options
    );
    
    return {
      newContent: result.newText,
      basePosition: position
    };
  }
  
  /**
   * Calculate cursor position for a command using the positioning system
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