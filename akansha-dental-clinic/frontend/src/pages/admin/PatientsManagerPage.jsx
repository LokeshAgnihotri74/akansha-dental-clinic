import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar
} from 'lucide-react';
import patientService from '../../services/patientService';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export default function PatientsManagerPage() {
  const { showToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  // Modals
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    medicalHistory: '',
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientService.getPatients({
        page,
        size: 10,
        search: search.trim() || undefined,
      });
      if (res?.data) {
        setPatients(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load patient records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchPatients();
  };

  const openCreateModal = () => {
    setEditingPatient(null);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      medicalHistory: '',
    });
    setEditModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPatient(p);
    setFormData({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      medicalHistory: p.medicalHistory || '',
    });
    setEditModalOpen(true);
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.phone.trim()) {
      showToast('First Name and Phone are required', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingPatient) {
        await patientService.updatePatient(editingPatient.id, formData);
        showToast('Patient record updated successfully', 'success');
      } else {
        await patientService.createPatient(formData);
        showToast('New patient registered successfully', 'success');
      }
      setEditModalOpen(false);
      fetchPatients();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>
            Patients Clinical Directory
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Comprehensive patient demographic data, contact info, and medical histories.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={openCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0A2540',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <UserPlus size={16} color="#00D4B2" />
            Register Patient
          </button>
          <button
            onClick={fetchPatients}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fff',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#0A2540',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          marginBottom: '1.5rem',
        }}
      >
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by patient name, phone number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              padding: '0.5rem 1.25rem',
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
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setPage(0); }}
              style={{
                border: 'none',
                background: 'none',
                color: '#EF4444',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Patients Table */}
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
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Patient Name</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Phone</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Address / City</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Registered</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Spinner message="Loading registered patients..." />
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    No patients match your search.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#0A2540' }}>
                        {p.firstName} {p.lastName}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>ID: #{p.id}</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500, color: '#1E293B' }}>{p.phone}</td>
                    <td style={{ padding: '1rem', color: '#64748B' }}>{p.email || 'Not recorded'}</td>
                    <td style={{ padding: '1rem', color: '#64748B' }}>{p.address || 'Not recorded'}</td>
                    <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.82rem' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedPatient(p)}
                          title="View Details"
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            color: '#0A2540',
                            cursor: 'pointer',
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Patient"
                          style={{
                            background: '#DEF7EC',
                            border: '1px solid #BCF0DA',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            color: '#0E9F6E',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
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
            Showing {patients.length} of {totalElements} registered patients
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
              disabled={(page + 1) * 10 >= totalElements}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                backgroundColor: (page + 1) * 10 >= totalElements ? '#F1F5F9' : '#fff',
                fontSize: '0.82rem',
                cursor: (page + 1) * 10 >= totalElements ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Patient View Modal */}
      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Patient Record: ${selectedPatient.firstName} ${selectedPatient.lastName}`}
          maxWidth="550px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Contact Info</span>
                <div style={{ marginTop: '0.5rem', fontSize: '0.88rem' }}>
                  <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                  <div style={{ marginTop: '4px' }}><strong>Email:</strong> {selectedPatient.email || 'Not recorded'}</div>
                  <div style={{ marginTop: '4px' }}><strong>Blood Group:</strong> {selectedPatient.bloodGroup || 'Not recorded'}</div>
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Address</span>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: '#475569' }}>
                  {selectedPatient.address || 'Not recorded'}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#0A2540', display: 'block', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
                Medical History & Clinical Allergies
              </span>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                {selectedPatient.medicalHistory || 'Not recorded'}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Patient Create / Edit Modal */}
      {editModalOpen && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={editingPatient ? `Edit Patient: ${editingPatient.firstName} ${editingPatient.lastName}` : 'Register New Patient'}
          maxWidth="550px"
        >
          <form onSubmit={handleSavePatient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Minal Residency, Bhopal"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Medical History & Known Allergies</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Hypertension, Penicillin allergy, Diabetic..."
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
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
                disabled={saving}
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
                {saving ? 'Saving...' : 'Save Patient'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
