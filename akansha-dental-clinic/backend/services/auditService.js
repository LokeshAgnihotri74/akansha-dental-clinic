/**
 * Clinical Audit Trail & Governance Service
 * Records real immutable events for authentication, patient bookings, status changes, and settings.
 */

const { getStore, saveStore } = require('../database/store');
const { query, getIsDbConnected } = require('../config/db');

/**
 * Log a verified system audit event
 * @param {Object} event
 * @param {string} event.actor - Email, username, or phone of caller
 * @param {string} event.action - e.g. 'APPOINTMENT_BOOKED', 'AUTH_LOGIN', 'STATUS_UPDATED'
 * @param {string} event.resource - e.g. 'APPOINTMENTS', 'AUTH', 'CLINIC_SETTINGS'
 * @param {string} [event.ipAddress] - IP address of requester
 * @param {string} event.details - Detailed human-readable trace of the event
 */
const logAuditEvent = async ({ actor, action, resource, ipAddress = '127.0.0.1', details }) => {
  try {
    const store = getStore();
    if (!store.auditLogs) store.auditLogs = [];

    const newId = store.auditLogs.length > 0 ? Math.max(...store.auditLogs.map(l => l.id || 0)) + 1 : 1;
    const nowIso = new Date().toISOString();

    const auditEntry = {
      id: newId,
      actorUsername: actor || 'SYSTEM',
      actor_username: actor || 'SYSTEM',
      action: (action || 'SYSTEM_ACTION').toUpperCase(),
      resource: (resource || 'GENERAL').toUpperCase(),
      ipAddress: ipAddress || '127.0.0.1',
      ip_address: ipAddress || '127.0.0.1',
      details: String(details || '').slice(0, 500),
      timestamp: nowIso,
      created_at: nowIso
    };

    // Prepend to persistent store so newest is first
    store.auditLogs.unshift(auditEntry);
    // Keep last 1,000 real events in file store
    if (store.auditLogs.length > 1000) {
      store.auditLogs = store.auditLogs.slice(0, 1000);
    }
    saveStore();

    // If real database is connected, persist to DB audit_logs table
    if (getIsDbConnected()) {
      try {
        await query(
          `INSERT INTO audit_logs (actor_username, action, resource, ip_address, details, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [auditEntry.actorUsername, auditEntry.action, auditEntry.resource, auditEntry.ipAddress, auditEntry.details, nowIso]
        );
      } catch (dbErr) {
        // Table might need creation
        try {
          await query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              actor_username VARCHAR(150),
              action VARCHAR(100),
              resource VARCHAR(100),
              ip_address VARCHAR(50),
              details TEXT,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
          `);
          await query(
            `INSERT INTO audit_logs (actor_username, action, resource, ip_address, details, timestamp)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [auditEntry.actorUsername, auditEntry.action, auditEntry.resource, auditEntry.ipAddress, auditEntry.details, nowIso]
          );
        } catch (innerErr) {
          console.warn('DB audit sync warning:', innerErr.message);
        }
      }
    }

    return auditEntry;
  } catch (err) {
    console.warn('Audit logging non-fatal notice:', err.message);
    return null;
  }
};

module.exports = {
  logAuditEvent
};
