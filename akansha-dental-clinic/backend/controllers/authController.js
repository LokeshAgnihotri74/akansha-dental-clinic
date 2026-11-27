const bcrypt = require('bcryptjs');
const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { generateToken } = require('../utils/jwtHelper');
const { success, error } = require('../utils/responseHelper');
const { logAuditEvent } = require('../services/auditService');

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
        u => (u.username && u.username.toLowerCase() === username.trim().toLowerCase()) ||
             (u.email && u.email.toLowerCase() === username.trim().toLowerCase())
      );
    }

    if (!user) {
      return error(res, 'Invalid credentials. User account not found.', 401);
    }

    // Check if account is locked / inactive
    if (user.is_active === false || user.active === false) {
      return error(res, 'This account has been deactivated. Please contact the Super Administrator.', 403);
    }

    // Verify Password Hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return error(res, 'Invalid password. Please check your credentials.', 401);
    }

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
      details: `User ${user.fullName || user.username} logged in successfully (${roles.join(', ')})`
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

    const store = getStore();
    const user = store.admins.find(u => (u.id === userId || u.userId === userId));

    if (!user) {
      return error(res, 'User account not found.', 404);
    }

    // Verify current password only if account is not in forced first-login reset mode
    const isFirstLogin = Boolean(user.mustChangePassword || user.must_change_password);
    if (!isFirstLogin && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return error(res, 'Current password verification failed.', 400);
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword.trim(), salt);

    user.password_hash = newHash;
    user.mustChangePassword = false;
    user.must_change_password = false;
    user.updated_at = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    if (getIsDbConnected()) {
      try {
        await query(
          'UPDATE admins SET password_hash = ?, is_active = TRUE WHERE id = ?',
          [newHash, userId]
        );
      } catch (dbErr) {
        console.warn('MySQL password update sync warning:', dbErr.message);
      }
    }

    saveStore();

    // Audit Login Event
    await logAuditEvent({
      actor: user.email || user.username,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: 'AUTH',
      ipAddress: req.ip,
      details: `User ${user.fullName || user.username} logged in successfully (${roles.join(', ')})`
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

/**
 * Update Profile (Self Super Admin / Admin profile)
 * PUT /api/v1/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { email, fullName, phone } = req.body;
    const userId = req.user.id || req.user.userId;

    const store = getStore();
    const user = store.admins.find(u => (u.id === userId || u.userId === userId));

    if (!user) {
      return error(res, 'User account not found.', 404);
    }

    if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const existing = store.admins.find(
        u => (u.id !== userId && u.userId !== userId) &&
             u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (existing) {
        return error(res, 'Email address is already registered to another account.', 409);
      }
      user.email = email.trim();
      user.username = email.trim();
    }

    if (fullName) {
      user.fullName = fullName.trim();
      user.full_name = fullName.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    user.updated_at = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    saveStore();

    // Audit Login Event
    await logAuditEvent({
      actor: user.email || user.username,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: 'AUTH',
      ipAddress: req.ip,
      details: `User ${user.fullName || user.username} logged in successfully (${roles.join(', ')})`
    });

    return success(res, {
      id: user.id || user.userId,
      userId: user.id || user.userId,
      username: user.username,
      email: user.email,
      fullName: user.fullName || user.full_name,
      phone: user.phone,
      role: user.role,
      roles: user.roles,
      mustChangePassword: Boolean(user.mustChangePassword)
    }, 'Account profile updated successfully.');
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
  changePassword,
  updateProfile,
  logout
};
