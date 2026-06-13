import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment before anything else
const apiEnvPath = path.join(__dirname, '../.env');
if (fs.existsSync(apiEnvPath)) {
  dotenv.config({ path: apiEnvPath });
}
dotenv.config();

// SECURITY: Validate all required env vars — crash if missing
import { validateEnv } from './lib/config';
validateEnv();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import recipesRouter from './routes/recipes';
import categoriesRouter from './routes/categories';
import ingredientsRouter from './routes/ingredients';
import authRouter from './routes/auth';
import uploadsRouter from './routes/uploads';
import articlesRouter from './routes/articles';
import settingsRouter from './routes/settings';
import categoryGroupsRouter from './routes/categoryGroups';
import usersRouter from './routes/users';
import commentsRouter from './routes/comments';
import statsRouter from './routes/stats';
import seoRouter from './routes/seo';
import { errorHandler } from './middleware/error';
import { apiRateLimiter } from './middleware/rateLimiter';

// SECURITY: Safe startup logging — NO secrets, NO key previews
console.log('='.repeat(60));
console.log('[STARTUP] Environment Configuration:');
console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? 'LOADED' : 'MISSING'}`);
console.log(`  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'LOADED' : 'MISSING'}`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? 'LOADED' : 'MISSING'}`);
console.log('='.repeat(60));

const app = express();

// ============================================
// SECURITY MIDDLEWARE STACK (order matters!)
// ============================================

// 1. Security headers (HSTS, X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet({
  contentSecurityPolicy: false,        // Let Next.js handle CSP
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow Cloudinary images
}));

// 2. Compression
app.use(compression());

// 3. CORS — restrict to known origins only
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 4. Body parsing — SECURITY: 1MB limit (uploads handled by multer separately)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// 5. Global rate limiting
app.use(apiRateLimiter);

// ============================================
// ROUTES
// ============================================
app.use('/recipes', recipesRouter);
app.use('/categories', categoriesRouter);
app.use('/ingredients', ingredientsRouter);
app.use('/auth', authRouter);
app.use('/uploads', uploadsRouter);
app.use('/articles', articlesRouter);
app.use('/settings', settingsRouter);
app.use('/category-groups', categoryGroupsRouter);
app.use('/users', usersRouter);
app.use('/comments', commentsRouter);
app.use('/stats', statsRouter);
app.use('/seo', seoRouter);

// Health check
app.get('/', (_req: express.Request, res: express.Response) => res.send('Recipes API is running...'));

// Error Handler
app.use(errorHandler);

const port = process.env.PORT || 4000;
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
}

export default app;
