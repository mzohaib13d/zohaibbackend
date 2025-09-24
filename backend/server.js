import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import profileRoutes from './routes/profile.js';

dotenv.config();

const app = express();

// ✅ FIXED: Dynamic CORS for all development ports
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://localhost:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Allow any localhost port during development
      if (origin.includes('://localhost:') || origin.includes('://127.0.0.1:')) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/profile', profileRoutes);

// Health check route (no auth required)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'ZohaibBackend Server is running!', 
    timestamp: new Date().toISOString(),
    cors: allowedOrigins
  });
});

// Connect to MongoDB with better error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('💡 Check your MONGODB_URI in .env file');
    console.log('💡 Make sure your IP is whitelisted in MongoDB Atlas');
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ZohaibBackend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS enabled for all localhost ports`);
});