import React, { useEffect, useState } from 'react';
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Clock,
  Tag,
  CheckCircle,
  XCircle
} from 'lucide-react';
import catalogService from '../../services/catalogService';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function ServicesManagerPage() {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const canEdit = hasRole(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'General Dentistry',
    price: 900,
    durationMinutes: 30,
    description: '',
    active: true,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await catalogService.getServices(false); // get all including inactive
      if (res?.data) {
        setServices(res.data);
      }
    } catch (err) {
      showToast('Failed to load treatments catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'General Dentistry',
      price: 1500,
      durationMinutes: 30,
      description: '',
      active: true,
    });
    setEditModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingService(s);
    setFormData({
      name: s.name || '',
      category: s.category || 'General Dentistry',
      price: s.price || 0,
      durationMinutes: s.durationMinutes || 30,
      description: s.description || '',
      active: s.active !== false,
    });
    setEditModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Service name is required', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        durationMinutes: Number(formData.durationMinutes),
      };

      if (editingService) {
        await catalogService.updateService(editingService.id, payload);
        showToast('Treatment service updated successfully', 'success');
      } else {
        await catalogService.createService(payload);
        showToast('New treatment added to catalog', 'success');
      }
      setEditModalOpen(false);
      fetchServices();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the service catalog?`)) return;
    try {
      await catalogService.deleteService(id);
      showToast(`Treatment "${name}" removed`, 'info');
      fetchServices();
    } catch (err) {
      showToast('Could not delete service', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>
            Dental Treatments & Pricing Catalog
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Manage dental procedures, patient billing prices, duration intervals, and descriptions.
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
              Add Treatment
            </button>
          )}
          <button
            onClick={fetchServices}
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

      {/* Services Table */}
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
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Treatment Name</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Standard Fee</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Duration</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Spinner message="Loading treatment catalog..." />
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    No services found in catalog.
                  </td>
                </tr>
              ) : (
                services.map((srv) => (
                  <tr key={srv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#0A2540' }}>{srv.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: '380px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {srv.description}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#0A2540', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {srv.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#0E9F6E', fontSize: '0.95rem' }}>
                      ₹{srv.price}
                    </td>
                    <td style={{ padding: '1rem', color: '#475569' }}>
                      {srv.durationMinutes} mins
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: srv.active ? '#DEF7EC' : '#FEE2E2',
                        color: srv.active ? '#0E9F6E' : '#DC2626',
                      }}>
                        {srv.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {canEdit && (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(srv)}
                            title="Edit Service"
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              color: '#0A2540',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteService(srv.id, srv.name)}
                            title="Delete Service"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '5px',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Create / Edit Modal */}
      {editModalOpen && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={editingService ? `Edit Treatment: ${editingService.name}` : 'Add Treatment to Catalog'}
          maxWidth="550px"
        >
          <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Treatment Name *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Composite Tooth Restoration"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="General Dentistry">General Dentistry</option>
                  <option value="Prosthodontics">Prosthodontics</option>
                  <option value="Endodontics">Endodontics</option>
                  <option value="Orthodontics">Orthodontics</option>
                  <option value="Periodontics">Periodontics</option>
                  <option value="Cosmetic Dentistry">Cosmetic Dentistry</option>
                  <option value="Pediatric Dentistry">Pediatric Dentistry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fee (₹) *</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                className="form-control"
                min={15}
                step={15}
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Treatment Description</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Detailed clinical procedure summary and patient benefits..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                {saving ? 'Saving...' : 'Save Treatment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
