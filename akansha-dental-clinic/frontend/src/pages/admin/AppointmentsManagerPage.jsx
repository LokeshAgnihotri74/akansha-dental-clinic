import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  User,
  Stethoscope,
  Trash2,
  AlertCircle
} from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import doctorService from '../../services/doctorService';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function AppointmentsManagerPage() {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const canDelete = hasRole(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [statusModalAppt, setStatusModalAppt] = useState(null);
  const [targetStatus, setTargetStatus] = useState('CONFIRMED');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        status: statusFilter || undefined,
        query: searchTerm.trim() || undefined,
        startDate: selectedDate || undefined,
        endDate: selectedDate || undefined,
      };
      const res = await appointmentService.searchAppointments(params);
      if (res?.data) {
        setAppointments(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load appointments roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, statusFilter, selectedDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchAppointments();
  };

  const handleOpenStatusModal = (appt, status) => {
    setStatusModalAppt(appt);
    setTargetStatus(status);
    setStatusNotes('');
  };

  const handleConfirmStatusChange = async (e) => {
    e.preventDefault();
    if (!statusModalAppt) return;
    try {
      setUpdatingStatus(true);
      await appointmentService.updateStatus(statusModalAppt.id, {
        status: targetStatus,
        notes: statusNotes.trim() || `Status updated to ${targetStatus}`
      });
      showToast(`Appointment status updated to ${targetStatus}`, 'success');
      setStatusModalAppt(null);
      fetchAppointments();
    } catch (err) {
      showToast(err.message || 'Status transition failed', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteAppointment = async (id, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete appointment #${code}?`)) return;
    try {
      await appointmentService.deleteAppointment(id);
      showToast(`Appointment #${code} deleted`, 'info');
      fetchAppointments();
    } catch (err) {
      showToast('Could not delete appointment', 'error');
    }
  };

  const statusTabs = [
    { label: 'All Bookings', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>
            Appointments Schedule Manager
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Verify, confirm, reschedule, or cancel patient appointments across all dental specialists.
          </p>
        </div>
        <button
          onClick={fetchAppointments}
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
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(0); }}
            style={{
              border: 'none',
              background: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.88rem',
              fontWeight: statusFilter === tab.value ? 700 : 500,
              color: statusFilter === tab.value ? '#0A2540' : '#64748B',
              backgroundColor: statusFilter === tab.value ? '#E2E8F0' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Date Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          backgroundColor: '#fff',
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          marginBottom: '1.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '0.5rem', minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by patient name, phone, or appointment #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0A2540',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Filter by Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setPage(0); }}
            style={{
              padding: '0.45rem 0.75rem',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          {selectedDate && (
            <button
              onClick={() => { setSelectedDate(''); setPage(0); }}
              style={{
                border: 'none',
                background: 'none',
                color: '#EF4444',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Appointments Data Table */}
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
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Reference</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Patient Details</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Attending Doctor</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Treatment Service</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Date & Slot</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Spinner message="Loading appointment records..." />
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    No appointments match the selected criteria.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontWeight: 800, color: '#0A2540', display: 'block' }}>
                        {appt.appointmentCode || appt.appointmentNumber}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        ID: #{appt.id}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{appt.patientName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{appt.patientPhone}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{appt.doctorName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{appt.doctorSpecialization}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0E9F6E' }}>{appt.serviceName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>₹{appt.servicePrice} • {appt.serviceDurationMinutes}m</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{appt.appointmentDate}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{appt.timeSlot}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge status={appt.status} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedAppt(appt)}
                          title="View Details"
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            color: '#0A2540',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Eye size={14} />
                        </button>

                        {appt.status === 'PENDING' && (
                          <button
                            onClick={() => handleOpenStatusModal(appt, 'CONFIRMED')}
                            title="Confirm Booking"
                            style={{
                              backgroundColor: '#DEF7EC',
                              color: '#0E9F6E',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Confirm
                          </button>
                        )}

                        {appt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleOpenStatusModal(appt, 'COMPLETED')}
                            title="Mark as Completed"
                            style={{
                              backgroundColor: '#DBEAFE',
                              color: '#1E40AF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Complete
                          </button>
                        )}

                        {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleOpenStatusModal(appt, 'CANCELLED')}
                            title="Cancel Booking"
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteAppointment(appt.id, appt.appointmentCode || appt.appointmentNumber)}
                            title="Delete"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              padding: '5px',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total & Pagination */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Showing {appointments.length} of {totalElements} appointments
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
              disabled={(page + 1) * 15 >= totalElements}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                backgroundColor: (page + 1) * 15 >= totalElements ? '#F1F5F9' : '#fff',
                fontSize: '0.82rem',
                cursor: (page + 1) * 15 >= totalElements ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <Modal
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          title={`Appointment Details: ${selectedAppt.appointmentCode || selectedAppt.appointmentNumber}`}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Status Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Current Status</span>
                <Badge status={selectedAppt.status} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Slot</span>
                <strong style={{ color: '#0A2540' }}>{selectedAppt.appointmentDate} @ {selectedAppt.timeSlot}</strong>
              </div>
            </div>

            {/* Patient & Doctor Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0A2540', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <User size={16} color="#00D4B2" />
                  <span>Patient</span>
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{selectedAppt.patientName}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>Phone: {selectedAppt.patientPhone}</div>
                {selectedAppt.patientEmail && (
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Email: {selectedAppt.patientEmail}</div>
                )}
              </div>

              <div style={{ border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0A2540', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <Stethoscope size={16} color="#00D4B2" />
                  <span>Doctor & Care</span>
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{selectedAppt.doctorName}</div>
                <div style={{ fontSize: '0.82rem', color: '#0E9F6E', marginTop: '4px' }}>{selectedAppt.serviceName}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Fee: ₹{selectedAppt.servicePrice}</div>
              </div>
            </div>

            {/* Patient Notes */}
            {selectedAppt.notes && (
              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', display: 'block' }}>Patient Notes:</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#78350F' }}>{selectedAppt.notes}</p>
              </div>
            )}

            {/* Audit History Trail */}
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A2540', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Status Transition Trail
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {(!selectedAppt.statusHistory || selectedAppt.statusHistory.length === 0) ? (
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>No status transitions recorded yet.</div>
                ) : (
                  selectedAppt.statusHistory.map((hist, idx) => (
                    <div key={idx} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <strong>{hist.fromStatus || 'INITIAL'} → {hist.toStatus}</strong>
                        <span style={{ color: '#94A3B8' }}>{new Date(hist.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ color: '#64748B' }}>By: {hist.changedBy} | Note: {hist.notes || 'N/A'}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Transition Action Modal */}
      {statusModalAppt && (
        <Modal
          isOpen={!!statusModalAppt}
          onClose={() => setStatusModalAppt(null)}
          title={`Update Status: ${statusModalAppt.appointmentCode || statusModalAppt.appointmentNumber}`}
          maxWidth="480px"
        >
          <form onSubmit={handleConfirmStatusChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
              Transitioning appointment for <strong>{statusModalAppt.patientName}</strong> with <strong>{statusModalAppt.doctorName}</strong>.
            </p>

            <div className="form-group">
              <label className="form-label">New Status</label>
              <select
                className="form-control"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                required
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transition Reason / Internal Notes</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Confirmed via phone call with patient; requested to arrive 10 mins early."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStatusModalAppt(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingStatus}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0A2540',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {updatingStatus ? 'Saving...' : 'Apply Transition'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
