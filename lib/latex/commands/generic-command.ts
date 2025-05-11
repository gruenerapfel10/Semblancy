import { LatexEditor } from "../latex-editor";
import { Command, CommandOptions } from "./command-types";
import { getInsertionContext, insertAtPosition, insertIntoCommandArgument } from "./command-utils";

/**
 * Default command implementation for any unknown LaTeX commands
 * Handles generic LaTeX commands following the format: \command{arg1}{arg2}...
 */
export class GenericCommand implements Command {
  execute(
    editor: LatexEditor,
    position: number,
    args: string[] = [],
    options: CommandOptions = {}
  ): number {
    const state = editor.getState();
    const text = state.content;
    
    // The command name is passed as the first argument
    const commandName = args[0] || "cmd";
    const commandArgs = args.slice(1);
    
    // Build command string
    let commandStr = `\\${commandName}`;
    
    // Add provided arguments
    commandArgs.forEach(arg => {
      commandStr += `{${arg}}`;
    });
    
    // Add empty arguments if none or only one provided
    if (commandArgs.length === 0) {
      commandStr += "{}{}";
    } else if (commandArgs.length === 1) {
      commandStr += "{}";
    }
    
    // Get insertion context
    const { posInfo, contextInfo } = getInsertionContext(text, position);
    
    // Determine if we need to wrap with math
    const requiresMathWrap = !posInfo.inMath && 
                          !posInfo.isAfterOpeningMath && 
                          !posInfo.isBeforeClosingMath && 
                          options.wrapWithMath !== false;
    
    // Insert command based on context
    let newContent: string;
    let cursorPosition: number;
    
    if (posInfo.context === "command-args" || posInfo.context === "command-optional") {
      // We're inside a command argument - insert within this argument
      const { newText, newCursorPos } = insertIntoCommandArgument(
        text, position, commandStr, contextInfo, requiresMathWrap, options
      );
      newContent = newText;
      cursorPosition = newCursorPos;
    } else {
      // Regular insertion at cursor position
      const { newText, newCursorPos } = insertAtPosition(
        text, position, commandStr, requiresMathWrap, options
      );
      newContent = newText;
      cursorPosition = newCursorPos;
    }
    
    // Update content in editor
    editor.setContent(newContent, cursorPosition, cursorPosition);
    return cursorPosition;
  }
} 