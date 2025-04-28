/**
 * Checks if a specific debug mode is enabled via environment variables.
 * Example: DEBUG=AI_SERVICE,AUTH yarn dev
 *
 * @param key The debug key to check (e.g., 'AI_SERVICE').
 * @returns True if the debug mode is enabled, false otherwise.
 */
export function isDebugMode(key: string): boolean {
  if (typeof process === 'undefined' || !process.env.DEBUG) {
    return false;
  }

  const debugKeys = process.env.DEBUG.split(',').map(k => k.trim());
  return debugKeys.includes(key);
} 