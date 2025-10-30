import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import linksRoutes from './routes/links.routes.js';
import scraperRoutes from './routes/scraper.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import { rateLimiter } from './middleware/rateLimiter.middleware.js';
import { responseWrapper } from './middleware/responseWrapper.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

app.set('trust proxy', 1);

app.use(helmet())
app.use(cors({  
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);
app.use(responseWrapper);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/scraper', scraperRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    isSuccess: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});