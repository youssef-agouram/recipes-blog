/**
 * Global Error Handler
 * 
 * SECURITY:
 * - In production: Returns generic error messages, never leaks stack traces or internal details
 * - In development: Returns detailed error info for debugging
 * - Prisma constraint errors return safe conflict messages
 * - Zod validation errors return field-level details (safe — it's input validation)
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Always log the error server-side (for debugging), but never send internals to client
  if (isProduction) {
    // In production: log only the error message, not the full object with potential secrets
    console.error('[ERROR]', err.message || 'Unknown error');
  } else {
    console.error(err);
  }

  // Zod validation errors — safe to return (it's about the user's input)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma unique constraint errors — safe generic message
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'A record with this data already exists.',
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found.',
    });
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Origin not allowed.',
    });
  }

  // Default error
  const status = err.status || 500;

  if (isProduction) {
    // SECURITY: Never expose internal error messages in production
    res.status(status).json({
      error: status === 500 ? 'Internal Server Error' : (err.message || 'An error occurred'),
    });
  } else {
    // Development: include details for debugging
    res.status(status).json({
      error: err.message || 'Internal Server Error',
      stack: err.stack,
    });
  }
};
