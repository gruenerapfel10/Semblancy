/**
 * Export all exam modules and the registry for easy access
 */

// Export base types and registry
export * from './base';

// The actual module implementations and registration happens 
// in the respective files, and they're imported and re-exported
// from the main lib/exam/index.ts file. 