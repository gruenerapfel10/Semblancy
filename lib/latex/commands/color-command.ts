import { LatexEditor } from "../latex-editor";
import { Command, CommandOptions, EditorShortcutContext, ShortcutConfig } from "./command-types";
import { buildCommandString, getInsertionContext, insertAtPosition, insertIntoCommandArgument, isInsideCommandArgument } from "./command-utils";

/**
 * Command implementation for LaTeX color
 */
export class ColorCommand implements Command {
  shortcut: ShortcutConfig[] = [
    {
      key: "k",
      ctrlKey: true,
      options: { cursorArgumentIndex: 0, wrapWithMath: true }
    },
    {
      key: "k",
      metaKey: true,
      options: { cursorArgumentIndex: 0, wrapWithMath: true }
    }
  ];

  execute(
    editor: LatexEditor,
    position: number,
    args: string[] = [],
    options: CommandOptions = {}
  ): number {
    const state = editor.getState();
    const text = state.content;
    
    const { posInfo, contextInfo } = getInsertionContext(text, position);
    
    const colorArgs = args.length > 0 ? args : ['255', '0', '0', ''];
    
    let commandStr = `\\color{${colorArgs[0]}}{${colorArgs[1]}}{${colorArgs[2]}}`;
    commandStr += `{${colorArgs[3] || ""}}`;
    
    const defaultWrapMath = options.wrapWithMath === undefined ? true : options.wrapWithMath;
    const requiresMathWrap = !posInfo.inMath && 
                          !posInfo.isAfterOpeningMath && 
                          !posInfo.isBeforeClosingMath &&
                          defaultWrapMath;
    
    let newContent: string;
    let newCursorPos: number;
    
    if (isInsideCommandArgument(posInfo.context)) {
      const result = insertIntoCommandArgument(
        text, position, commandStr, contextInfo, requiresMathWrap, options
      );
      newContent = result.newText;
      newCursorPos = result.newCursorPos; 
    } else {
      const result = insertAtPosition(
        text, position, commandStr, requiresMathWrap, options
      );
      newContent = result.newText;
      newCursorPos = result.newCursorPos;
    }
    
    if (options.cursorArgumentIndex === undefined) {
        const argToFocus = colorArgs[3] ? 3 : 0;
        let tempCursorPos = position + (requiresMathWrap ? 1 : 0) + "\\color".length;
        for(let i = 0; i <= argToFocus; i++) {
            const argStart = commandStr.indexOf('{', tempCursorPos - (position + (requiresMathWrap ? 1:0)) ) +1;
            if(argStart > 0) {
                 tempCursorPos = position + (requiresMathWrap ? 1 : 0) + argStart;
            }
        }
         newCursorPos = tempCursorPos;
    }

    editor.setContent(newContent, newCursorPos, newCursorPos);
    return newCursorPos;
  }
} 