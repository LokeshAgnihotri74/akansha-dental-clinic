const bcrypt = require('bcryptjs');
const { getStore, saveStore } = require('../database/store');
const { success, error } = require('../utils/responseHelper');
const { logAuditEvent } = require('../services/auditService');

/**
 * Get all administrators and clinical staff
 * GET /api/v1/admins
 */
const getAdmins = async (req, res, next) => {
  try {
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
 * Enforces temporary password & mustChangePassword on first login!
 */
const createAdmin = async (req, res, next) => {
  try {
    const { username, email, password, fullName, phone, role, roles } = req.body;
    if (!username || !email || !password) {
      return error(res, 'Username, email, and temporary password are required.', 400);
    }

    const store = getStore();
    const existing = store.admins.find(
      a => a.username.toLowerCase() === username.toLowerCase() || 
           a.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return error(res, 'A user with this username or email already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password.trim(), salt);
    const newId = store.admins.length > 0 ? Math.max(...store.admins.map(a => a.id)) + 1 : 1;

    const assignedRoles = roles || [role || 'ROLE_STAFF'];
    const primaryRole = assignedRoles.includes('ROLE_SUPER_ADMIN') 
      ? 'SUPER_ADMIN' 
      : (assignedRoles.includes('ROLE_ADMIN') ? 'ADMIN' : 'STAFF');

    const newAdmin = {
      id: newId,
      userId: newId,
      username: username.trim(),
      email: email.trim(),
      password_hash: passwordHash,
      fullName: (fullName || username).trim(),
      full_name: (fullName || username).trim(),
      phone: phone ? phone.trim() : '',
      role: primaryRole,
      roles: assignedRoles,
      is_active: true,
      active: true,
      mustChangePassword: true, // MANDATORY: Force password change on first login!
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

    return success(res, result, `Staff account for ${newAdmin.fullName} created. User will be forced to set their new password upon first login.`, 201);
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
    const currentUserId = req.user.id || req.user.userId;

    if (adminId === currentUserId) {
      return error(res, 'You cannot deactivate your own administrative account.', 400);
    }

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
      username: admin.username,
      active: admin.is_active
    }, `Account status updated to ${admin.is_active ? 'ACTIVE' : 'LOCKED'}.`);
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin resets an admin's password and forces change
 * PUT /api/v1/admins/:id/reset-password
 */
const resetAdminPassword = async (req, res, next) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const { tempPassword } = req.body;

    if (!tempPassword || tempPassword.trim().length < 6) {
      return error(res, 'Temporary password must be at least 6 characters.', 400);
    }

    const store = getStore();
    const admin = store.admins.find(a => a.id === adminId);
    if (!admin) {
      return error(res, 'Account not found.', 404);
    }

    const salt = await bcrypt.genSalt(10);
    admin.password_hash = await bcrypt.hash(tempPassword.trim(), salt);
    admin.mustChangePassword = true;
    admin.must_change_password = true;
    admin.updated_at = new Date().toISOString();
    saveStore();

    await logAuditEvent({
      actor: req.user?.username || 'SUPER_ADMIN',
      action: 'STAFF_PASSWORD_RESET',
      resource: 'STAFF_MANAGEMENT',
      ipAddress: req.ip,
      details: `Temporary password assigned to ${admin.fullName || admin.username} (forced first-login change active)`
    });

    return success(res, {
      id: admin.id,
      username: admin.username,
      mustChangePassword: true
    }, `Temporary password assigned. User must change password upon next login.`);
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin deletes an admin/staff account
 * DELETE /api/v1/admins/:id
 */
const deleteAdmin = async (req, res, next) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const currentUserId = req.user.id || req.user.userId;

    if (adminId === currentUserId) {
      return error(res, 'You cannot delete your own active session account.', 400);
    }

    const store = getStore();
    const index = store.admins.findIndex(a => a.id === adminId);
    if (index === -1) {
      return error(res, 'Account not found.', 404);
    }

    if (store.admins[index].id === 1) {
      return error(res, 'Cannot delete the primary root Super Admin account.', 400);
    }

    const deleted = store.admins.splice(index, 1)[0];
    saveStore();

    await logAuditEvent({
      actor: req.user?.username || 'SUPER_ADMIN',
      action: 'STAFF_DELETED',
      resource: 'STAFF_MANAGEMENT',
      ipAddress: req.ip,
      details: `Revoked access and deleted account for ${deleted.fullName || deleted.username}`
    });

    return success(res, { id: deleted.id }, `Account for ${deleted.fullName || deleted.username} removed.`);
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
