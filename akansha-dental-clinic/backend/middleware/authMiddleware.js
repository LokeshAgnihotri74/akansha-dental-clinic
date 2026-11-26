const { verifyToken } = require('../utils/jwtHelper');
const { error } = require('../utils/responseHelper');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Authentication required. No authorization token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return error(res, 'Invalid or expired session token. Please log in again.', 401);
  }

  req.user = decoded;
  next();
};

const requireRole = (...allowedRoles) => {
  const flatRoles = allowedRoles.flat().map(r => String(r).toUpperCase().replace(/^ROLE_/, ''));
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Unauthorized request.', 401);
    }

    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    const userRoles = (req.user.roles || [req.user.role]).map(r => (r || '').toUpperCase().replace(/^ROLE_/, ''));
    const authorized = flatRoles.includes(userRole) || userRoles.some(r => flatRoles.includes(r));

    if (!authorized) {
      return error(res, 'Access denied. You do not have permissions for this action.', 403);
    }

    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  authorizeRoles: requireRole
};
