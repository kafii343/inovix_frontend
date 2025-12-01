import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import userRoutes from './routes/userRoutes';
import serviceRoutes from './routes/serviceRoutes';
import slotRoutes from './routes/slotRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';

// =======================
// ENV CONFIG
// =======================
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// =======================
// MIDDLEWARE
// =======================
app.use(helmet());

app.use(
  cors({
    origin:
      NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:3000',
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// =======================
// ROUTES
// =======================
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    environment: NODE_ENV,
  });
});

// =======================
// DATABASE
// =======================
const getMongoURI = (): string => {
  if (NODE_ENV === 'production') {
    if (!process.env.MONGO_URL) {
      throw new Error('❌ MONGO_URL is required in production');
    }
    return process.env.MONGO_URL;
  }

  return (
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/inovix'
  );
};

const connectDB = async (): Promise<void> => {
  try {
    const uri = getMongoURI();
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// =======================
// SERVER START
// =======================
const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});
