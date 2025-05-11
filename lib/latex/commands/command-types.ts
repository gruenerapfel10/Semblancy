import type { LatexEditor } from "../latex-editor"
import type { ParsedToken } from "../latex-parser"
import type * as PS from "../positioning-system"; // For PS.positionInfo

/**
 * Options for command insertion
 */
export interface CommandOptions {
  wrapWithMath?: boolean // Whether to wrap with $ if not in math mode
  positionInFirstArg?: boolean // Whether to position cursor in first arg (vs second)
  cursorArgumentIndex?: number // Index of argument to position cursor in (0-based, -1 for last)
  isShortcutInvocation?: boolean // True if the command was triggered by a shortcut
}

/**
 * Context information about the current token
 */
export interface TokenContext {
  context: string
  inMath: boolean
  token?: ParsedToken
  command?: ParsedToken
}

/**
 * Context passed to shortcut condition functions
 */
export interface EditorShortcutContext {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  posInfo: ReturnType<typeof PS.positionInfo>; // Detailed position info
  inMath: boolean;
  context: string;
}

/**
 * Configuration for a keyboard shortcut that triggers a command.
 */
export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  condition?: (context: EditorShortcutContext) => boolean;
  // Arguments to pass to the command's execute method when this shortcut is triggered.
  // If not provided, execute is called with empty args (and isShortcutInvocation: true).
  getArgs?: (context: EditorShortcutContext) => string[];
  // Specific options to pass to the command's execute method for this shortcut.
  // These will be merged with { isShortcutInvocation: true }.
  options?: Partial<CommandOptions>; 
}

/**
 * Base interface for all LaTeX commands
 */
export interface Command {
  /**
   * Optional shortcut configuration for this command.
   * Can be a single config or an array for multiple shortcuts.
   */
  shortcut?: ShortcutConfig | ShortcutConfig[];

  /**
   * Execute the command at the specified position
   * @param editor The editor instance
   * @param position Position to insert the command
   * @param args Arguments for the command
   * @param options Command options, including `isShortcutInvocation`
   * @returns The new cursor position
   */
  execute(
    editor: LatexEditor,
    position: number,
    args?: string[],
    options?: CommandOptions
  ): number
}

// Type to define how a command is recognized in text
export type CommandPattern = {
  // The string that identifies this command (e.g., "frac" for \frac, "^" for superscript)
  identifier: string;
  
  // How the command starts in the text:
  // - 'backslash' means it starts with \ (like \frac)
  // - 'character' means it's a direct character (like ^ or _)
  patternType: 'backslash' | 'character';
  
  // Optional regex for more complex matching patterns (for future use)
  regex?: RegExp;
}

// Command interface with pattern support
export interface Command {
  // Pattern(s) for how this command appears in LaTeX
  pattern?: CommandPattern | CommandPattern[];
  
  // Shortcut definition for the command
  shortcut?: ShortcutConfig | ShortcutConfig[]
  
  // Execute the command
  execute(
    editor: LatexEditor,
    position: number,
    args?: string[],
    options?: CommandOptions
  ): number
} 