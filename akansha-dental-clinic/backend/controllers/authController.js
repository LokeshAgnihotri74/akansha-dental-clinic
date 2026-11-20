const bcrypt = require('bcryptjs');
const { query, getIsDbConnected } = require('../config/db');
const { generateToken } = require('../utils/jwtHelper');
const { success, error } = require('../utils/responseHelper');

// In-memory fallback accounts for zero-friction local testing
const FALLBACK_USERS = [
  {
    id: 1,
    full_name: 'Dr. Akansha Sharma (Chief Director)',
    username: 'admin@akanshadental.com',
    email: 'admin@akanshadental.com',
    password_hash: '$2a$10$BZ84NEU2/k9UsF3OsHzlHOJoNFslGOO3g8tdRLmSy2umfBuACM0Li', // password123
    role: 'SUPER_ADMIN',
    phone: '+91 8130 406 405'
  },
  {
    id: 2,
    full_name: 'Rohan Verma (Front Desk Staff)',
    username: 'rohan@akanshadental.com',
    email: 'rohan@akanshadental.com',
    password_hash: '$2a$10$BZ84NEU2/k9UsF3OsHzlHOJoNFslGOO3g8tdRLmSy2umfBuACM0Li', // password123
    role: 'STAFF',
    phone: '+91 9876 543 210'
  }
];

/**
 * Admin & Staff Login Handler
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return error(res, 'Please provide both username/email and password.', 400);
    }

    let user = null;

    if (getIsDbConnected()) {
      try {
        const rows = await query(
          'SELECT * FROM admins WHERE (username = ? OR email = ?) AND is_active = TRUE LIMIT 1',
          [username.trim(), username.trim()]
        );
        if (rows && rows.length > 0) {
          user = rows[0];
        }
      } catch (err) {
        console.warn('MySQL lookup failed, falling back to memory accounts:', err.message);
      }
    }

    // Fallback if MySQL offline or user not found in DB
    if (!user) {
      user = FALLBACK_USERS.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase() ||
             u.email.toLowerCase() === username.trim().toLowerCase()
      );
    }

    if (!user) {
      return error(res, 'Invalid credentials. User account not found.', 401);
    }

    // Verify Password Hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return error(res, 'Invalid password. Please check your credentials.', 401);
    }

    // Generate JWT Token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    });

    const userPayload = {
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    return success(res, { token, user: userPayload }, 'Clinical authentication successful.');
  } catch (err) {
    next(err);
  }
};

/**
 * Get Authenticated User Profile
 * GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    return success(res, { user: req.user }, 'User profile retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Logout
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    return success(res, null, 'Session terminated successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getMe,
  logout
};
