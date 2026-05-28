import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';

import logger from './config/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import promoRoutes from './routes/promoRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requetes, reessayez plus tard.' },
});
app.use('/api/', apiLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives de connexion. Reessayez plus tard.' },
});

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', name: 'AMAR Studios API', time: new Date().toISOString() }));

app.use('/api/admin/login', loginLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/admin/promo-codes', promoRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`AMAR Studios API running on port ${PORT}`);
  console.log(`AMAR Studios API listening on http://localhost:${PORT}`);
});
