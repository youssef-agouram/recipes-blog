import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import recipesRouter from './routes/recipes';
import categoriesRouter from './routes/categories';
import ingredientsRouter from './routes/ingredients';
import authRouter from './routes/auth';
import uploadsRouter from './routes/uploads';
import articlesRouter from './routes/articles';
import settingsRouter from './routes/settings';
import categoryGroupsRouter from './routes/categoryGroups';
import usersRouter from './routes/users';
import compression from 'compression';
import { errorHandler } from './middleware/error';

// Log JWT configuration status
const jwtSecretStatus = process.env.JWT_SECRET ? 'LOADED' : 'MISSING (using fallback: "secret")';
console.log('='.repeat(60));
console.log('[STARTUP] Environment Configuration:');
console.log(`  JWT_SECRET: ${jwtSecretStatus}`);
if (process.env.JWT_SECRET) {
  console.log(`  JWT_SECRET Preview: ${process.env.JWT_SECRET.substring(0, 15)}...`);
}
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? 'LOADED' : 'MISSING'}`);
console.log('='.repeat(60));

const app = express();

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Routes
app.use('/recipes', recipesRouter);
app.use('/categories', categoriesRouter);
app.use('/ingredients', ingredientsRouter);
app.use('/auth', authRouter);
app.use('/uploads', uploadsRouter);
app.use('/articles', articlesRouter);
app.use('/settings', settingsRouter);
app.use('/category-groups', categoryGroupsRouter);
app.use('/users', usersRouter);

// Health check
app.get('/', (_req: express.Request, res: express.Response) => res.send('Recipes API is running...'));

// Error Handler
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${port}`);
});
