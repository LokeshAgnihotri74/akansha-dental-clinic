import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  RefreshCw,
  Phone,
  Mail,
  GraduationCap,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import doctorService from '../../services/doctorService';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function DoctorsManagerPage() {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const canEdit = hasRole(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    qualification: '',
    experienceYears: 5,
    consultationFee: 1000,
    email: '',
    phone: '+91 9399354201',
    imageUrl: '',
    bio: '',
    active: true,
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getDoctors(false); // get all including inactive
      if (res?.data) {
        setDoctors(res.data);
      }
    } catch (err) {
      showToast('Failed to load doctor roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openCreateModal = () => {
    setEditingDoctor(null);
    setFormData({
      fullName: '',
      specialization: '',
      qualification: '',
      experienceYears: 5,
      consultationFee: 1000,
      email: '',
      phone: '+91 9399354201',
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
      bio: '',
      active: true,
    });
    setEditModalOpen(true);
  };

  const openEditModal = (d) => {
    setEditingDoctor(d);
    setFormData({
      fullName: d.fullName || '',
      specialization: d.specialization || '',
      qualification: d.qualification || '',
      experienceYears: d.experienceYears || 0,
      consultationFee: d.consultationFee || 0,
      email: d.email || '',
      phone: d.phone || '',
      imageUrl: d.imageUrl || '',
      bio: d.bio || '',
      active: d.active !== false,
    });
    setEditModalOpen(true);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.specialization.trim()) {
      showToast('Name and Specialization are required', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
      };

      if (editingDoctor) {
        await doctorService.updateDoctor(editingDoctor.id, payload);
        showToast('Doctor profile updated successfully', 'success');
      } else {
        await doctorService.createDoctor(payload);
        showToast('New specialist added to clinic roster', 'success');
      }
      setEditModalOpen(false);
      fetchDoctors();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (doctor) => {
    try {
      await doctorService.toggleStatus(doctor.id, !doctor.active);
      showToast(`Doctor ${doctor.fullName} marked as ${!doctor.active ? 'Active' : 'Inactive'}`, 'success');
      fetchDoctors();
    } catch (err) {
      showToast('Status update failed', 'error');
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the medical staff?`)) return;
    try {
      await doctorService.deleteDoctor(id);
      showToast(`Dr. ${name} removed`, 'info');
      fetchDoctors();
    } catch (err) {
      showToast('Could not delete doctor profile', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>
            Doctors & Operational Shifts
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Manage dental specialists, consulting qualifications, service fees, and weekly duty schedules.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && (
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
              <Plus size={16} color="#00D4B2" />
              Add Specialist
            </button>
          )}
          <button
            onClick={fetchDoctors}
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

      {/* Doctors Grid */}
      {loading ? (
        <Spinner message="Loading dental specialist profiles..." />
      ) : doctors.length === 0 ? (
        <div style={{ backgroundColor: '#fff', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#94A3B8' }}>
          No doctors currently registered in the database.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {doctors.map((doc) => (
            <div
              key={doc.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', padding: '1.25rem', gap: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                <img
                  src={doc.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600'}
                  alt={doc.fullName}
                  style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A2540', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.fullName}
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#00BA9C', fontWeight: 600, margin: '2px 0 4px' }}>
                    {doc.specialization}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {doc.qualification} • {doc.experienceYears} yrs exp.
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 1rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {doc.bio || 'General Dental Practitioner providing comprehensive dental and preventive therapies.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  <span style={{ color: '#64748B' }}>Consultation Fee:</span>
                  <strong style={{ color: '#0A2540', fontSize: '0.95rem' }}>₹{doc.consultationFee}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
                  <button
                    onClick={() => setScheduleDoctor(doc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: '#0A2540',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Calendar size={14} color="#00D4B2" />
                    <span>View Schedule ({doc.schedules?.length || 7} days)</span>
                  </button>

                  {canEdit && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleToggleStatus(doc)}
                        title={doc.active ? 'Deactivate Doctor' : 'Activate Doctor'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: doc.active ? '#0E9F6E' : '#94A3B8',
                        }}
                      >
                        {doc.active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                      </button>
                      <button
                        onClick={() => openEditModal(doc)}
                        title="Edit Doctor"
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          color: '#0A2540',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc.id, doc.fullName)}
                        title="Delete Doctor"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Viewer Modal */}
      {scheduleDoctor && (
        <Modal
          isOpen={!!scheduleDoctor}
          onClose={() => setScheduleDoctor(null)}
          title={`Operational Schedule: ${scheduleDoctor.fullName}`}
          maxWidth="550px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: '#64748B' }}>
              Standard working hours and slot durations configured for {scheduleDoctor.fullName}:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(scheduleDoctor.schedules || []).map((sch, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 1rem',
                    backgroundColor: sch.isAvailable ? '#F8FAFC' : '#FFF1F2',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                  }}
                >
                  <strong style={{ color: '#0A2540', minWidth: '110px' }}>{sch.dayOfWeek}</strong>
                  {sch.isAvailable ? (
                    <span style={{ color: '#0E9F6E', fontWeight: 600 }}>
                      {sch.startTime} - {sch.endTime} ({sch.slotDurationMinutes} min slots)
                    </span>
                  ) : (
                    <span style={{ color: '#EF4444', fontWeight: 600 }}>Off Duty</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Doctor Create / Edit Modal */}
      {editModalOpen && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={editingDoctor ? `Edit Specialist: ${editingDoctor.fullName}` : 'Add Dental Specialist'}
          maxWidth="600px"
        >
          <form onSubmit={handleSaveDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Dr. Priya Nair"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specialization *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Periodontist & Oral Surgeon"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Qualification</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. BDS, MDS (Periodontics)"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Consultation Fee (₹) *</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  min={0}
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Image URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Professional Biography</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Specialist background and clinical experience..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
                {saving ? 'Saving...' : 'Save Specialist'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
