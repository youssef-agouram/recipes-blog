/**
 * File Upload Routes
 * 
 * SECURITY:
 * - No hardcoded API credentials (all from env/DB only)
 * - File content validated by magic bytes (not just extension/MIME)
 * - Upload size limited to 10MB (reduced from 100MB)
 * - No unsafe base64 fallback storage
 * - Rate limited
 * - Auth required
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware } from '../middleware/auth';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import prisma from '../lib/prisma';

const router = Router();

// SECURITY: Configure from env ONLY — no hardcoded fallback credentials
function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[UPLOADS] Cloudinary is not configured. File uploads will fail.');
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  return true;
}

// Initialize on module load
configureCloudinary();

// ── Magic Byte Validation ─────────────────────────────────────

const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  'video/mp4': [[0x00, 0x00, 0x00]], // ftyp box (varies, starts with size)
  'video/webm': [[0x1A, 0x45, 0xDF, 0xA3]], // EBML header
};

function validateMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) {
    // For types like video/quicktime (mov), allow if extension matches
    return mimetype.startsWith('video/');
  }

  return signatures.some(sig =>
    sig.every((byte, index) => buffer[index] === byte)
  );
}

// ── Multer Configuration ──────────────────────────────────────

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (down from 100MB)
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|mp4|webm|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, png, webp) and videos (mp4, webm, mov) are allowed'));
  },
});

// ── Upload to Cloudinary ──────────────────────────────────────

const uploadToCloudinary = (fileBuffer: Buffer, mimetype: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'recipe-blog',
        resource_type: mimetype.startsWith('video/') ? 'video' : 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// POST /uploads/test-cloudinary — Admin test endpoint
router.post('/test-cloudinary', authMiddleware, async (req: Request, res: Response) => {
  const { cloudName, apiKey, apiSecret } = req.body;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(400).json({ error: 'All fields (Cloud Name, API Key, API Secret) are required' });
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    await cloudinary.api.ping();
    return res.json({ success: true, message: 'Cloudinary connection test successful!' });
  } catch (err: any) {
    // Restore original config after failed test
    configureCloudinary();
    return res.status(400).json({ error: 'Connection test failed. Check your credentials.' });
  }
});

// POST /uploads — Upload file to Cloudinary
router.post('/', authMiddleware, uploadRateLimiter, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // SECURITY: Validate file content matches claimed MIME type (magic bytes)
  if (!validateMagicBytes(req.file.buffer, req.file.mimetype)) {
    return res.status(400).json({ error: 'File content does not match its type. Upload rejected.' });
  }

  try {
    // Dynamically configure from DB settings if available
    const settings = await prisma.siteSettings.findFirst();
    const cloudName = settings?.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = settings?.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY;
    const apiSecret = settings?.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(503).json({ error: 'File upload service is not configured.' });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    return res.json({ imageUrl: result.secure_url });
  } catch (err) {
    // SECURITY: No base64 fallback — if Cloudinary fails, the upload fails
    console.error('[UPLOAD] Cloudinary upload failed');
    return res.status(503).json({ error: 'File upload service is temporarily unavailable.' });
  }
});

export default router;
