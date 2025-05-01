import { modalRegistry } from './base';
import { multipleChoiceModal } from './multiple-choice';
import { fillGapModal } from './fill-gap';

// Register all modals
modalRegistry.register(multipleChoiceModal);
modalRegistry.register(fillGapModal);

// Export everything
export * from './base';
export * from './multiple-choice';
export * from './fill-gap';

// Export registry instance
export { modalRegistry }; 