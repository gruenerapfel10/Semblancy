/**
 * Past Papers Module
 * 
 * A module for managing past exam papers with local storage persistence.
 */

// Re-export types
export * from './types';

// Re-export hooks
export { usePastPapers } from './hooks';

// Re-export utils (selective exports)
export {
  createPaperFromFile,
  extractMetadataFromFilename,
  filterPapers,
  getUniqueValues,
  sortPapers
} from './utils';

// Intentionally not exporting the raw storage functions
// Users should interact with the module through the hook 