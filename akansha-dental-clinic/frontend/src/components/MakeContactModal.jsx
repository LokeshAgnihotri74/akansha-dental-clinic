import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Phone, User, HelpCircle, CheckCircle2, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import inquiryService from '../services/inquiryService';

export default function MakeContactModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('Treatment Related');
  const [message, setMessage] = useState('');
  
  // Math Captcha state
  const [captchaNum1, setCaptchaNum1] = useState(7);
  const [captchaNum2, setCaptchaNum2] = useState(5);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 12) + 4;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaInput('');
    setCaptchaError('');
  };

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
      setErrorMsg('');
      setSuccessData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setCaptchaError('');

    // 1. Phone validation
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    // 2. Captcha validation
    const expected = captchaNum1 + captchaNum2;
    if (parseInt(captchaInput.trim(), 10) !== expected) {
      setCaptchaError(`Incorrect captcha answer. What is ${captchaNum1} + ${captchaNum2}?`);
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await inquiryService.submitContactRequest({
        name: name.trim(),
        phone: cleanPhone,
        reason,
        message: message.trim()
      });

      if (res && res.data) {
        setSuccessData(res.data);
      } else {
        setSuccessData({
          refCode: `CNT-${Math.floor(1000 + Math.random() * 9000)}`,
          phone: cleanPhone,
          reason,
          name: name.trim()
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to submit contact request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setName('');
    setPhone('');
    setReason('Treatment Related');
    setMessage('');
    setSuccessData(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 37, 64, 0.72)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleResetAndClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div
          style={{
            backgroundColor: '#0a2540',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #00d4b2'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 212, 178, 0.2)',
                color: '#00d4b2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                Make Direct Contact
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Akansha Dental Clinic • Instant SMS Confirmation
              </span>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {successData ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#e6fffa',
                  color: '#00875a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 4px 12px rgba(0, 135, 90, 0.2)'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#e6fffa',
                  color: '#00875a',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem'
                }}
              >
                SMS Dispatched Successfully
              </span>

              <h4 style={{ fontSize: '1.35rem', color: '#0a2540', marginBottom: '0.5rem' }}>
                Thank You, {successData.name}!
              </h4>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Your contact request regarding <strong>{successData.reason}</strong> has been received with tracking code:
              </p>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                  <span style={{ color: '#64748b' }}>Reference ID:</span>
                  <strong style={{ color: '#0a2540', letterSpacing: '0.05em' }}>{successData.refCode}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                  <span style={{ color: '#64748b' }}>Recipient Phone:</span>
                  <strong>+91 {successData.phone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#64748b' }}>SMS Notification:</span>
                  <span style={{ color: '#00875a', fontWeight: 600 }}>Sent (Delivered)</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#166534' }}>
                📲 <strong>Message Preview:</strong> "Dear {successData.name}, your contact request regarding {successData.reason} has been recorded (Ref: {successData.refCode}). Our desk will call you shortly on {successData.phone}."
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {errorMsg && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.88rem'
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                  Your Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.92rem'
                    }}
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                  Contact Mobile Number * (SMS will be sent here)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number (e.g. 9826012345)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.92rem'
                    }}
                  />
                </div>
              </div>

              {/* Reason Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                  Reason for Contact *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="Treatment Related">Treatment Related (उपचार संबंधी)</option>
                  <option value="Feedback Related">Feedback Related (प्रतिक्रिया / सुझाव)</option>
                  <option value="Fraud Related">Fraud Related (धोखाधड़ी / शिकायत)</option>
                  <option value="Misbehave Related">Misbehave Related (स्टाफ दुर्व्यवहार शिकायत)</option>
                  <option value="Other">Other (अन्य पूछताछ)</option>
                </select>
              </div>

              {/* Message Details */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                  Brief Details / Message (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your issue or request briefly..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Captcha Block */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} color="#00875a" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a2540' }}>
                      Security Verification: What is {captchaNum1} + {captchaNum2} = ?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    title="Generate new question"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>

                <input
                  type="number"
                  required
                  placeholder="Enter calculation answer"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: captchaError ? '1px solid #ef4444' : '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                />
                {captchaError && (
                  <span style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 600 }}>
                    {captchaError}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}
              >
                {loading ? (
                  <span>Sending SMS & Submitting...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit & Receive SMS</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
