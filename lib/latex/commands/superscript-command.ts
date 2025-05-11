import { LatexEditor } from "../latex-editor";
import { Command, CommandOptions, EditorShortcutContext, ShortcutConfig, CommandPattern } from "./command-types";
import { getInsertionContext, insertAtPosition, insertIntoCommandArgument, isInsideCommandArgument } from "./command-utils";
import { findExpressionBeforeCursor } from "../latex-parser";
import * as PS from "../positioning-system";

/**
 * Command implementation for LaTeX superscript (^{})
 */
export class SuperscriptCommand implements Command {
  // Define how this command is recognized in LaTeX text
  pattern: CommandPattern = {
    identifier: '^',
    patternType: 'character'
  };
  
  shortcut: ShortcutConfig[] = [
    {
      key: "ArrowUp",
      ctrlKey: true,
      options: { wrapWithMath: true }
    },
    {
      key: "ArrowUp",
      metaKey: true,
      options: { wrapWithMath: true }
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
    let commandStr = "^{}";

    if (args.length > 0 && args[0]) {
      commandStr = `^{${args[0]}}`;
    }

    const { posInfo, contextInfo } = getInsertionContext(text, position);

    const defaultWrapMath = options.wrapWithMath === undefined ? true : options.wrapWithMath;
    const requiresMathWrap = !posInfo.inMath && 
                          !posInfo.isAfterOpeningMath && 
                          !posInfo.isBeforeClosingMath &&
                          defaultWrapMath;

    let newText: string;
    let finalCursorPos: number;

    if (isInsideCommandArgument(posInfo.context)) {
      const result = insertIntoCommandArgument(
        text, position, commandStr, contextInfo, requiresMathWrap, options
      );
      newText = result.newText;
      finalCursorPos = result.newCursorPos;
    } else {
      const result = insertAtPosition(
        text, position, commandStr, requiresMathWrap, options
      );
      newText = result.newText;
      finalCursorPos = result.newCursorPos;
    }
    
    if (commandStr === "^{}" || commandStr === "_{}") {
        const newPos = position + (requiresMathWrap ? 1 : 0) + commandStr.indexOf('{') + 1;
        const commandStartInNewText = position + (requiresMathWrap ? 1 : 0);
        const commandEndInNewText = commandStartInNewText + commandStr.length;
        if (newPos > commandStartInNewText && newPos < commandEndInNewText) {
            finalCursorPos = newPos;
        }
    }

    editor.setContent(newText, finalCursorPos, finalCursorPos);
    return finalCursorPos;
  }
} 