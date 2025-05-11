import { LatexEditor } from "../latex-editor";
import { Command, CommandOptions, EditorShortcutContext, ShortcutConfig, CommandPattern } from "./command-types";
import { getInsertionContext, insertAtPosition, insertIntoCommandArgument, isInsideCommandArgument } from "./command-utils";
import { findExpressionBeforeCursor } from "../latex-parser";
import * as PS from "../positioning-system";

/**
 * Command implementation for LaTeX square root (\sqrt)
 */
export class SqrtCommand implements Command {
  // Define how this command is recognized in LaTeX text
  pattern: CommandPattern = {
    identifier: 'sqrt',
    patternType: 'backslash',
    commandClass: 'first'
  };
  
  shortcut: ShortcutConfig = {
    key: "r",
    ctrlKey: true,
    condition: (context: EditorShortcutContext) => {
      return true;
    }
  };
  
  execute(
    editor: LatexEditor,
    position: number,
    args: string[] = [], // args[0] = content, args[1] = root index (optional)
    options: CommandOptions = {}
  ): number {
    const state = editor.getState();
    const text = state.content;
    let currentArgs = [...args];
    let currentPosition = position;
    
    // Get insertion context
    const { posInfo, contextInfo } = getInsertionContext(text, currentPosition);
    
    // If triggered by shortcut with no args, try to find expression before cursor
    if (options.isShortcutInvocation && currentArgs.length === 0) {
      const expressionInfo = findExpressionBeforeCursor(text, currentPosition, contextInfo);
      if (expressionInfo) {
        currentArgs = [expressionInfo.expr];
        currentPosition = expressionInfo.startPos;
      }
    }
    
    // Build command string (with optional root index if provided)
    let commandStr = "\\sqrt{";
    if (currentArgs.length > 0) {
      commandStr += currentArgs[0] || "";
    }
    commandStr += "}";
    
    // Handle optional root index
    if (currentArgs.length > 1) {
      commandStr = commandStr.replace("\\sqrt{", `\\sqrt[${currentArgs[1]}]{`);
    }
    
    const defaultWrapMath = options.wrapWithMath === undefined ? true : options.wrapWithMath;
    const requiresMathWrap = !posInfo.inMath && 
                           !posInfo.isAfterOpeningMath && 
                           !posInfo.isBeforeClosingMath &&
                           defaultWrapMath;
    
    let newContent: string;
    let newCursorPos: number;
    
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
    
    editor.setContent(newContent, newCursorPos, newCursorPos);
    
    // Smart cursor positioning for empty sqrt from shortcut
    if (options.isShortcutInvocation && (currentArgs[0] === undefined || currentArgs[0] === "") && options.cursorArgumentIndex === undefined) {
      const bracePos = newContent.lastIndexOf("{}", newCursorPos) + 1;
      if (bracePos > 0 && bracePos <= newCursorPos) { 
        editor.setCursor(bracePos, bracePos);
        return bracePos;
      }
    }
    return newCursorPos;
  }
} 