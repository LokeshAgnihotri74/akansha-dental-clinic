const bcrypt = require('bcryptjs');
const { getStore, saveStore } = require('../database/store');
const { success, error } = require('../utils/responseHelper');

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
      createdAt: a.created_at || a.createdAt || new Date().toISOString()
    }));
    return success(res, list, 'Admin user list retrieved.');
  } catch (err) {
    next(err);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const { username, email, password, fullName, phone, role, roles } = req.body;
    if (!username || !email || !password) {
      return error(res, 'Username, email, and password are required.', 400);
    }

    const store = getStore();
    const existing = store.admins.find(a => a.username.toLowerCase() === username.toLowerCase() || a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return error(res, 'User with this username or email already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newId = store.admins.length > 0 ? Math.max(...store.admins.map(a => a.id)) + 1 : 1;

    const assignedRoles = roles || [role || 'ROLE_STAFF'];
    const primaryRole = assignedRoles.includes('ROLE_SUPER_ADMIN') ? 'SUPER_ADMIN' : (assignedRoles.includes('ROLE_ADMIN') ? 'ADMIN' : 'STAFF');

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
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    store.admins.push(newAdmin);
    saveStore();

    const result = {
      id: newAdmin.id,
      username: newAdmin.username,
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      phone: newAdmin.phone,
      roles: newAdmin.roles,
      active: true,
      createdAt: newAdmin.createdAt
    };

    return success(res, result, `User ${newAdmin.username} created successfully.`, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdmins,
  createAdmin
};
