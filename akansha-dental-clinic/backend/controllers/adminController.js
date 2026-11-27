const bcrypt = require('bcryptjs');
const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { success, error } = require('../utils/responseHelper');
const { logAuditEvent } = require('../services/auditService');

/**
 * Get all administrators and clinical staff
 * GET /api/v1/admins
 */
const getAdmins = async (req, res, next) => {
  try {
    // 1. Authoritative MySQL Read
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT id, full_name, username, email, phone, role, is_active, created_at FROM admins ORDER BY id ASC');
        const list = (rows || []).map(a => ({
          id: a.id,
          userId: a.id,
          username: a.username,
          email: a.email,
          fullName: a.full_name || a.username,
          phone: a.phone || '',
          role: a.role,
          roles: a.role === 'SUPER_ADMIN' ? ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] : ['ROLE_STAFF'],
          isActive: Boolean(a.is_active),
          active: Boolean(a.is_active),
          mustChangePassword: false,
          createdAt: a.created_at
        }));
        return success(res, list, 'Admin user list retrieved from MySQL database.');
      } catch (dbErr) {
        console.warn('MySQL getAdmins error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const list = store.admins.map(a => ({
      id: a.id,
      userId: a.id,
      username: a.username,
      email: a.email,
      fullName: a.fullName || a.full_name,
      phone: a.phone || '',
      role: a.role,
      roles: a.roles || [a.role === 'SUPER_ADMIN' ? 'ROLE_SUPER_ADMIN' : 'ROLE_STAFF'],
      isActive: a.is_active !== undefined ? a.is_active : true,
      active: a.is_active !== undefined ? a.is_active : true,
      mustChangePassword: Boolean(a.mustChangePassword || a.must_change_password),
      createdAt: a.created_at || a.createdAt || new Date().toISOString()
    }));
    return success(res, list, 'Admin user list retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin creates a new Admin or Staff account
 * POST /api/v1/admins
 */
const createAdmin = async (req, res, next) => {
  try {
    const { username, email, password, fullName, phone, role, roles } = req.body;
    if (!username || !email || !password) {
      return error(res, 'Username, email, and temporary password are required.', 400);
    }

    const cleanUser = username.trim();
    const cleanEmail = email.trim();
    const cleanName = (fullName || username).trim();
    const cleanPhone = phone ? phone.trim() : '';

    const assignedRoles = roles || [role || 'ROLE_STAFF'];
    const primaryRole = assignedRoles.includes('ROLE_SUPER_ADMIN') 
      ? 'SUPER_ADMIN' 
      : (assignedRoles.includes('ROLE_ADMIN') ? 'ADMIN' : 'STAFF');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password.trim(), salt);

    // 1. Authoritative MySQL Insert
    if (getIsDbConnected()) {
      try {
        const existing = await query('SELECT id FROM admins WHERE username = ? OR email = ? LIMIT 1', [cleanUser, cleanEmail]);
        if (existing && existing.length > 0) {
          return error(res, 'A user with this username or email already exists in MySQL.', 409);
        }

        const result = await query(
          'INSERT INTO admins (full_name, username, email, password_hash, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
          [cleanName, cleanUser, cleanEmail, passwordHash, cleanPhone, primaryRole]
        );

        await logAuditEvent({
          actor: req.user?.username || 'SUPER_ADMIN',
          action: 'STAFF_PROVISIONED',
          resource: 'STAFF_MANAGEMENT',
          ipAddress: req.ip,
          details: `New staff account provisioned in MySQL for ${cleanName} (${cleanEmail}) with role ${primaryRole}`
        });

        const newAdminRecord = {
          id: result.insertId,
          username: cleanUser,
          email: cleanEmail,
          fullName: cleanName,
          phone: cleanPhone,
          role: primaryRole,
          roles: assignedRoles,
          active: true,
          mustChangePassword: true,
          createdAt: new Date().toISOString()
        };

        return success(res, newAdminRecord, `Staff account for ${cleanName} created in MySQL database.`, 201);
      } catch (dbErr) {
        console.warn('MySQL createAdmin error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const existing = store.admins.find(
      a => a.username.toLowerCase() === cleanUser.toLowerCase() || 
           a.email.toLowerCase() === cleanEmail.toLowerCase()
    );
    if (existing) {
      return error(res, 'A user with this username or email already exists.', 409);
    }

    const newId = store.admins.length > 0 ? Math.max(...store.admins.map(a => a.id)) + 1 : 1;

    const newAdmin = {
      id: newId,
      userId: newId,
      username: cleanUser,
      email: cleanEmail,
      password_hash: passwordHash,
      fullName: cleanName,
      full_name: cleanName,
      phone: cleanPhone,
      role: primaryRole,
      roles: assignedRoles,
      is_active: true,
      active: true,
      mustChangePassword: true,
      must_change_password: true,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    store.admins.push(newAdmin);
    saveStore();

    await logAuditEvent({
      actor: req.user?.username || 'SUPER_ADMIN',
      action: 'STAFF_PROVISIONED',
      resource: 'STAFF_MANAGEMENT',
      ipAddress: req.ip,
      details: `New staff account provisioned for ${newAdmin.fullName} (${newAdmin.email}) with role ${primaryRole}`
    });

    const result = {
      id: newAdmin.id,
      username: newAdmin.username,
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      phone: newAdmin.phone,
      role: newAdmin.role,
      roles: newAdmin.roles,
      active: true,
      mustChangePassword: true,
      createdAt: newAdmin.createdAt
    };

    return success(res, result, `Staff account for ${newAdmin.fullName} created.`, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin toggles account status (Active / Locked)
 * PUT /api/v1/admins/:id/status
 */
const updateAdminStatus = async (req, res, next) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const { active } = req.body;
    const currentUserId = req.user?.id || req.user?.userId;

    if (adminId === currentUserId) {
      return error(res, 'You cannot deactivate your own administrative account.', 400);
    }

    // 1. Authoritative MySQL Update
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT * FROM admins WHERE id = ? LIMIT 1', [adminId]);
        if (!rows || rows.length === 0) return error(res, 'Staff account not found.', 404);

        const admin = rows[0];
        if (admin.role === 'SUPER_ADMIN' && admin.id === 1) {
          return error(res, 'Primary Super Administrator account cannot be locked.', 400);
        }

        await query('UPDATE admins SET is_active = ? WHERE id = ?', [Boolean(active), adminId]);

        await logAuditEvent({
          actor: req.user?.username || 'SUPER_ADMIN',
          action: 'STAFF_STATUS_UPDATED',
          resource: 'STAFF_MANAGEMENT',
          ipAddress: req.ip,
          details: `Account #${adminId} status set to ${Boolean(active) ? 'ACTIVE' : 'LOCKED'} in MySQL`
        });

        return success(res, { id: adminId, active: Boolean(active), is_active: Boolean(active) }, `Account status updated in MySQL.`);
      } catch (dbErr) {
        console.warn('MySQL updateAdminStatus error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const admin = store.admins.find(a => a.id === adminId);
    if (!admin) {
      return error(res, 'Staff account not found.', 404);
    }

    if (admin.role === 'SUPER_ADMIN' && admin.id === 1) {
      return error(res, 'Primary Super Administrator account cannot be locked.', 400);
    }

    admin.is_active = Boolean(active);
    admin.active = Boolean(active);
    admin.updated_at = new Date().toISOString();
    saveStore();

    await logAuditEvent({
      actor: req.user?.username || 'SUPER_ADMIN',
      action: 'STAFF_STATUS_UPDATED',
      resource: 'STAFF_MANAGEMENT',
      ipAddress: req.ip,
      details: `Account for ${admin.fullName || admin.username} status set to ${admin.is_active ? 'ACTIVE' : 'LOCKED'}`
    });

    return success(res, {
      id: admin.id,
      active: admin.is_active,
      is_active: admin.is_active
    }, `Account status updated.`);
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin resets staff member's password
 * POST /api/v1/admins/:id/reset-password
 */
const resetAdminPassword = async (req, res, next) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 8) {
      return error(res, 'New temporary password must be at least 8 characters long.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword.trim(), salt);

    // 1. Authoritative MySQL Update
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT * FROM admins WHERE id = ? LIMIT 1', [adminId]);
        if (!rows || rows.length === 0) return error(res, 'Staff account not found.', 404);

        await query('UPDATE admins SET password_hash = ? WHERE id = ?', [passwordHash, adminId]);

        await logAuditEvent({
          actor: req.user?.username || 'SUPER_ADMIN',
          action: 'STAFF_PASSWORD_RESET',
          resource: 'STAFF_MANAGEMENT',
          ipAddress: req.ip,
          details: `Password reset in MySQL for staff account #${adminId}`
        });

        return success(res, { id: adminId }, 'Staff member password reset successfully in MySQL.');
      } catch (dbErr) {
        console.warn('MySQL resetAdminPassword error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const admin = store.admins.find(a => a.id === adminId);
    if (!admin) {
      return error(res, 'Staff account not found.', 404);
    }

    admin.password_hash = passwordHash;
    admin.mustChangePassword = true;
    admin.must_change_password = true;
    admin.updated_at = new Date().toISOString();
    saveStore();

    await logAuditEvent({
      actor: req.user?.username || 'SUPER_ADMIN',
      action: 'STAFF_PASSWORD_RESET',
      resource: 'STAFF_MANAGEMENT',
      ipAddress: req.ip,
      details: `Password reset by Super Admin for ${admin.fullName || admin.username}`
    });

    return success(res, { id: admin.id }, `Password reset successfully for ${admin.fullName || admin.username}.`);
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin deletes a staff member account
 * DELETE /api/v1/admins/:id
 */
const deleteAdmin = async (req, res, next) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const currentUserId = req.user?.id || req.user?.userId;

    if (adminId === currentUserId) {
      return error(res, 'You cannot delete your own administrative account.', 400);
    }

    if (adminId === 1) {
      return error(res, 'Primary Super Administrator account cannot be deleted.', 400);
    }

    // 1. Authoritative MySQL Delete
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT * FROM admins WHERE id = ? LIMIT 1', [adminId]);
        if (!rows || rows.length === 0) return error(res, 'Staff account not found.', 404);

        if (rows[0].role === 'SUPER_ADMIN') {
          return error(res, 'Super Administrator accounts cannot be deleted.', 400);
        }

        await query('DELETE FROM admins WHERE id = ?', [adminId]);

        await logAuditEvent({
          actor: req.user?.username || 'SUPER_ADMIN',
          action: 'STAFF_DELETED',
          resource: 'STAFF_MANAGEMENT',
          ipAddress: req.ip,
          details: `Staff account #${adminId} deleted from MySQL`
        });

        return success(res, null, `Staff account removed from MySQL database.`);
      } catch (dbErr) {
        console.warn('MySQL deleteAdmin error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const adminIndex = store.admins.findIndex(a => a.id === adminId);
    if (adminIndex === -1) {
      return error(res, 'Staff account not found.', 404);
    }

    const admin = store.admins[adminIndex];
    if (admin.role === 'SUPER_ADMIN') {
      return error(res, 'Super Administrator accounts cannot be deleted.', 400);
    }

    store.admins.splice(adminIndex, 1);
    saveStore();

    await logAuditEvent({
      actor: req.user?.username || 'SUPER_ADMIN',
      action: 'STAFF_DELETED',
      resource: 'STAFF_MANAGEMENT',
      ipAddress: req.ip,
      details: `Staff account for ${admin.fullName || admin.username} (${admin.email}) was permanently removed`
    });

    return success(res, null, `Staff account for ${admin.fullName || admin.username} removed successfully.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdmins,
  createAdmin,
  updateAdminStatus,
  resetAdminPassword,
  deleteAdmin
};
