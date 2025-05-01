# Exam System Architecture

This document provides a comprehensive overview of the exam system architecture, explaining the modular design, session management, and hooks.

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Module System](#module-system)
4. [Session Management](#session-management)
5. [React Hooks](#react-hooks)
6. [Utilities](#utilities)
7. [Extension Guide](#extension-guide)

## Overview

The exam system is designed as a modular, extensible framework for managing different types of language proficiency exams. It supports multiple exam types (e.g., Goethe, IELTS), different modules within each exam (e.g., reading, writing, listening, speaking), and various proficiency levels.

Key features:
- Extensible registry for exam modules
- Session tracking for user progress
- Configuration-based exam definitions
- Reusable React hooks for UI integration

## Directory Structure

```
lib/exam/
├── index.ts                 # Main export file
├── config.ts                # Global configuration 
├── levels.ts                # Level definitions
├── session.ts               # Session management system
├── modules/                 # Exam module definitions
│   ├── base.ts              # Base module interfaces and registry
│   ├── goethe.ts            # Goethe exam implementation
│   ├── ielts.ts             # IELTS exam implementation
│   └── ...                  # Other exam types
├── hooks/                   # React hooks
│   ├── index.ts             # Hook exports
│   └── useExamSession.ts    # Session management hook
└── utils/                   # Utility functions
    └── mock-data.ts         # Question generation utilities
```

## Module System

### Base Module System (`/lib/exam/modules/base.ts`)

The module system is built around a registry pattern that allows for dynamic loading and management of exam types. 

Key components:

1. **ExamModuleDetails Interface**: Defines the structure for exam module details, including skills, text types, question types, and exam structure.

2. **ModuleConfig & LevelConfig**: Configuration interfaces for modules (reading, writing, etc.) and levels (A1, B2, etc.).

3. **ExamTypeConfig**: Configuration for an exam type (e.g., Goethe, IELTS).

4. **BaseExamModule**: Abstract class that all exam implementations extend, defining the required interface.

5. **ExamModuleRegistry**: Singleton registry that stores and retrieves exam modules.

### Implementation Example - Goethe Module (`/lib/exam/modules/goethe.ts`)

The Goethe module implementation demonstrates how to create an exam type:

```typescript
export class GoetheExamModule extends BaseExamModule {
  // Implementation of the required methods
  getModules(): { id: string; label: string; icon?: any }[] { ... }
  getLevels(): { id: string; label: string }[] { ... }
  getExamType(): ExamTypeConfig { ... }
  getModuleConfig(moduleId: string): ModuleConfig | null { ... }
  getLevelConfig(levelId: string, moduleId: string): LevelConfig | null { ... }
}

// Register this module
ExamModuleRegistry.register('goethe', new GoetheExamModule());
```

## Session Management

### Session System (`/lib/exam/session.ts`)

The session management system tracks user progress during exam practice. It maintains state information about the current session, including:

- Exam type, module, and level
- Question and answer data
- Timing information
- Progress metrics

#### Key Components

1. **ExamSessionState Interface**: Defines the structure of session state.

2. **ExamSession Class**: Main class for managing a single exam session:
   - Timer management
   - State updates
   - Event subscription system
   - Answer recording

3. **SessionManager Class**: Singleton manager for handling the active session:
   - Starting/ending sessions
   - Retrieving the active session

Example usage:
```typescript
// Start a new session
const session = sessionManager.startSession({
  examType: 'goethe',
  moduleId: 'reading',
  levelId: 'b1'
});

// Record an answer
session.recordAnswer('question-1', 'selected-answer');

// Complete the session
session.complete(85); // With score
```

## React Hooks

### Exam Session Hook (`/lib/exam/hooks/useExamSession.ts`)

The `useExamSession` hook provides React components with access to the session management system:

```typescript
const {
  sessionState,          // Current session state
  isActive,              // Whether a session is active
  startSession,          // Start a new session
  endSession,            // End the current session
  pauseSession,          // Pause the session timer
  resumeSession,         // Resume the session timer
  recordAnswer,          // Record an answer
  navigateToQuestion,    // Navigate to a specific question
  setQuestionData,       // Set question data
  completeExamPart,      // Mark a part as completed
  completeSession        // Complete the session with a score
} = useExamSession();
```

This hook handles:
- Session state sync with React state
- Subscription to session changes
- Lifecycle management

## Utilities

### Mock Data Generation (`/lib/exam/utils/mock-data.ts`)

Provides utilities for generating test data:

- `generateMockQuestions`: Creates mock questions for testing
- Helper functions for generating question content

## Extension Guide

### Adding a New Exam Type

1. Create a new file in `/lib/exam/modules/`, e.g., `toefl.ts`
2. Implement the BaseExamModule abstract class
3. Define module configs, level configs, and exam type config
4. Register the module with ExamModuleRegistry
5. Import the module in `/lib/exam/index.ts`

### Adding Session Features

To extend the session management system:

1. Update the ExamSessionState interface in `/lib/exam/session.ts`
2. Add methods to the ExamSession class
3. Update the useExamSession hook to expose the new functionality

## Usage Examples

### Starting a Session

```tsx
import { useExamSession } from '@/lib/exam/hooks/useExamSession';

function ExamComponent() {
  const { startSession } = useExamSession();
  
  const handleStartExam = () => {
    startSession({
      examType: 'ielts',
      moduleId: 'reading',
      levelId: '7'
    });
  };
  
  return (
    <button onClick={handleStartExam}>
      Start Exam
    </button>
  );
}
```

### Displaying Session Data

```tsx
import { useExamSession } from '@/lib/exam/hooks/useExamSession';

function SessionDisplay() {
  const { sessionState, isActive } = useExamSession();
  
  if (!isActive) {
    return <div>No active session</div>;
  }
  
  return (
    <div>
      <h2>Session Info</h2>
      <p>Exam Type: {sessionState.examType}</p>
      <p>Time Spent: {Math.floor(sessionState.timeSpent / 60)}m {sessionState.timeSpent % 60}s</p>
      <p>Questions Answered: {sessionState.userProgress?.questionsAnswered || 0}</p>
    </div>
  );
}
```

## Future Enhancements

Potential areas for extending the system:

1. Persistent storage for session data
2. Authentication integration
3. Analytics for user performance
4. Custom question generators
5. Adaptive testing algorithms 