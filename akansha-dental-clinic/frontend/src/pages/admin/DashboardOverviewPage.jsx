import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Stethoscope,
  Mail,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import appointmentService from '../../services/appointmentService';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
import { useToast } from '../../context/ToastContext';

export default function DashboardOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useToast();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getSummary();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      showToast('Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      setUpdatingId(apptId);
      await appointmentService.updateStatus(apptId, {
        status: newStatus,
        notes: `Quick action updated from Admin Overview`
      });
      showToast(`Appointment status changed to ${newStatus}`, 'success');
      fetchDashboard();
    } catch (err) {
      showToast(err.message || 'Status transition failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !data) {
    return <Spinner message="Loading clinic analytics & metrics..." />;
  }

  const kpis = [
    { title: 'Total Bookings', value: data?.totalAppointments || 0, icon: Calendar, color: '#0A2540', bg: '#E2E8F0' },
    { title: 'Pending Approval', value: data?.pendingAppointments || 0, icon: Clock, color: '#D97706', bg: '#FEF3C7' },
    { title: 'Confirmed Visits', value: data?.confirmedAppointments || 0, icon: CheckCircle2, color: '#0E9F6E', bg: '#DEF7EC' },
    { title: 'Completed Visits', value: data?.completedAppointments || 0, icon: TrendingUp, color: '#2563EB', bg: '#DBEAFE' },
    { title: 'Registered Patients', value: data?.totalPatients || 0, icon: Users, color: '#7C3AED', bg: '#EDE9FE' },
    { title: 'Active Inquiries', value: data?.unreadInquiries || 0, icon: Mail, color: '#DC2626', bg: '#FEE2E2' },
  ];

  const maxTrend = Math.max(...(data?.sevenDayTrends?.map(t => t.count) || [1]), 1);

  return (
    <div>
      {/* Page Title & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>
            Clinic Operations Dashboard
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Real-time appointment schedule, patient throughput, and operational KPIs.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
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
          Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>{kpi.title}</span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: kpi.bg,
                    color: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0A2540' }}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Shortcuts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* 7-Day Trend Chart */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', margin: 0 }}>
                7-Day Appointment Trend
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                Daily patient booking volume over the last 7 days
              </p>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00D4B2', backgroundColor: '#E6FBF7', padding: '3px 8px', borderRadius: '4px' }}>
              Live Telemetry
            </span>
          </div>

          {/* Pure CSS/SVG Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '1.5rem', padding: '0 1rem 1rem', borderBottom: '1px solid #E2E8F0' }}>
            {(data?.sevenDayTrends || []).map((t, idx) => {
              const heightPercent = Math.max((t.count / maxTrend) * 100, 10);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A2540', marginBottom: '4px' }}>
                    {t.count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '42px',
                      height: `${heightPercent}%`,
                      backgroundColor: t.count > 0 ? '#00D4B2' : '#E2E8F0',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '8px', fontWeight: 600 }}>
                    {t.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '1rem' }}>
              Quick Navigation
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/admin/appointments"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#0A2540',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={18} color="#00D4B2" />
                  <span>Appointments Manager</span>
                </div>
                <ArrowRight size={16} color="#94A3B8" />
              </Link>

              <Link
                to="/admin/patients"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#0A2540',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Users size={18} color="#00D4B2" />
                  <span>Patients Directory</span>
                </div>
                <ArrowRight size={16} color="#94A3B8" />
              </Link>

              <Link
                to="/admin/doctors"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#0A2540',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <UserCheck size={18} color="#00D4B2" />
                  <span>Doctor Roster & Shifts</span>
                </div>
                <ArrowRight size={16} color="#94A3B8" />
              </Link>

              <Link
                to="/admin/services"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#0A2540',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Stethoscope size={18} color="#00D4B2" />
                  <span>Dental Treatments Catalog</span>
                </div>
                <ArrowRight size={16} color="#94A3B8" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', margin: 0 }}>
              Recent Appointments
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
              Latest patient reservations awaiting review or care
            </p>
          </div>
          <Link
            to="/admin/appointments"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#0A2540',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 600 }}>Ref #</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Patient</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Specialist & Service</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Date & Slot</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!data?.recentAppointments || data.recentAppointments.length === 0) ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    No recent appointments found.
                  </td>
                </tr>
              ) : (
                data.recentAppointments.map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#0A2540' }}>
                      {appt.appointmentCode || appt.appointmentNumber}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{appt.patientName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{appt.patientPhone}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{appt.doctorName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#0E9F6E' }}>{appt.serviceName}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{appt.appointmentDate}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{appt.timeSlot}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge status={appt.status} />
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {appt.status === 'PENDING' && (
                          <button
                            disabled={updatingId === appt.id}
                            onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                            style={{
                              backgroundColor: '#DEF7EC',
                              color: '#0E9F6E',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 8px',
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
                            disabled={updatingId === appt.id}
                            onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                            style={{
                              backgroundColor: '#DBEAFE',
                              color: '#1E40AF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 8px',
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
                            disabled={updatingId === appt.id}
                            onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
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
      </div>
    </div>
  );
}
