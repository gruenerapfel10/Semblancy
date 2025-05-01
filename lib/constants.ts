import { generateDummyPassword } from './db/utils';

/**
 * Environment configuration
 */
export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

/**
 * Security constants
 */
export const DUMMY_PASSWORD = generateDummyPassword();
