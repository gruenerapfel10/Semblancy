# LaTeX Editing System

## Overview

This library provides a comprehensive LaTeX editing system designed for mathematical content editing. The system handles LaTeX parsing, command execution, rendering, cursor positioning, and keyboard interactions.

## System Architecture

```
lib/latex/
├── commands/                    # Command implementations
│   ├── color-command.ts         # Color command implementation
│   ├── command-registry.ts      # Registry for all available commands
│   ├── command-types.ts         # TypeScript interfaces for commands
│   ├── command-utils.ts         # Utility functions for commands
│   ├── fraction-command.ts      # Fraction command implementation
│   ├── generic-command.ts       # Default command implementation
│   ├── index.ts                 # Entry point for commands module
│   ├── matrix-command.ts        # Matrix command implementation
│   ├── sqrt-command.ts          # Square root command implementation
│   ├── subscript-command.ts     # Subscript command implementation
│   └── superscript-command.ts   # Superscript command implementation
├── command-manager.ts           # High-level command execution
├── cursor-manager.ts            # Cursor position management
├── editor-core.ts               # Core editor state management
├── key-handler.ts               # Keyboard event handling
├── latex-editor.ts              # Main editor implementation
├── latex-markdown-renderer.ts   # LaTeX to HTML rendering
├── latex-parser.ts              # LaTeX parsing functionality
└── positioning-system.ts        # Position management system
```

## Core Components

### Editor Core (`editor-core.ts`)
- Manages the editor state through a reducer pattern
- Handles content, cursor position, and editing history
- Provides state transitions for content changes and cursor movement

### LaTeX Editor (`latex-editor.ts`)
- Central component that coordinates all system functionality
- Provides API for content manipulation and cursor control
- Maintains editor state and delegates to specialized components

### Positioning System (`positioning-system.ts`)
- Manages cursor positions within LaTeX content
- Ensures cursor is only placed at valid positions
- Provides tabbing functionality to navigate between meaningful positions

### LaTeX Parser (`latex-parser.ts`)
- Parses LaTeX content into a structured token tree
- Identifies math environments, commands, and arguments
- Provides context information for any cursor position

## Command System

### Command Manager (`command-manager.ts`)
- High-level API for executing LaTeX commands
- Delegates to specific command implementations
- Provides convenience methods for common commands

### Command Registry (`commands/command-registry.ts`)
- Maintains registry of all available commands
- Resolves command names and patterns to implementations
- Provides default command for unknown command handling

### Command Implementations
- Each command (like `fraction-command.ts`) implements the Command interface
- Defines execution behavior for specific LaTeX commands
- Can specify keyboard shortcuts and pattern recognition

## User Interaction Flow

1. **User Input**:
   - User types or presses keyboard shortcuts
   - `KeyHandler` captures keyboard events

2. **Command Execution**:
   - Key events are translated to commands
   - `CommandManager` coordinates command execution
   - Specific command implementation modifies content

3. **State Update**:
   - `LatexEditor` updates state with new content
   - `PositioningSystem` ensures valid cursor positioning
   - Editor UI is updated with new content and cursor position

4. **Rendering**:
   - `LatexMarkdownRenderer` converts content to HTML
   - UI displays rendered content to the user

## Key Features

### Smart Cursor Positioning
- Valid positions only (never inside command names)
- Special handling around math delimiters
- Tab navigation between meaningful positions

### Command System
- Extensible with new command implementations
- Keyboard shortcuts for common commands
- Pattern recognition for parsing

### Math Support
- Math environment handling (`$...$`, `$$...$$`)
- Support for fractions, superscripts, subscripts, matrices, and more
- Special cursor behavior in mathematical contexts

### Editing Capabilities
- Undo/redo history
- Automatic brace completion
- Smart command insertion

## Extending the System

### Adding New Commands
1. Create a new command file implementing the Command interface
2. Register the command in the CommandRegistry
3. Add keyboard shortcuts if needed

### Enhancing Parsing
- Extend the parser to handle additional LaTeX constructs
- Add token types for new constructs
- Update positioning system for new token types

## Usage Example

```typescript
// Create an editor instance
const editor = new LatexEditor("\\frac{1}{2}", {
  onContentChange: (content, start, end) => {
    console.log("Content updated:", content);
  }
});

// Insert a command at cursor position
const commandManager = new CommandManager(editor);
commandManager.insertCommand("sqrt", 0, ["x+y"]);

// Access editor state
const state = editor.getState();
console.log(state.content); // "\sqrt{x+y}"
```
