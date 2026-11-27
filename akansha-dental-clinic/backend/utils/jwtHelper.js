const jwt = require('jsonwebtoken');

// Strictly enforce JWT_SECRET requirement — refuse to operate with missing or weak secrets
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 32) {
  throw new Error('JWT_SECRET required and must be at least 32 characters long');
}

const JWT_SECRET = process.env.JWT_SECRET.trim();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
