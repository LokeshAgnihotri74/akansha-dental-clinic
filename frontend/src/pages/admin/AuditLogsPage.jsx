import React, { useEffect, useState } from 'react';
import {
  FileText,
  RefreshCw,
  ShieldAlert,
  User,
  Globe,
  Clock
} from 'lucide-react';
import adminService from '../../services/adminService';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

export default function AuditLogsPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs({ page, size: 20 });
      if (res?.data) {
        setLogs(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load system audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>
            System Security & Audit Trail
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Immutable administrative records capturing logins, configuration mutations, and patient record modifications.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fff',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#0A2540',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Logs
        </button>
      </div>

      {/* Logs Table */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Operator</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Target Entity</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>IP Address</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Details / Trace</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Spinner message="Loading audit trail entries..." />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    No audit log entries recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#0A2540' }}>
                      {log.adminUsername || 'SYSTEM'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: log.action?.includes('LOGIN') ? '#DEF7EC' : log.action?.includes('DELETE') ? '#FEE2E2' : '#EFF6FF',
                        color: log.action?.includes('LOGIN') ? '#0E9F6E' : log.action?.includes('DELETE') ? '#DC2626' : '#2563EB',
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#475569' }}>
                      {log.entityType ? `${log.entityType} #${log.entityId || ''}` : '—'}
                    </td>
                    <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.82rem' }}>
                      <code>{log.ipAddress || '127.0.0.1'}</code>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.82rem' }}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Showing {logs.length} of {totalElements} audit log events
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                backgroundColor: page === 0 ? '#F1F5F9' : '#fff',
                fontSize: '0.82rem',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <button
              disabled={(page + 1) * 20 >= totalElements}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                backgroundColor: (page + 1) * 20 >= totalElements ? '#F1F5F9' : '#fff',
                fontSize: '0.82rem',
                cursor: (page + 1) * 20 >= totalElements ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
