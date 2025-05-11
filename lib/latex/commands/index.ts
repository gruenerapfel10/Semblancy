// Export command types and interfaces
export * from './command-types';
export * from './command-registry';
export * from './command-utils';

// Export command implementations
export { FractionCommand } from './fraction-command';
export { SuperscriptCommand } from './superscript-command';
export { SubscriptCommand } from './subscript-command';
export { MatrixCommand } from './matrix-command';
export { ColorCommand } from './color-command';
export { GenericCommand } from './generic-command';
export { SqrtCommand } from './sqrt-command';

// Create and export the default command registry
import { CommandRegistry } from './command-registry';
import { FractionCommand } from './fraction-command';
import { SuperscriptCommand } from './superscript-command';
import { SubscriptCommand } from './subscript-command';
import { MatrixCommand } from './matrix-command';
import { ColorCommand } from './color-command';
import { GenericCommand } from './generic-command';
import { SqrtCommand } from './sqrt-command';

// Initialize the default registry with common commands
const defaultRegistry = new CommandRegistry();

// Set the default command for handling unknown commands
defaultRegistry.setDefaultCommand(new GenericCommand());

// Register specific command implementations
defaultRegistry.register('frac', new FractionCommand());
defaultRegistry.register('sup', new SuperscriptCommand()); // Register as \sup for direct command access
defaultRegistry.register('^', new SuperscriptCommand()); // Register as ^ for special handling
defaultRegistry.register('sub', new SubscriptCommand()); // Register as \sub for direct command access
defaultRegistry.register('_', new SubscriptCommand()); // Register as _ for special handling
defaultRegistry.register('matrix', new MatrixCommand());
defaultRegistry.register('pmatrix', new MatrixCommand()); // Also register as pmatrix
defaultRegistry.register('color', new ColorCommand());
defaultRegistry.register('sqrt', new SqrtCommand());

export { defaultRegistry }; 