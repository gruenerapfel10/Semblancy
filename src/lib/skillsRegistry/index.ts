import SkillRegistry from './registry';
import * as Types from './types';
import { initializeRegistry } from './initialize';

// Create and initialize the registry
const registry = initializeRegistry();

// Export registry instance and types
export {
  registry,
  SkillRegistry,
  Types
};

// Default export the registry instance for easy imports
export default registry; 