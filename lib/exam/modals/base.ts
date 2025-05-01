import { z } from 'zod';
import { ComponentType } from 'react';

// Base interface for modal configuration
export interface ModalConfig {
  type: string;
  description: string;
  config?: Record<string, any>;
}

// Base interface for modal validation schemas
export interface ModalSchemas {
  config: z.ZodType<any>;
  answer: z.ZodType<any>;
  prompt: z.ZodType<any>;
}

// Base interface for modal prompts
export interface ModalPrompts {
  generateQuestion: string;
  validateAnswer: string;
  generateFeedback: string;
}

// Base interface for modal props
export interface ModalProps<T = any, A = any> {
  prompt: T;
  onAnswer: (answer: A) => void;
  config: Record<string, any>;
}

// Base class for all modals
export abstract class BaseModal<T = any, A = any> {
  abstract readonly type: string;
  abstract readonly description: string;
  abstract readonly schemas: ModalSchemas;
  abstract readonly prompts: ModalPrompts;
  abstract readonly Component: ComponentType<ModalProps<T, A>>;

  getConfig(): ModalConfig {
    return {
      type: this.type,
      description: this.description
    };
  }
}

// Modal registry for managing all available modals
export class ModalRegistry {
  private static instance: ModalRegistry;
  private modals: Map<string, BaseModal> = new Map();

  private constructor() {}

  static getInstance(): ModalRegistry {
    if (!ModalRegistry.instance) {
      ModalRegistry.instance = new ModalRegistry();
    }
    return ModalRegistry.instance;
  }

  register(modal: BaseModal): void {
    if (this.modals.has(modal.type)) {
      throw new Error(`Modal type '${modal.type}' is already registered`);
    }
    this.modals.set(modal.type, modal);
  }

  get(type: string): BaseModal | undefined {
    return this.modals.get(type);
  }

  getAll(): BaseModal[] {
    return Array.from(this.modals.values());
  }

  getTypes(): string[] {
    return Array.from(this.modals.keys());
  }
}

// Export singleton instance
export const modalRegistry = ModalRegistry.getInstance(); 