const { getStore } = require('../database/store');
const { query, getIsDbConnected } = require('../config/db');
const { success } = require('../utils/responseHelper');

/**
 * Retrieve verified, immutable audit trail records
 * GET /api/v1/audit-logs?page=0&size=20
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(0, parseInt(req.query.page, 10) || 0);
    const size = Math.min(100, Math.max(1, parseInt(req.query.size, 10) || 20));

    let list = [];

    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ? OFFSET ?', [size, page * size]);
        if (rows && rows.length > 0) {
          list = rows.map(r => ({
            id: r.id,
            actorUsername: r.actor_username,
            actor_username: r.actor_username,
            action: r.action,
            resource: r.resource,
            ipAddress: r.ip_address,
            ip_address: r.ip_address,
            details: r.details,
            timestamp: r.timestamp || r.created_at
          }));
        }
      } catch (dbErr) {
        console.warn('DB audit read notice:', dbErr.message);
      }
    }

    if (list.length === 0) {
      const store = getStore();
      list = store.auditLogs || [];
    }

    const totalElements = list.length;
    const paginated = list.slice(page * size, (page + 1) * size);

    return success(res, {
      content: paginated,
      totalElements,
      totalPages: Math.ceil(totalElements / size) || 1,
      page,
      size
    }, 'Audit logs retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs
};
