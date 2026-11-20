const bcrypt = require('bcryptjs');
const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { generateToken } = require('../utils/jwtHelper');
const { success, error } = require('../utils/responseHelper');

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

    const store = getStore();
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
        console.warn('MySQL lookup failed, falling back to persistent store:', err.message);
      }
    }

    if (!user) {
      user = store.admins.find(
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

    const roles = user.roles || (user.role === 'SUPER_ADMIN' ? ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] : ['ROLE_STAFF']);

    // Generate JWT Token
    const token = generateToken({
      id: user.id || user.userId,
      userId: user.id || user.userId,
      username: user.username,
      email: user.email,
      fullName: user.full_name || user.fullName,
      role: user.role,
      roles: roles
    });

    const userPayload = {
      id: user.id || user.userId,
      userId: user.id || user.userId,
      fullName: user.full_name || user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      roles: roles,
      phone: user.phone
    };

    // Return format explicitly supporting AuthContext.jsx:
    // res.data.accessToken, res.data.userId, res.data.roles, res.data.fullName
    return success(res, {
      accessToken: token,
      token: token,
      userId: userPayload.userId,
      id: userPayload.id,
      fullName: userPayload.fullName,
      username: userPayload.username,
      email: userPayload.email,
      role: userPayload.role,
      roles: userPayload.roles,
      user: userPayload
    }, 'Clinical authentication successful.');
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
    const u = req.user;
    const roles = u.roles || (u.role === 'SUPER_ADMIN' ? ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] : ['ROLE_STAFF']);

    const profile = {
      id: u.id || u.userId,
      userId: u.id || u.userId,
      username: u.username,
      email: u.email,
      fullName: u.fullName || u.username,
      role: u.role,
      roles: roles
    };

    return success(res, profile, 'User profile retrieved.');
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
