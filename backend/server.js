/**
 * Amrit Chhaya Foundation - Backend Server Bootstrap
 * 
 * Educational Note on Express Middleware Pipeline:
 * Middlewares execute top-to-bottom in exact order:
 * 1. Global Request Parsers & CORS
 * 2. API Routes (/api/v1)
 * 3. 404 Not Found Handler
 * 4. Centralized Error Handler
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');

// Import Route Modules
const authRoutes = require('./routes/authRoutes');
const poojaRoutes = require('./routes/poojaRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const yatraRoutes = require('./routes/yatraRoutes');
const donationRoutes = require('./routes/donationRoutes');
const goshalaRoutes = require('./routes/goshalaRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = '/api/v1';

// 1. Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files if needed
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Amrit Chhaya Foundation API Server is active',
    version: '1.0.0',
    documentation: 'Refer to /backend/api.md'
  });
});

// 2. Mount API Modules under /api/v1
app.use(API_PREFIX, authRoutes);
app.use(API_PREFIX, poojaRoutes);
app.use(API_PREFIX, bookingRoutes);
app.use(API_PREFIX, paymentRoutes);
app.use(API_PREFIX, yatraRoutes);
app.use(API_PREFIX, donationRoutes);
app.use(API_PREFIX, goshalaRoutes);
app.use(API_PREFIX, contentRoutes);
app.use(API_PREFIX, adminRoutes);

// 3. Fallback Middleware for Unmatched Routes (404)
app.use(notFoundHandler);

// 4. Centralized Error Handler (Must be registered last!)
app.use(errorHandler);

// Start Server & Test Database Connection
async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Amrit Chhaya API Server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}${API_PREFIX}`);
  });
}

startServer();
