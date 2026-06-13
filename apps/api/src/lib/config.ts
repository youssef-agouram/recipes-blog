/**
 * Secure Environment Configuration
 * 
 * SECURITY: No fallback values for secrets.
 * The application will crash at startup if required environment variables are missing.
 * This prevents running with insecure defaults in production.
 */

// Required environment variables — app MUST crash if these are missing
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
] as const;

// Conditionally required (warn but don't crash — needed for features to work)
const RECOMMENDED_ENV_VARS = [
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const;

let validated = false;

/**
 * Validate all required environment variables at startup.
 * Call this ONCE at the top of index.ts before any route loading.
 */
export function validateEnv(): void {
  if (validated) return;

  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('='.repeat(60));
    console.error('[FATAL] Missing required environment variables:');
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error('');
    console.error('The application cannot start without these variables.');
    console.error('Set them in your .env file or Vercel environment settings.');
    console.error('='.repeat(60));
    process.exit(1);
  }

  // Warn about recommended vars (features may not work)
  for (const key of RECOMMENDED_ENV_VARS) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      console.warn(`[WARN] Optional env var ${key} is not set. Related feature may not work.`);
    }
  }

  // Validate JWT_SECRET strength (minimum 32 characters for HS256)
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    console.error('='.repeat(60));
    console.error('[FATAL] JWT_SECRET is too short. Minimum 32 characters required.');
    console.error('Generate a strong secret with: openssl rand -base64 64');
    console.error('='.repeat(60));
    process.exit(1);
  }

  validated = true;
}

/**
 * Get JWT secret. No fallback — guaranteed to exist after validateEnv().
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('[SECURITY] JWT_SECRET is not configured. Call validateEnv() at startup.');
  }
  return secret;
}
