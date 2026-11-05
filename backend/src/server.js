const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { initializeDatabase } = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// 1. Security & Protection Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Cross-Origin Resource Sharing (Interoperability with React client)
app.use(cors({
  origin: '*', // Allows local development and testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiter to prevent brute-force attacks and abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this client. Please slow down.'
  }
});
app.use(limiter);

// 2. Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Health & Diagnostic Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Enterprise Banana Game Backend',
    course: 'CIS046-3 Software For Enterprise',
    externalApi: config.bananaApiUrl
  });
});

// 4. API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/profile', profileRoutes);

// 5. Global 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found.`
  });
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred.',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// 7. Start Server and Initialize DB
async function bootstrap() {
  await initializeDatabase();

  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🍌 Banana Game Enterprise Server Running on Port ${config.port}`);
    console.log(`🔗 REST API: http://localhost:${config.port}/api/health`);
    console.log(`🔐 Virtual Identity & Anti-Cheat Proxy Activated`);
    console.log(`====================================================`);
  });

  return server;
}

bootstrap();

module.exports = app;
