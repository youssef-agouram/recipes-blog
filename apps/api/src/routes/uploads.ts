import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Configure initial/fallback Cloudinary values
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpwkmt5kr',
  api_key: process.env.CLOUDINARY_API_KEY || '588574244871288',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'iIBcQz592b1VO0rCkiDndG8FoLM'
});

// POST /uploads/test-cloudinary
router.post('/test-cloudinary', authMiddleware, async (req: Request, res: Response) => {
  const { cloudName, apiKey, apiSecret } = req.body;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(400).json({ error: 'All fields (Cloud Name, API Key, API Secret) are required' });
  }

  try {
    // Configure temporary instance
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    // Test ping
    await cloudinary.api.ping();
    return res.json({ success: true, message: 'Cloudinary connection test successful!' });
  } catch (err: any) {
    console.error('Cloudinary connection test failed:', err);
    return res.status(400).json({ error: err.message || 'Connection test failed' });
  }
});

// Helper function to upload to Cloudinary via streams
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

// Store files in memory first to avoid Vercel's read-only filesystem limitations
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for media uploads
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|mp4|webm|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, png, webp) and videos (mp4, webm, mov) are allowed'));
  }
});

// POST /uploads
router.post('/', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Configure Cloudinary dynamically from DB settings or fallback to process.env
    const settings = await prisma.siteSettings.findFirst();
    const cloudName = settings?.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME || 'dpwkmt5kr';
    const apiKey = settings?.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY || '588574244871288';
    const apiSecret = settings?.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET || 'iIBcQz592b1VO0rCkiDndG8FoLM';

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    // Attempt Cloudinary Upload
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    return res.json({ imageUrl: result.secure_url });
  } catch (err) {
    console.error('Cloudinary upload failed, falling back to local/base64:', err);

    // Detect Vercel production/preview environment
    const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';

    if (isVercel) {
      // In production fallback, convert the file directly to base64 Data URL
      const base64Data = req.file.buffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
      return res.json({ imageUrl });
    } else {
      // In local development fallback, attempt to save the file locally
      const uploadPath = path.resolve(__dirname, '../../../web/public/uploads');
      
      if (!fs.existsSync(uploadPath)) {
        try {
          fs.mkdirSync(uploadPath, { recursive: true });
        } catch (mkdirErr) {
          console.error('Failed to create local upload directory:', mkdirErr);
          const base64Data = req.file.buffer.toString('base64');
          const imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
          return res.json({ imageUrl });
        }
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = uniqueSuffix + path.extname(req.file.originalname);
      const fullPath = path.join(uploadPath, filename);

      try {
        fs.writeFileSync(fullPath, req.file.buffer);
        const imageUrl = `/uploads/${filename}`;
        return res.json({ imageUrl });
      } catch (writeErr) {
        console.error('Failed to save file to local disk:', writeErr);
        const base64Data = req.file.buffer.toString('base64');
        const imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
        return res.json({ imageUrl });
      }
    }
  }
});

export default router;
