import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiX, FiCheck, FiAlertCircle, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const METHOD_ICONS = { easypaisa: '🟣', jazzcash: '🔴', bank_transfer: '🏦', cod: '💵' };

function PaymentCard({ p, onVerify, onReject }) {
  const [showProof, setShowProof] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', borderLeft: '4px solid #F59E0B', overflow: 'hidden' }}>

      <div style={{ padding: '18px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1.1rem' }}>{METHOD_ICONS[p.method] || '💳'}</span>
              <strong style={{ fontSize: '0.95rem', color: '#111827' }}>
                {p.method?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </strong>
              <span style={{ background: '#FEF3C7', color: '#D97706', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
                ⏳ Pending
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>
              Order <strong style={{ color: '#1F2937' }}>#{p.order?.orderNumber}</strong>
              {p.transactionId && <> · TxID: <strong style={{ color: '#1F2937', fontFamily: 'monospace' }}>{p.transactionId}</strong></>}
            </p>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: 2 }}>
              Customer: <strong style={{ color: '#1F2937' }}>{p.customer?.name || p.order?.customer?.name || '—'}</strong>
              {(p.customer?.phone || p.order?.customer?.phone) && <> · 📞 {p.customer?.phone || p.order?.customer?.phone}</>}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: 2 }}>
              Submitted: {new Date(p.createdAt).toLocaleString()}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#EC4899' }}>
              Rs. {p.amount?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Payment Proof */}
        {p.proof?.url && (
          <div style={{ marginBottom: 14 }}>
            {showProof ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={p.proof.url} alt="Payment proof"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid #E5E7EB', display: 'block' }} />
                <button onClick={() => setShowProof(false)}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 24, height: 24, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                  <FiX />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowProof(true)} id={'view-proof-' + p._id}
                style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiEye /> View Payment Proof
              </button>
            )}
          </div>
        )}

        {!p.proof?.url && (
          <div style={{ marginBottom: 14, background: '#FEF3C7', borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiAlertCircle /> No payment proof uploaded yet
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onVerify(p)} id={'verify-' + p._id}
            style={{ flex: 1, background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.background = '#A7F3D0'}
            onMouseLeave={e => e.target.style.background = '#D1FAE5'}>
            <FiCheck /> Verify Payment
          </button>
          <button onClick={() => onReject(p)} id={'reject-' + p._id}
            style={{ flex: 1, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.background = '#FCA5A5'}
            onMouseLeave={e => e.target.style.background = '#FEE2E2'}>
            <FiX /> Reject
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function RejectModal({ payment, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return toast.error('Please provide a rejection reason');
    setSaving(true);
    await onConfirm(payment, reason);
    setSaving(false);
  };

  return (
    <motion.div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 440 }}
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
        <h3 style={{ marginBottom: 8 }}>❌ Reject Payment</h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: 16 }}>
          Order #{payment.order?.orderNumber} · Rs. {payment.amount?.toLocaleString()}
        </p>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
          Rejection Reason *
        </label>
        <textarea
          style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '10px 12px', fontSize: '0.88rem', resize: 'vertical', minHeight: 80, boxSizing: 'border-box', outline: 'none' }}
          placeholder="e.g. Transaction ID not found, Amount mismatch, Blurry proof image..."
          value={reason} onChange={e => setReason(e.target.value)} id="reject-reason" autoFocus />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onClose}
            style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={saving} id="confirm-reject-btn"
            style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 700 }}>
            {saving ? 'Rejecting...' : 'Confirm Reject'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FinancePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [stats, setStats] = useState({ pending: 0, verifiedToday: 0, rejectedTotal: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/payments/pending'),
        api.get('/stats/finance'),
      ]);
      setPayments(pRes.data.payments || []);
      setStats({
        pending:       sRes.data.pendingVerification || 0,
        verifiedToday: sRes.data.verifiedToday || 0,
        rejectedTotal: sRes.data.rejectedTotal || 0,
      });
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleVerify = async (p) => {
    try {
      await api.put('/payments/verify', { orderId: p.order?._id, action: 'verify' });
      toast.success('✅ Payment verified! Order moved to processing.');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Verification failed'); }
  };

  const handleReject = async (p, reason) => {
    try {
      await api.put('/payments/verify', { orderId: p.order?._id, action: 'reject', rejectionReason: reason });
      toast.success('Payment rejected. Customer notified.');
      setRejectTarget(null);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Rejection failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>Verify Payments — Finance Panel</title></Helmet>

      {/* Header */}
      <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>💳 Payment Verification</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>{payments.length} payments awaiting review</p>
        </div>
        <button onClick={load} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }} id="refresh-payments-btn">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Pending',           value: stats.pending,       icon: '⏳', color: '#D97706', bg: '#FEF3C7' },
            { label: 'Verified Today',    value: stats.verifiedToday, icon: '✅', color: '#059669', bg: '#D1FAE5' },
            { label: 'Rejected (Total)',  value: stats.rejectedTotal, icon: '❌', color: '#DC2626', bg: '#FEE2E2' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Payment Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⏳</div>
            <p style={{ color: '#9CA3AF' }}>Loading pending payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 16, border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>✅</div>
            <h3 style={{ color: '#111827', marginBottom: 8 }}>All caught up!</h3>
            <p style={{ color: '#6B7280' }}>No pending payments to verify right now.</p>
            <button onClick={load} style={{ marginTop: 16, background: '#EC4899', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}>
              Check Again
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {payments.map(p => (
              <PaymentCard key={p._id} p={p}
                onVerify={handleVerify}
                onReject={(p) => setRejectTarget(p)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            payment={rejectTarget}
            onClose={() => setRejectTarget(null)}
            onConfirm={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
