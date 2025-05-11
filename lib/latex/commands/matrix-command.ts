import { LatexEditor } from "../latex-editor";
import { Command, CommandOptions, TokenContext } from "./command-types";
import { getInsertionContext, insertAtPosition, insertIntoCommandArgument } from "./command-utils";

/**
 * Command implementation for LaTeX matrix
 */
export class MatrixCommand implements Command {
  execute(
    editor: LatexEditor,
    position: number,
    args: string[] = [],
    options: CommandOptions = {}
  ): number {
    const state = editor.getState();
    const text = state.content;
    
    // Get insertion context
    const { posInfo, contextInfo } = getInsertionContext(text, position);
    
    // Parse matrix dimensions from args or use defaults
    const rows = args[0] ? parseInt(args[0], 10) : 2;
    const cols = args[1] ? parseInt(args[1], 10) : 2;
    
    // Build matrix content
    let matrixContent = "\\begin{pmatrix}\n";
    for (let i = 0; i < rows; i++) {
      const cells = Array(cols).fill(" ");
      matrixContent += cells.join(" & ");
      if (i < rows - 1) {
        matrixContent += " \\\\\n";
      }
    }
    matrixContent += "\n\\end{pmatrix}";
    
    // Determine if we need to wrap with math
    const requiresMathWrap = !posInfo.inMath && 
                          !posInfo.isAfterOpeningMath && 
                          !posInfo.isBeforeClosingMath;
    
    // Insert command based on context
    let newContent: string;
    let cursorPosition: number;
    
    if (posInfo.context === "command-args" || posInfo.context === "command-optional") {
      // We're inside a command argument - insert within this argument
      const { newText, newCursorPos } = insertIntoCommandArgument(
        text, position, matrixContent, contextInfo, requiresMathWrap, options
      );
      newContent = newText;
      cursorPosition = newCursorPos;
    } else {
      // Regular insertion at cursor position
      const { newText, newCursorPos } = insertAtPosition(
        text, position, matrixContent, requiresMathWrap, options
      );
      newContent = newText;
      cursorPosition = newCursorPos;
    }
    
    // Position cursor after the first \begin{pmatrix} and newline
    const offset = (posInfo.context === "command-args" || posInfo.context === "command-optional" ? 0 : 
                   (requiresMathWrap ? 1 : 0)) + 
                   matrixContent.indexOf("\n") + 1;
    cursorPosition = position + offset;
    
    // Update content in editor
    editor.setContent(newContent, cursorPosition, cursorPosition);
    return cursorPosition;
  }
} 