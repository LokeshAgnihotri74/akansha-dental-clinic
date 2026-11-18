import React, { useEffect, useState } from 'react';
import {
  Mail,
  Search,
  CheckCircle,
  Eye,
  RefreshCw,
  Phone,
  MessageSquare,
  Clock,
  Send
} from 'lucide-react';
import inquiryService from '../../services/inquiryService';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export default function InquiriesManagerPage() {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Actions
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await inquiryService.searchInquiries({
        page,
        size: 10,
        status: statusFilter || undefined,
      });
      if (res?.data) {
        setInquiries(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, statusFilter]);

  const handleOpenDetail = async (inq) => {
    setSelectedInquiry(inq);
    setReplyText(inq.adminReply || '');
    if (inq.status === 'NEW') {
      try {
        await inquiryService.updateStatus(inq.id, { status: 'READ' });
        inq.status = 'READ';
        fetchInquiries();
      } catch (err) {
        // silent
      }
    }
  };

  const handleSaveReply = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    try {
      setReplying(true);
      await inquiryService.updateStatus(selectedInquiry.id, {
        status: 'REPLIED',
        adminReply: replyText.trim()
      });
      showToast('Reply logged and inquiry marked as resolved', 'success');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err) {
      showToast(err.message || 'Failed to update inquiry', 'error');
    } finally {
      setReplying(false);
    }
  };

  const statusTabs = [
    { label: 'All Inquiries', value: '' },
    { label: 'New', value: 'NEW' },
    { label: 'Read', value: 'READ' },
    { label: 'Replied', value: 'REPLIED' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>
            Public Inquiries & Messages
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Review feedback, consultation queries, and general inquiries submitted by prospective patients.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
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

      {/* Inquiries Table */}
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
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>Sender Details</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Subject</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Message Snippet</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Date Received</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Spinner message="Loading inquiries..." />
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    No patient inquiries found.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#0A2540' }}>{inq.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{inq.phone} • {inq.email}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#1E293B' }}>
                      {inq.subject}
                    </td>
                    <td style={{ padding: '1rem', color: '#64748B', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {inq.message}
                    </td>
                    <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.82rem' }}>
                      {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: inq.status === 'NEW' ? '#FEF3C7' : inq.status === 'READ' ? '#DBEAFE' : '#DEF7EC',
                        color: inq.status === 'NEW' ? '#D97706' : inq.status === 'READ' ? '#1E40AF' : '#0E9F6E',
                      }}>
                        {inq.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenDetail(inq)}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          color: '#0A2540',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        Review
                      </button>
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
            Showing {inquiries.length} of {totalElements} inquiries
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

      {/* Inquiry Detail & Reply Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          title={`Inquiry from ${selectedInquiry.name}`}
          maxWidth="550px"
        >
          <form onSubmit={handleSaveReply} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#0A2540' }}>{selectedInquiry.subject}</strong>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {new Date(selectedInquiry.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                {selectedInquiry.message}
              </p>
              <div style={{ fontSize: '0.78rem', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem' }}>
                Contact: <strong>{selectedInquiry.phone}</strong> • {selectedInquiry.email}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Send size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                Administrative Response / Action Taken
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Log internal action, e.g. 'Called patient and scheduled consultation for root canal therapy.'"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={replying}
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
                {replying ? 'Saving...' : 'Mark as Replied'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
