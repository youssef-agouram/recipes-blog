import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { sendVerificationEmail } from '../lib/mailer';

import { getJwtSecret } from '../lib/config';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(6),
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
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

// POST /auth/register (Temporary for setup)
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
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

const otpStore = new Map<string, { code: string; expiresAt: number }>();

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
router.post('/send-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = SendOtpSchema.parse(req.body);

    // Generate 6 digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email.toLowerCase(), { code, expiresAt });

    // Print a beautifully formatted verification box in the terminal console
    console.log('\n' + '='.repeat(60));
    console.log('┌────────────────────────────────────────────────────────┐');
    console.log('│                                                        │');
    console.log('│   GMAIL VERIFICATION CODE                              │');
    console.log(`│   Email: ${email.padEnd(46)} │`);
    console.log(`│   Code:  ${code.padEnd(46)} │`);
    console.log('│   Expires in: 5 minutes                                │');
    console.log('│                                                        │');
    console.log('└────────────────────────────────────────────────────────┘');
    console.log('='.repeat(60) + '\n');

    // Send actual email using the transporter
    await sendVerificationEmail(email.toLowerCase(), code);

    res.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = VerifyOtpSchema.parse(req.body);
    const emailKey = email.toLowerCase();

    const storedOtp = otpStore.get(emailKey);
    if (!storedOtp) {
      return res.status(400).json({ error: 'No verification code sent or code expired' });
    }

    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(emailKey);
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    if (storedOtp.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Code is valid, remove it
    otpStore.delete(emailKey);

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email: emailKey } });

    // If user does not exist, automatically register them as a Subscriber
    if (!user) {
      // Create user with a temporary random password and default name from email
      const randomPassword = Math.random().toString(36) + Math.random().toString(36);
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
      console.log(`[AUTH] Automatically registered new user: ${emailKey}`);
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
router.post('/check-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const emailKey = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailKey } });

    if (user) {
      // User exists -> Log them in directly! Return JWT and user info.
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
      // Generate 6 digit numeric code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      otpStore.set(emailKey, { code, expiresAt });

      // Print a beautifully formatted verification box in the terminal console
      console.log('\n' + '='.repeat(60));
      console.log('┌────────────────────────────────────────────────────────┐');
      console.log('│                                                        │');
      console.log('│   GMAIL VERIFICATION CODE                              │');
      console.log(`│   Email: ${email.padEnd(46)} │`);
      console.log(`│   Code:  ${code.padEnd(46)} │`);
      console.log('│   Expires in: 5 minutes                                │');
      console.log('│                                                        │');
      console.log('└────────────────────────────────────────────────────────┘');
      console.log('='.repeat(60) + '\n');

      // Send actual email using the transporter
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
router.post('/register-passwordless', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = RegisterPasswordlessSchema.parse(req.body);
    const emailKey = email.toLowerCase();

    const storedOtp = otpStore.get(emailKey);
    if (!storedOtp) {
      return res.status(400).json({ error: 'No verification code sent or code expired' });
    }

    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(emailKey);
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    if (storedOtp.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Code is valid, remove it
    otpStore.delete(emailKey);

    // Double check if user exists
    let existingUser = await prisma.user.findUnique({ where: { email: emailKey } });
    if (existingUser) {
      return res.status(400).json({ error: 'Account already exists. Please sign in instead.' });
    }

    // Generate a random password for database integrity
    const randomPassword = Math.random().toString(36) + Math.random().toString(36);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Generate default name from email prefix
    const defaultName = email.split('@')[0];

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: emailKey,
        name: defaultName,
        password: hashedPassword,
        role: 'Subscriber',
        status: 'Active',
      },
    });

    console.log(`[AUTH] Successfully registered new user: ${emailKey}`);

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
