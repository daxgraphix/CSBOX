/**
 * Environment variable validation and type-safe access.
 *
 * Ensures all required environment variables are present and valid
 * before the application initializes. Fails fast with clear error
 * messages if required variables are missing.
 */

import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL').optional(),
  VITE_APP_NAME: z.string().min(1).default('Csbox Cloud Academy'),
  VITE_APP_VERSION: z.string().min(1).default('1.0.0'),
  VITE_ENABLE_ANALYTICS: z.string().optional().transform(val => val === 'true'),
  VITE_DEFAULT_PORTAL: z
    .enum(['public', 'learner', 'instructor', 'reviewer', 'admin', 'organization', 'support'])
    .default('learner'),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Validates and returns the parsed environment variables.
 * Throws a descriptive error if validation fails.
 */
export function loadEnv(): Env {
  try {
    return EnvSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n  ');
      throw new Error(
        `Invalid environment configuration:\n  ${missing}\n\n` +
          'Please check your .env file and ensure all required variables are set.\n' +
          'See .env.example for reference.'
      );
    }
    throw error;
  }
}

/**
 * Parsed and validated environment variables.
 * Use this instead of accessing import.meta.env directly.
 */
export const env = loadEnv();
