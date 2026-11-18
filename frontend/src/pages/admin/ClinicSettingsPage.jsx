import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Building,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import clinicSettingService from '../../services/clinicSettingService';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

export default function ClinicSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await clinicSettingService.getPublicSettings();
      if (res?.data) {
        // res.data is a list of { id, key, value, description }
        const map = {};
        res.data.forEach(s => {
          map[s.key] = s.value;
        });
        setSettings(map);
      }
    } catch (err) {
      showToast('Failed to load clinic settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key, val) => {
    try {
      setSavingKey(key);
      await clinicSettingService.updateSetting(key, val);
      showToast(`Setting '${key}' saved successfully`, 'success');
    } catch (err) {
      showToast('Failed to update setting', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  if (loading) {
    return <Spinner message="Loading operational configuration..." />;
  }

  const settingFields = [
    { key: 'clinic_name', label: 'Official Clinic Name', type: 'text', placeholder: 'Akansha Dental Clinic' },
    { key: 'clinic_tagline', label: 'Clinic Tagline & Subheading', type: 'text', placeholder: 'Precision Dental Implants & Multi-Specialty Care' },
    { key: 'clinic_phone', label: 'Primary Reception Hotline', type: 'text', placeholder: '+91 9399354201' },
    { key: 'clinic_emergency_phone', label: '24/7 Dental Emergency Phone', type: 'text', placeholder: '+91 9399354201' },
    { key: 'clinic_email', label: 'Official Clinical Contact Email', type: 'email', placeholder: 'contact@akanshadental.com' },
    { key: 'clinic_address', label: 'Physical Clinic Address', type: 'text', placeholder: 'Raj Business Park, RA-5, Minal Shopping St, Minal Residency, Bhopal, Madhya Pradesh 462041' },
    { key: 'clinic_hours_weekday', label: 'Monday - Saturday Working Hours', type: 'text', placeholder: '09:00 AM - 10:00 PM' },
    { key: 'clinic_hours_sunday', label: 'Sunday Operating Hours', type: 'text', placeholder: '10:00 AM - 02:00 PM' },
    { key: 'clinic_consultation_fee', label: 'Standard Base Consultation Fee (₹)', type: 'number', placeholder: '1000' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>
            Clinic Parameters & Settings
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
            System-wide clinic contact points, operating hours, emergency hotlines, and public website metadata.
          </p>
        </div>
        <button
          onClick={fetchSettings}
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
          Reload
        </button>
      </div>

      {/* Settings Form Grid */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '2rem',
          maxWidth: '800px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {settingFields.map((field) => (
            <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0A2540' }}>
                {field.label}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={field.type}
                  className="form-control"
                  style={{ flex: 1 }}
                  placeholder={field.placeholder}
                  value={settings[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
                <button
                  type="button"
                  disabled={savingKey === field.key}
                  onClick={() => handleUpdate(field.key, settings[field.key])}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
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
                  <Save size={14} color="#00D4B2" />
                  {savingKey === field.key ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
