import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import recipesRouter from './routes/recipes';
import categoriesRouter from './routes/categories';
import ingredientsRouter from './routes/ingredients';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/recipes', recipesRouter);
app.use('/categories', categoriesRouter);
app.use('/ingredients', ingredientsRouter);

// Health check
app.get('/', (_req, res) => res.send('Recipes API is running...'));

// Error Handler
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${port}`);
});
