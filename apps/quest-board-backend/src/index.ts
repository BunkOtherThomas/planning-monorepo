import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
};

app.use(cors(corsOptions));

// Pre-flight requests
app.options('*', cors(corsOptions));

// Routes
app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'The quest board is operational!' });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`🏰 Quest Board API is running on port ${port}`);
}); 