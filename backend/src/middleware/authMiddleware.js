const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Authentication Middleware: Protects endpoints by verifying Virtual Identity.
 * Decodes signed JSON Web Token (JWT) and binds user context to the request.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract 'Bearer <token>'

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: You must be logged in to play the Banana Game and submit scores.'
    });
  }

  try {
    const verifiedUser = jwt.verify(token, config.jwtSecret);
    req.user = verifiedUser;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
}

module.exports = authenticateToken;
