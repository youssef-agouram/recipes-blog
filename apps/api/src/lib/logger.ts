/**
 * Safe Logger Utility
 * 
 * SECURITY: Never logs secrets, tokens, passwords, OTP codes, or API keys.
 * All sensitive patterns are automatically redacted before output.
 */

const SENSITIVE_PATTERNS = [
  /JWT_SECRET[^=]*=\s*["']?[^\s"']+/gi,
  /password[^=]*[:=]\s*["']?[^\s"']+/gi,
  /Authorization:\s*Bearer\s+[^\s]+/gi,
  /sk-proj-[a-zA-Z0-9_-]+/gi,
  /token[^=]*[:=]\s*["']?[a-zA-Z0-9._-]{20,}/gi,
  /\b\d{6}\b(?=.*(?:code|otp|verification))/gi,
  /api[_-]?(?:key|secret)[^=]*[:=]\s*["']?[^\s"']+/gi,
  /smtp[_-]?pass[^=]*[:=]\s*["']?[^\s"']+/gi,
  /postgresql:\/\/[^\s]+/gi,
];

function redact(message: string): string {
  let result = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

export const logger = {
  info: (...args: unknown[]): void => {
    const message = args.map(a => typeof a === 'string' ? redact(a) : a).join(' ');
    console.log(message);
  },
  warn: (...args: unknown[]): void => {
    const message = args.map(a => typeof a === 'string' ? redact(a) : a).join(' ');
    console.warn(message);
  },
  error: (...args: unknown[]): void => {
    const message = args.map(a => typeof a === 'string' ? redact(a) : a).join(' ');
    console.error(message);
  },
  /** Log safely in development only */
  debug: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'development') return;
    const message = args.map(a => typeof a === 'string' ? redact(a) : a).join(' ');
    console.log('[DEBUG]', message);
  },
};
