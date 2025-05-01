/**
 * Main export file for the exam system
 * This file initializes the module registry and exports all necessary components
 */

// Export module base types and registry
export * from './modules/base';

// Export session management system
export * from './session';
export * from './hooks/useExamSession';

// Import all modules to ensure they're registered
import './modules/goethe';
import './modules/ielts';

// Export module implementations
export { GoetheExamModule } from './modules/goethe';
export { IeltsExamModule } from './modules/ielts'; 