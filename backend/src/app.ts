import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

// Security Hardening Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Request Tracking Configuration
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request Limitation & Parsing Configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, message: 'Too many requests from this endpoint, please retry later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', rateLimiter);

// API Base Route Verification
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// App Router Placeholders (Populated in next phases)
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/products', productRouter);

// Fallback Route for Missing Endpoints
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: any = new Error(`Resource Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Central System Exception Interceptor
app.use(errorHandler);

export default app;