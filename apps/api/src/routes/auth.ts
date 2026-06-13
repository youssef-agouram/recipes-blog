/**
 * Authentication Routes
 * 
 * SECURITY FIXES:
 * - OTP codes generated with crypto.randomInt (not Math.random)
 * - OTP stored in PostgreSQL (not in-memory Map) — works on serverless
 * - OTP codes stored as bcrypt hashes (not plaintext)
 * - Max 5 verification attempts per OTP
 * - No OTP codes or secrets logged to console
 * - Rate limiting on all auth endpoints
 * - Expired OTPs cleaned up automatically
 */

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { sendVerificationEmail } from '../lib/mailer';
import { getJwtSecret } from '../lib/config';
import { authRateLimiter, otpSendRateLimiter } from '../middleware/rateLimiter';

const router = Router();

const MAX_OTP_ATTEMPTS = 5;
const OTP_EXPIRY_MINUTES = 5;

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(6),
});

// ── Helpers ──────────────────────────────────────────────────────

/** Generate a cryptographically secure 6-digit OTP */
function generateSecureOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/** Store OTP in the database (hashed) */
async function storeOtp(email: string, code: string): Promise<void> {
  const hashedCode = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Delete any existing OTPs for this email first
  await prisma.otpCode.deleteMany({ where: { email } });

  await prisma.otpCode.create({
    data: {
      email,
      code: hashedCode,
      expiresAt,
    },
  });
}

/** Verify OTP from database. Returns true if valid. Handles attempts + expiry. */
async function verifyOtp(email: string, code: string): Promise<{ valid: boolean; error?: string }> {
  const otp = await prisma.otpCode.findFirst({
    where: { email, used: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    return { valid: false, error: 'No verification code found. Please request a new one.' };
  }

  if (new Date() > otp.expiresAt) {
    await prisma.otpCode.delete({ where: { id: otp.id } });
    return { valid: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.otpCode.delete({ where: { id: otp.id } });
    return { valid: false, error: 'Too many failed attempts. Please request a new code.' };
  }

  const isMatch = await bcrypt.compare(code, otp.code);
  if (!isMatch) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { valid: false, error: 'Invalid verification code.' };
  }

  // Mark as used and delete
  await prisma.otpCode.delete({ where: { id: otp.id } });
  return { valid: true };
}

/** Clean up expired OTPs (run periodically) */
async function cleanupExpiredOtps(): Promise<void> {
  try {
    await prisma.otpCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  } catch {
    // Non-critical, just log
  }
}

// Cleanup expired OTPs every 10 minutes (only in long-running server, not serverless)
if (process.env.VERCEL !== '1') {
  setInterval(cleanupExpiredOtps, 10 * 60 * 1000);
}

// ── Routes ───────────────────────────────────────────────────────

// POST /auth/login
router.post('/login', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/register (Temporary for setup — consider disabling in production)
router.post('/register', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password } = RegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
});

const SendOtpSchema = z.object({
  email: z.string().email().refine(
    (val) => val.endsWith('@gmail.com') || val.endsWith('@googlemail.com'),
    { message: 'Only Gmail addresses are allowed' }
  ),
});

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

// POST /auth/send-otp
router.post('/send-otp', otpSendRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = SendOtpSchema.parse(req.body);
    const emailKey = email.toLowerCase();

    // Generate secure OTP and store hashed in DB
    const code = generateSecureOtp();
    await storeOtp(emailKey, code);

    // SECURITY: OTP code is NEVER logged to console
    // Send actual email
    await sendVerificationEmail(emailKey, code);

    res.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = VerifyOtpSchema.parse(req.body);
    const emailKey = email.toLowerCase();

    const result = await verifyOtp(emailKey, code);
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email: emailKey } });

    // If user does not exist, automatically register them as a Subscriber
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const defaultName = email.split('@')[0];

      user = await prisma.user.create({
        data: {
          email: emailKey,
          name: defaultName,
          password: hashedPassword,
          role: 'Subscriber',
          status: 'Active',
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/check-email
router.post('/check-email', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const emailKey = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailKey } });

    if (user) {
      // Block admin/editor accounts from passwordless login
      if (user.role === 'Admin' || user.role === 'Administrator' || user.role === 'Editor') {
        return res.status(403).json({
          error: 'Admin accounts require a password. Please use the admin login page.',
        });
      }

      // User exists -> Log them in directly
      const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '1d' });
      return res.json({
        exists: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } else {
      // User does not exist -> Send OTP code
      const code = generateSecureOtp();
      await storeOtp(emailKey, code);

      // SECURITY: OTP code is NEVER logged
      await sendVerificationEmail(emailKey, code);

      return res.json({ exists: false });
    }
  } catch (error) {
    next(error);
  }
});

const RegisterPasswordlessSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

// POST /auth/register-passwordless
router.post('/register-passwordless', authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = RegisterPasswordlessSchema.parse(req.body);
    const emailKey = email.toLowerCase();

    const result = await verifyOtp(emailKey, code);
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    // Double check if user exists
    let existingUser = await prisma.user.findUnique({ where: { email: emailKey } });
    if (existingUser) {
      return res.status(400).json({ error: 'Account already exists. Please sign in instead.' });
    }

    // Generate a secure random password
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const defaultName = email.split('@')[0];

    const user = await prisma.user.create({
      data: {
        email: emailKey,
        name: defaultName,
        password: hashedPassword,
        role: 'Subscriber',
        status: 'Active',
      },
    });

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
