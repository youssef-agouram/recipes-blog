import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import recipesRouter from './routes/recipes';
import categoriesRouter from './routes/categories';
import ingredientsRouter from './routes/ingredients';
import authRouter from './routes/auth';
import uploadsRouter from './routes/uploads';
import compression from 'compression';
import { errorHandler } from './middleware/error';

dotenv.config();

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

// Health check
app.get('/', (_req: express.Request, res: express.Response) => res.send('Recipes API is running...'));

// Error Handler
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${port}`);
});
