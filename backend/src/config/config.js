require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_banana_jwt_enterprise_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bananaApiUrl: process.env.BANANA_API_URL || 'https://marcconrad.com/uob/banana/api.php?out=json',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'banana_game_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
};
