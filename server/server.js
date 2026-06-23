const express  = require('express');
const mongoose = require('mongoose');
const http     = require('http');
const { Server } = require('socket.io');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan   = require('morgan');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

// Trust proxy (required for Vercel / CDN proxies when using express-rate-limit)
app.set('trust proxy', 1);

// Mock Socket.io for Vercel Serverless environment
const mockIo = {
  emit: () => {},
  to: () => ({ emit: () => {} })
};

// Attach mock io to app for use in controllers
app.set('io', mockIo);

// Manual CORS (Express 5 compatible)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Security Middleware
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// app.use(mongoSanitize());
app.use(compression());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate Limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false }));
app.use('/api',      rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

// Routes
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/products',    require('./routes/productRoutes'));
app.use('/api/collections', require('./routes/collectionRoutes'));
app.use('/api/orders',      require('./routes/orderRoutes'));
app.use('/api/payments',    require('./routes/paymentRoutes'));
app.use('/api/inventory',   require('./routes/inventoryRoutes'));
app.use('/api/users',       require('./routes/userRoutes'));
app.use('/api/staff',       require('./routes/staffRoutes'));
app.use('/api/finance',     require('./routes/financeRoutes'));
app.use('/api/support',     require('./routes/supportRoutes'));
app.use('/api/stats',       require('./routes/statsRoutes'));
app.use('/api/upload',      require('./routes/uploadRoutes'));
app.use('/api/coupons',     require('./routes/couponRoutes'));
app.use('/api/reviews',     require('./routes/reviewRoutes'));
app.use('/api/settings',    require('./routes/settingsRoutes'));
app.use('/api/suppliers',   require('./routes/supplierRoutes'));

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 Handler
app.use('/{*path}', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error Handler
app.use(require('./middleware/errorHandler'));

// Socket Handler (Disabled for Vercel Serverless)
// require('./socket/socketHandler')(io);

// Database Connection + Start Server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected');
    // Only start server listening if not running on Vercel
    if (!process.env.VERCEL) {
      server.listen(process.env.PORT || 5000, () => {
        console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
        console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
      });
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
  });

// Export app for Vercel Serverless Functions
module.exports = app;
