import { Command, CommandPattern } from './command-types'

/**
 * Registry for LaTeX commands
 * Manages command instances and provides a way to retrieve them
 */
export class CommandRegistry {
  private commands: Map<string, Command> = new Map()
  private defaultCommandInstance: Command | null = null
  private backslashCommands: Map<string, Command> = new Map()
  private characterCommands: Map<string, Command> = new Map()
  private firstClassCommands: Set<Command> = new Set()
  private secondClassCommands: Set<Command> = new Set()
  
  /**
   * Register a command with the registry
   * @param name Command name (without backslash)
   * @param command Command implementation
   */
  register(name: string, command: Command): void {
    this.commands.set(name, command)
    
    // Register command patterns for parser recognition
    if (command.pattern) {
      const patterns = Array.isArray(command.pattern) ? command.pattern : [command.pattern]
      
      for (const pattern of patterns) {
        if (pattern.patternType === 'backslash') {
          this.backslashCommands.set(pattern.identifier, command)
        } else if (pattern.patternType === 'character') {
          this.characterCommands.set(pattern.identifier, command)
        }
        
        // Track command by its class
        if (pattern.commandClass === 'first') {
          this.firstClassCommands.add(command)
        } else if (pattern.commandClass === 'second') {
          this.secondClassCommands.add(command)
        }
      }
    }
    // Fallback: if no pattern defined but name exists, assume backslash command
    else {
      this.backslashCommands.set(name, command)
      // Default to first class if not specified
      this.firstClassCommands.add(command)
    }
  }
  
  /**
   * Set the default command to use when a command is not found
   * @param command The default command implementation
   */
  setDefaultCommand(command: Command): void {
    this.defaultCommandInstance = command
  }
  
  /**
   * Get a command by name
   * @param name Command name (without backslash)
   * @returns The command implementation or the default command if not found
   */
  getCommand(name: string): Command | undefined {
    const command = this.commands.get(name)
    
    if (command) {
      return command
    }
    
    return this.defaultCommandInstance || undefined
  }
  
  /**
   * Get a command by its backslash identifier
   * @param identifier The command identifier (without backslash)
   * @returns The command implementation or undefined if not found
   */
  getBackslashCommand(identifier: string): Command | undefined {
    return this.backslashCommands.get(identifier)
  }
  
  /**
   * Get a command by its character identifier
   * @param char The character identifier (e.g., "^" or "_")
   * @returns The command implementation or undefined if not found
   */
  getCharacterCommand(char: string): Command | undefined {
    return this.characterCommands.get(char)
  }
  
  /**
   * Checks if a character is a registered command character
   * @param char The character to check
   * @returns True if the character is registered as a command character
   */
  isCommandCharacter(char: string): boolean {
    return this.characterCommands.has(char)
  }
  
  /**
   * Checks if the provided command instance is the configured default command.
   * @param command The command instance to check.
   * @returns True if it's the default command instance.
   */
  isDefaultCommand(command: Command): boolean {
    return this.defaultCommandInstance === command
  }
  
  /**
   * Check if a command exists in the registry (excluding default)
   * @param name Command name (without backslash)
   * @returns True if the command exists
   */
  hasCommand(name: string): boolean {
    return this.commands.has(name)
  }
  
  /**
   * Get a list of all registered command names
   * @returns Array of command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys())
  }
  
  /**
   * Get all registered command instances mapped to their names (excluding the default command 
   * unless it was also explicitly registered with a name).
   * @returns An array of objects, each with command name and instance.
   */
  getNamedCommands(): { name: string, command: Command }[] {
    const namedCommands: { name: string, command: Command }[] = [];
    this.commands.forEach((command, name) => {
      namedCommands.push({ name, command });
    });
    return namedCommands;
  }
  
  /**
   * Get all registered command characters
   * @returns Array of command characters
   */
  getCommandCharacters(): string[] {
    return Array.from(this.characterCommands.keys())
  }
  
  /**
   * Check if a command is a first-class command (requiring explicit arguments)
   * @param command The command to check
   * @returns True if it's a first-class command
   */
  isFirstClassCommand(command: Command): boolean {
    return this.firstClassCommands.has(command);
  }
  
  /**
   * Check if a command is a second-class command (works with implicit arguments)
   * @param command The command to check
   * @returns True if it's a second-class command
   */
  isSecondClassCommand(command: Command): boolean {
    return this.secondClassCommands.has(command);
  }
  
  /**
   * Get the command class for a character command
   * @param char The character command (e.g., "^" or "_")
   * @returns 'first', 'second', or undefined if not found
   */
  getCommandClass(char: string): 'first' | 'second' | undefined {
    const command = this.getCharacterCommand(char) || this.getBackslashCommand(char);
    
    if (!command) return undefined;
    
    if (this.secondClassCommands.has(command)) {
      return 'second';
    } else if (this.firstClassCommands.has(command)) {
      return 'first';
    }
    
    return undefined;
  }
  
  /**
   * Get all registered second-class command characters
   * @returns Array of second-class command characters
   */
  getSecondClassCommandCharacters(): string[] {
    return Array.from(this.characterCommands.entries())
      .filter(([_, command]) => this.secondClassCommands.has(command))
      .map(([char, _]) => char);
  }
} 