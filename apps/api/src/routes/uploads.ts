import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Store files f memory first to avoid Vercel's read-only filesystem limitations
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
router.post('/', authMiddleware, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Detect Vercel production/preview environment
  const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';

  if (isVercel) {
    // In production, convert the file directly to base64 Data URL (bypassing read-only disk)
    const base64Data = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    return res.json({ imageUrl });
  } else {
    // In local development, attempt to save the file locally
    const uploadPath = path.resolve(__dirname, '../../../web/public/uploads');
    
    if (!fs.existsSync(uploadPath)) {
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
      } catch (err) {
        console.error('Failed to create local upload directory, falling back to base64:', err);
        const base64Data = req.file.buffer.toString('base64');
        const imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
        return res.json({ imageUrl });
      }
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(req.file.originalname);
    const fullPath = path.join(uploadPath, filename);

    try {
      fs.writeFileSync(fullPath, req.file.buffer as any);
      const imageUrl = `/uploads/${filename}`;
      return res.json({ imageUrl });
    } catch (err) {
      console.error('Failed to save file to local disk, falling back to base64:', err);
      const base64Data = req.file.buffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
      return res.json({ imageUrl });
    }
  }
});

export default router;
