# LaTeX Editor Architecture Guide

## Overview

The LaTeX editor is a sophisticated web-based editor for authoring LaTeX documents with real-time preview capabilities. It features specialized handling for math environments, cursor positioning, and command insertion.

The core design philosophy follows:
- **Standardization**: Consistent position handling across the system (LEFT-BASED, INCLUSIVE indices)
- **Separation of Concerns**: Clean module boundaries with clear responsibilities
- **Extensibility**: Easy addition of new components and features

## System Architecture

The system follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │LatexEditor│  │DebugPanel │  │LatexPreview│  │ShortcutHelp│ │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘ │
└────────────┬────────────────┬─────────────────────────────┬─┘
             │                │                             │
┌────────────▼────────────────▼─────────────────────────────▼─┐
│                       Management Layer                       │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │KeyHandler │  │CommandMgr │  │CursorMgr  │  │GlobalTabTrap│ │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘ │
└────────────┬────────────────┬─────────────────────────────┬─┘
             │                │                             │
┌────────────▼────────────────▼─────────────────────────────▼─┐
│                         Core Layer                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────────────────────┐ │
│  │LatexParser│  │EditorCore │  │PositioningSystem          │ │
│  └───────────┘  └───────────┘  └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Components and Responsibilities

### Positioning System (`positioning-system.ts`)

The central module that standardizes all position handling:

- **LEFT-BASED, INCLUSIVE indices**: Position 0 refers to before the first character
- **Position validation**: Ensures cursor can only be placed at valid positions
- **Position information**: Provides context about cursor positions (math mode, etc.)
- **Navigation functions**: Finding next/previous valid positions

```typescript
// Example of using the positioning system
const position = PS.createPosition(text, index);
const isValid = PS.isValidPosition(text, index);
const nextPos = PS.nextValidPosition(text, currentPos).index;
const inMath = PS.isInMathMode(text, index);
```

### LaTeX Parser (`latex-parser.ts`)

Responsible for tokenizing and understanding LaTeX content:

- **Parsing**: Converts text to structured tokens
- **Context determination**: Identifies cursor context (math mode, command args, etc.)
- **Math environment handling**: Special handling for math delimiters
- **Normalization**: Handles adjacent math environments

```typescript
// Example of parsing and context determination
const tokens = parseLatex(text);
const context = getCursorContext(text, position);
const normalizedText = normalizeAdjacentMathEnvironments(text);
```

### Editor Core (`editor-core.ts`)

Manages the editor state:

- **State management**: Content, cursor position, history
- **Action handling**: Processes editor actions (SET_CONTENT, SET_CURSOR, etc.)
- **History management**: Undo/redo functionality

```typescript
// Example of state management
const state = createInitialEditorState(initialContent);
const newState = editorReducer(state, { type: "SET_CONTENT", payload: { content, selectionStart, selectionEnd } });
```

### Cursor Manager (`cursor-manager.ts`)

Handles cursor behavior and tab navigation:

- **Position calculation**: Converts indices to line/column
- **Cursor state**: Manages selection and cursor context
- **Tab navigation**: Finds important positions for tab stops
- **Global tab trap**: Manages tab order application-wide

```typescript
// Example of cursor handling
const cursorState = getCursorState(text, selectionStart, selectionEnd);
const tabStops = getTabStops(text);
const nextTabPos = findNextTabStop(text, currentPosition, true);
```

### Command Manager (`command-manager.ts`)

Responsible for LaTeX command insertion:

- **Command insertion**: Smart insertion of LaTeX commands
- **Argument handling**: Manages command arguments
- **Math mode wrapping**: Automatically wraps commands with math delimiters when needed
- **Expression detection**: Finds expressions before cursor for wrapping

```typescript
// Example of command insertion
const commandManager = new CommandManager(editor);
const cursorPos = commandManager.insertFraction(position);
const cursorPos = commandManager.insertCommand("frac", position, [], { wrapWithMath: true });
```

### Key Handler (`key-handler.ts`)

Processes keyboard events:

- **Shortcut handling**: Processes editor shortcuts
- **Navigation**: Handles arrow keys and tab navigation
- **Command triggers**: Maps keys to command insertions

```typescript
// Example of key handling
const keyHandler = new KeyHandler({ editor, textareaRef });
const handled = keyHandler.handleKeyDown(event);
```

## The React Layer

### LatexEditor Component (`latex-editor.tsx`)

The main editor component:

- **State synchronization**: Keeps UI in sync with editor state
- **Event handling**: Processes user input
- **Callback system**: Notifies parent components of changes
- **React integration**: Bridges React and the underlying editor system

```typescript
// Example of component usage
<LatexEditor 
  value={content} 
  onChange={setContent} 
  onCursorChange={handleCursorChange}
  onKeyDown={handleKeyDown}
/>
```

### DebugPanel Component (`debug-panel.tsx`)

Provides development insights:

- **State visualization**: Shows current editor state
- **Position information**: Displays cursor position and context
- **Input tracking**: Shows keyboard events
- **Math environment status**: Indicates math mode

## Position Handling Standardization

The positioning system is the cornerstone of the architecture, ensuring consistency:

1. **All positions follow LEFT-BASED INCLUSIVE approach**:
   - Position 0 is before the first character
   - Position n is before the n-th character
   - Token ranges follow the same convention

2. **Position validation rules**:
   - Never inside command names (`\command`)
   - Never between command and arguments (`\command{arg}`)
   - Never immediately after opening or before closing math delimiters
   - Valid at all other positions

3. **Context-aware positions**:
   - Math mode awareness
   - Command argument awareness
   - Special handling for adjacent math environments

## Math Environment Handling

Math mode requires special treatment:

1. **Detection**: Using the cursor context system
2. **Delimiters**: Special handling for `$` and `$$`
3. **Command wrapping**: Automatic wrapping of commands with math delimiters
4. **Adjacent math environments**: Normalization with spaces between adjacent environments
5. **Position validation**: Special rules for positions around math delimiters

```typescript
// Math environment handling examples
const normalizedText = normalizeAdjacentMathEnvironments("$x$$y$");  // Becomes "$x$ $y$"
const isAfterOpening = PS.isAfterMathOpening(text, position);
const isBeforeClosing = PS.isBeforeMathClosing(text, position);
```

## State Management Flow

The flow of state changes follows a predictable pattern:

1. **User input**: Key press, mouse click, or programmatic change
2. **Event handling**: Key handler processes input
3. **Command execution**: Command manager inserts commands
4. **State update**: Editor state is updated with new content and cursor
5. **Callbacks**: Parent components are notified of changes
6. **UI update**: React components re-render with new state

## Standardized Interfaces

### Position Interface

```typescript
interface Position {
  index: number;      // Character index (0-based)
  isValid: boolean;   // Whether this is a valid cursor position
}
```

### Cursor State

```typescript
interface CursorState {
  position: CursorPosition;
  context: string;
  inMath: boolean;
  selection: {
    start: CursorPosition | null;
    end: CursorPosition | null;
  };
}
```

### Editor State

```typescript
interface EditorState {
  content: string;
  cursor: CursorState;
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
}
```

## Extension Points

The architecture is designed for extensibility:

1. **Add new commands**: Extend `CommandManager` with new command methods
2. **Add new shortcuts**: Modify `KeyHandler` to handle new keyboard shortcuts
3. **Add new token types**: Extend the parser to recognize new LaTeX structures
4. **Add new UI components**: Create React components that use the editor's API

## Best Practices

### Position Handling

- Always use the positioning system for cursor-related operations
- Validate positions before using them
- Use standardized navigation functions rather than manual index manipulation

```typescript
// Do this
const nextPos = PS.nextValidPosition(text, currentPos).index;

// Not this
let nextPos = currentPos + 1;
while (!isValidPosition(text, nextPos)) nextPos++;
```

### State Updates

- Use the editor's action system rather than direct state manipulation
- Process all content changes through the editor to maintain history
- Let the cursor manager calculate position information

### Component Communication

- Use the callback system for parent-child communication
- Maintain unidirectional data flow
- Keep state at the appropriate level of the component hierarchy

## Debugging and Development

The debug panel provides insights into the editor's state:

- **Position information**: Index, line, column
- **Cursor context**: Current context type, math mode
- **Command information**: Current command, argument position
- **Character information**: Character at and before cursor
- **Event tracking**: Last key pressed, shortcuts triggered

## Refactoring Patterns

1. **Move from direct indices to Position objects**
2. **Centralize validation in the positioning system**
3. **Use context objects rather than scattered boolean flags**
4. **Standardize naming conventions across modules**

## Conclusion

The LaTeX editor's architecture provides a solid foundation for a sophisticated editing experience with math support. The standardized positioning system and clear separation of concerns ensure robustness and extensibility while enabling complex features like cursor position validation, command insertion, and math environment handling. 