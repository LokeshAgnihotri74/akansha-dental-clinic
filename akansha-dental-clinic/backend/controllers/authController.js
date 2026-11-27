const bcrypt = require('bcryptjs');
const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { generateToken } = require('../utils/jwtHelper');
const { success, error } = require('../utils/responseHelper');
const { logAuditEvent } = require('../services/auditService');
const { recordFailedLogin, recordSuccessfulLogin } = require('../middleware/authRateLimiter');

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

    const cleanInput = username.trim();
    let user = null;

    // 1. Authoritative MySQL lookup when DB connected
    if (getIsDbConnected()) {
      try {
        const rows = await query(
          'SELECT * FROM admins WHERE (username = ? OR email = ?) AND is_active = TRUE LIMIT 1',
          [cleanInput, cleanInput]
        );
        if (rows && rows.length > 0) {
          user = rows[0];
        }
      } catch (err) {
        console.warn('MySQL lookup error:', err.message);
      }
    }

    // 2. Local memory fallback
    if (!user) {
      const store = getStore();
      user = store.admins.find(
        u => (u.username && u.username.toLowerCase() === cleanInput.toLowerCase()) ||
             (u.email && u.email.toLowerCase() === cleanInput.toLowerCase())
      );
    }

    if (!user) {
      recordFailedLogin(req);
      return error(res, 'Invalid email/username or password.', 401);
    }

    // Check if account is locked / inactive
    if (user.is_active === false || user.active === false) {
      recordFailedLogin(req);
      return error(res, 'Invalid email/username or password.', 401);
    }

    // Verify Password Hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      recordFailedLogin(req);
      return error(res, 'Invalid email/username or password.', 401);
    }

    // Clear failed login counter on successful authentication
    recordSuccessfulLogin(req);

    const roles = user.roles || (user.role === 'SUPER_ADMIN' ? ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] : ['ROLE_STAFF']);
    const mustChangePassword = Boolean(user.mustChangePassword || user.must_change_password);

    // Generate JWT Token
    const token = generateToken({
      id: user.id || user.userId,
      userId: user.id || user.userId,
      username: user.username,
      email: user.email,
      fullName: user.full_name || user.fullName,
      role: user.role,
      roles: roles,
      mustChangePassword: mustChangePassword
    });

    const userPayload = {
      id: user.id || user.userId,
      userId: user.id || user.userId,
      fullName: user.full_name || user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      roles: roles,
      phone: user.phone || '',
      mustChangePassword: mustChangePassword
    };

    // Audit Login Event
    await logAuditEvent({
      actor: user.email || user.username,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: 'AUTH',
      ipAddress: req.ip,
      details: `User ${user.full_name || user.fullName || user.username} logged in successfully (${roles.join(', ')})`
    });

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
      mustChangePassword: mustChangePassword,
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

    // 1. Authoritative MySQL Read
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT id, full_name, username, email, phone, role, is_active FROM admins WHERE id = ? LIMIT 1', [u.id || u.userId]);
        if (rows && rows.length > 0) {
          const fresh = rows[0];
          const roles = fresh.role === 'SUPER_ADMIN' ? ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] : ['ROLE_STAFF'];
          return success(res, {
            id: fresh.id,
            userId: fresh.id,
            username: fresh.username,
            email: fresh.email,
            fullName: fresh.full_name || fresh.username,
            phone: fresh.phone || '',
            role: fresh.role,
            roles: roles,
            mustChangePassword: false
          }, 'User profile retrieved from MySQL.');
        }
      } catch (dbErr) {
        console.warn('MySQL getMe error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const freshUser = store.admins.find(a => (a.id === u.id || a.userId === u.userId || a.email === u.email));

    const roles = freshUser?.roles || u.roles || (u.role === 'SUPER_ADMIN' ? ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] : ['ROLE_STAFF']);
    const mustChangePassword = freshUser ? Boolean(freshUser.mustChangePassword || freshUser.must_change_password) : Boolean(u.mustChangePassword);

    const profile = {
      id: u.id || u.userId,
      userId: u.id || u.userId,
      username: freshUser?.username || u.username,
      email: freshUser?.email || u.email,
      fullName: freshUser?.fullName || freshUser?.full_name || u.fullName || u.username,
      phone: freshUser?.phone || u.phone || '',
      role: freshUser?.role || u.role,
      roles: roles,
      mustChangePassword: mustChangePassword
    };

    return success(res, profile, 'User profile retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Change Password (Force on First Login or On-Demand)
 * POST /api/v1/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id || req.user.userId;

    if (!newPassword || newPassword.trim().length < 6) {
      return error(res, 'New password must be at least 6 characters long.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword.trim(), salt);

    // 1. Authoritative MySQL Update
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT * FROM admins WHERE id = ? LIMIT 1', [userId]);
        if (!rows || rows.length === 0) return error(res, 'User account not found.', 404);

        const user = rows[0];
        if (currentPassword) {
          const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
          if (!isMatch) {
            return error(res, 'Current password verification failed.', 400);
          }
        }

        await query('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, userId]);

        await logAuditEvent({
          actor: user.email || user.username,
          action: 'AUTH_PASSWORD_CHANGED',
          resource: 'AUTH',
          ipAddress: req.ip,
          details: `Password changed for user ${user.full_name || user.username} in MySQL database`
        });

        return success(res, {
          userId,
          email: user.email,
          mustChangePassword: false
        }, 'Password changed successfully in MySQL database. Your account is secured.');
      } catch (dbErr) {
        console.warn('MySQL changePassword error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const user = store.admins.find(u => (u.id === userId || u.userId === userId));

    if (!user) {
      return error(res, 'User account not found.', 404);
    }

    const isFirstLogin = Boolean(user.mustChangePassword || user.must_change_password);
    if (!isFirstLogin && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return error(res, 'Current password verification failed.', 400);
      }
    }

    user.password_hash = newHash;
    user.mustChangePassword = false;
    user.must_change_password = false;
    user.updated_at = new Date().toISOString();
    saveStore();

    await logAuditEvent({
      actor: user.email || user.username,
      action: 'AUTH_PASSWORD_CHANGED',
      resource: 'AUTH',
      ipAddress: req.ip,
      details: `Password changed for user ${user.fullName || user.username}`
    });

    return success(res, {
      userId: user.id || user.userId,
      email: user.email,
      mustChangePassword: false
    }, 'Password changed successfully. Your account is now secured.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getMe,
  changePassword
};
