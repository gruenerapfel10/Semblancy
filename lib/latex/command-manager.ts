import type { LatexEditor } from "./latex-editor"
import { CommandRegistry, CommandOptions as CommandInsertionOptions, defaultRegistry, Command, GenericCommand } from "./commands"

export class CommandManager {
  private editor: LatexEditor
  registry: CommandRegistry // Made public for KeyHandler to access getCommands()

  constructor(editor: LatexEditor, registry: CommandRegistry = defaultRegistry) {
    this.editor = editor
    this.registry = registry
  }

  /**
   * Insert a command at a specific position.
   * If the command is not found in the registry, the default command (GenericCommand)
   * will be used, and the commandName itself will be passed as the first argument to it.
   * @param commandName Command name without backslash
   * @param position Position to insert the command
   * @param args Array of argument strings for the command
   * @param options Options for insertion, including `isShortcutInvocation`
   * @returns The new cursor position
   */
  insertCommand(
    commandName: string,
    position: number,
    args: string[] = [],
    options: CommandInsertionOptions = {}
  ): number {
    const command = this.registry.getCommand(commandName); // This will return GenericCommand if name not found

    if (!command) {
      // This case should ideally not be reached if GenericCommand is always set as default.
      // If it is, it means defaultCommandInstance was null in the registry.
      console.error(`CommandManager: Command "${commandName}" not found and no default command instance is configured in the registry.`);
      // Minimal fallback: insert the command name as plain text if everything else fails.
      const simpleText = `\\${commandName}${args.map(arg => `{${arg}}`).join("")}`;
      const currentText = this.editor.getContent();
      const newText = currentText.substring(0, position) + simpleText + currentText.substring(position);
      const newPos = position + simpleText.length;
      this.editor.setContent(newText, newPos, newPos);
      return newPos;
    }

    // Check if this is a second-class command
    const commandClass = this.registry.getCommandClass(commandName);
    
    // Special handling for second-class commands if needed
    if (commandClass === 'second') {
      // Second-class commands have more flexible argument handling
      // For example, ^ and _ can work with or without explicit braces
      return command.execute(this.editor, position, args, {
        ...options,
        isSecondClassCommand: true
      });
    }
    
    // Check if the retrieved command is the default generic command.
    // If so, GenericCommand expects the actual commandName as its first argument.
    if (this.registry.isDefaultCommand(command) && command instanceof GenericCommand) {
      return command.execute(this.editor, position, [commandName, ...args], options);
    } else {
      // For specific commands, pass args as is.
      return command.execute(this.editor, position, args, options);
    }
  }

  /**
   * Insert a fraction at the current position
   * @param position Position to insert the fraction
   * @param options Options for insertion
   * @returns The new cursor position
   */
  insertFraction(position: number, options: CommandInsertionOptions = {}): number {
    return this.insertCommand('frac', position, [], { 
      isShortcutInvocation: true, 
      ...options 
    })
  }

  /**
   * Insert a square root at the current position
   * @param position Position to insert the square root
   * @returns The new cursor position
   */
  insertSqrt(position: number): number {
    return this.insertCommand('sqrt', position, [], { 
      isShortcutInvocation: true 
    })
  }
  
  /**
   * Insert a subscript at the current position
   * @param position Position to insert the subscript
   * @returns The new cursor position
   */
  insertSubscript(position: number): number {
    return this.insertCommand('_', position, [], { 
      isShortcutInvocation: true 
    })
  }
  
  /**
   * Insert a superscript at the current position
   * @param position Position to insert the superscript
   * @returns The new cursor position
   */
  insertSuperscript(position: number): number {
    return this.insertCommand('^', position, [], { 
      isShortcutInvocation: true 
    })
  }
  
  /**
   * Insert a matrix command
   * @param position Position to insert the matrix
   * @param rows Number of rows
   * @param cols Number of columns
   * @returns The new cursor position
   */
  insertMatrix(position: number, rows: number = 2, cols: number = 2): number {
    return this.insertCommand('matrix', position, [rows.toString(), cols.toString()])
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
      ...options
    })
  }
} 