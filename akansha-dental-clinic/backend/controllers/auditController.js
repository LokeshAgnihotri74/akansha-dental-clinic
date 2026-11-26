const { getStore, saveStore } = require('../database/store');
const { success } = require('../utils/responseHelper');

const DEFAULT_AUDIT_LOGS = [
  {
    id: 1,
    actorUsername: 'admin@akanshadental.com',
    action: 'SYSTEM_BOOTSTRAP',
    resource: 'CORE_DATABASE',
    ipAddress: '127.0.0.1',
    details: 'System initialized with dual-mode persistent JSON & MySQL engine.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 2,
    actorUsername: 'admin@akanshadental.com',
    action: 'CATALOG_SYNC',
    resource: 'SERVICES_REGISTRY',
    ipAddress: '127.0.0.1',
    details: 'Expanded specialized dental treatments to 12 production procedures.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 3,
    actorUsername: 'admin@akanshadental.com',
    action: 'ROSTER_UPDATE',
    resource: 'DOCTORS_FACULTY',
    ipAddress: '127.0.0.1',
    details: 'Synchronized weekly morning & evening clinical OPD timings for dental surgeons.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 4,
    actorUsername: 'staff@akanshadental.com',
    action: 'INQUIRY_REVIEW',
    resource: 'PATIENT_LEADS',
    ipAddress: '127.0.0.1',
    details: 'Automated SMS dispatch triggered for incoming patient contact request.',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

const getAuditLogs = async (req, res, next) => {
  try {
    const store = getStore();
    if (!store.auditLogs) {
      store.auditLogs = DEFAULT_AUDIT_LOGS;
      saveStore();
    }

    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 20;

    const list = store.auditLogs || DEFAULT_AUDIT_LOGS;
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
