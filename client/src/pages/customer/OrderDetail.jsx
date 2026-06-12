import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../../store/slices/orderSlice';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload, FiCheckCircle, FiXCircle, FiClock, FiHash, FiStar, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

/* ── helpers ─────────────────────────── */
const STATUS_COLORS = {
  pending:           { bg: '#FEF3C7', text: '#92400E' },
  proof_uploaded:    { bg: '#DBEAFE', text: '#1E40AF' },
  proof_submitted:   { bg: '#DBEAFE', text: '#1E40AF' },
  verified:          { bg: '#D1FAE5', text: '#065F46' },
  paid:              { bg: '#D1FAE5', text: '#065F46' },
  rejected:          { bg: '#FEE2E2', text: '#991B1B' },
  admin_approved:    { bg: '#D1FAE5', text: '#065F46' },
  processing:        { bg: '#EDE9FE', text: '#5B21B6' },
  packed:            { bg: '#EDE9FE', text: '#5B21B6' },
  shipped:           { bg: '#DBEAFE', text: '#1E40AF' },
  out_for_delivery:  { bg: '#FEF9C3', text: '#713F12' },
  delivered:         { bg: '#D1FAE5', text: '#065F46' },
  cancelled:         { bg: '#FEE2E2', text: '#991B1B' },
};

function Badge({ label, status }) {
  const c = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span style={{ background: c.bg, color: c.text, padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize' }}>
      {label || status?.replace(/_/g, ' ')}
    </span>
  );
}

/* ── Payment Proof Upload Card ─────── */
function PaymentProofCard({ order, onUploaded }) {
  const fileRef     = useRef();
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [txId,      setTxId]      = useState('');
  const [uploading, setUploading] = useState(false);
  const [drag,      setDrag]      = useState(false);

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  };

  const handleSubmit = async () => {
    if (!file)         return toast.error('Please select a payment screenshot');
    if (!txId.trim())  return toast.error('Please enter the Transaction ID');

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('proof', file);
      fd.append('transactionId', txId.trim());
      fd.append('orderId', order._id);

      await api.post('/payments/upload-proof', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('✅ Payment proof uploaded! Finance team will verify shortly.');
      onUploaded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const alreadyUploaded = ['proof_uploaded','proof_submitted','verified','paid'].includes(order.paymentStatus);
  const isRejected      = order.paymentStatus === 'rejected';

  if (order.paymentMethod === 'cod') return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'white', borderRadius: 16, border: '1.5px solid #93C5FD', overflow: 'hidden', marginTop: 20 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '1.5rem' }}>{order.paymentMethod === 'easypaisa' ? '🟣' : '🔴'}</span>
        <div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
            {order.paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} Payment Proof
          </p>
          <p style={{ color: '#BFDBFE', fontSize: '0.75rem', margin: 0 }}>
            Amount due: <strong style={{ color: 'white' }}>Rs. {order.total?.toLocaleString()}</strong>
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Badge status={order.paymentStatus} />
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Already verified */}
        {order.paymentStatus === 'verified' || order.paymentStatus === 'paid' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#D1FAE5', borderRadius: 12, padding: '14px 18px' }}>
            <FiCheckCircle size={24} color="#059669" />
            <div>
              <p style={{ fontWeight: 700, color: '#065F46', margin: 0 }}>Payment Verified ✅</p>
              <p style={{ fontSize: '0.82rem', color: '#047857', margin: 0 }}>Your payment has been confirmed. Your order is being processed.</p>
            </div>
          </div>
        ) : alreadyUploaded ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#DBEAFE', borderRadius: 12, padding: '14px 18px' }}>
            <FiClock size={24} color="#1D4ED8" />
            <div>
              <p style={{ fontWeight: 700, color: '#1E40AF', margin: 0 }}>Proof Submitted — Pending Verification</p>
              <p style={{ fontSize: '0.82rem', color: '#1D4ED8', margin: 0 }}>
                Transaction ID: <strong>{order.paymentProof?.transactionId || '—'}</strong>
              </p>
              <p style={{ fontSize: '0.78rem', color: '#3B82F6', margin: '4px 0 0' }}>
                Our finance team will verify your payment shortly. You'll be notified once approved.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Rejected notice */}
            {isRejected && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#FEE2E2', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                <FiXCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 700, color: '#991B1B', margin: 0 }}>Previous Proof Rejected</p>
                  <p style={{ fontSize: '0.82rem', color: '#B91C1C', margin: 0 }}>Please upload a clearer screenshot and re-submit.</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', color: '#065F46' }}>
              💡 Transfer <strong>Rs. {order.total?.toLocaleString()}</strong> to our {order.paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} account, then upload the transaction screenshot below.
            </div>

            {/* Transaction ID */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                <FiHash size={14} /> Transaction ID / Reference Number *
              </label>
              <input
                className="input"
                id="txn-id-input"
                value={txId}
                onChange={e => setTxId(e.target.value)}
                placeholder="e.g. EP-20240101-XXXX"
                style={{ fontFamily: 'monospace', letterSpacing: 1, fontWeight: 600 }}
              />
              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 4 }}>Found in your app under transaction history</p>
            </div>

            {/* Drag-and-drop area */}
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: 8 }}>
              <FiUpload size={14} style={{ marginRight: 5 }} /> Payment Screenshot *
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${drag ? '#3B82F6' : preview ? '#10B981' : '#BFDBFE'}`,
                borderRadius: 14,
                background: drag ? '#EFF6FF' : preview ? '#F0FDF4' : '#F8FAFF',
                padding: preview ? 12 : '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pickFile(e.target.files[0])} />
              {preview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={preview} alt="proof preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 10, objectFit: 'contain', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }} />
                  <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#10B981', fontWeight: 600 }}>✅ {file.name} — click to change</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📸</div>
                  <p style={{ fontWeight: 700, color: '#1D4ED8', margin: 0, fontSize: '0.9rem' }}>Click or drag &amp; drop your screenshot here</p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '4px 0 0' }}>JPG, PNG, WebP — max 5MB</p>
                </>
              )}
            </div>

            {/* Submit */}
            <button
              id="upload-proof-btn"
              onClick={handleSubmit}
              disabled={uploading}
              style={{
                width: '100%', marginTop: 18, padding: '14px',
                background: uploading ? '#D1D5DB' : 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: '1rem', fontWeight: 800, cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
              }}
            >
              {uploading
                ? <><div style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Uploading...</>
                : <><FiUpload /> Submit Payment Proof</>}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── Product Review Card ───────────── */
function ProductReviewCard({ productId, productName }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return toast.error('Please select a star rating');
    setSubmitting(true);
    try {
      await api.post('/reviews', { productId, rating, comment });
      setSubmitted(true);
      toast.success('Review submitted successfully!');
    } catch (e) {
      if (e.response?.data?.message?.includes('already reviewed')) {
        setSubmitted(true);
      } else {
        toast.error(e.response?.data?.message || 'Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #A7F3D0', marginTop: 12 }}>
        <FiCheckCircle size={20} color="#059669" />
        <span style={{ color: '#065F46', fontSize: '0.85rem', fontWeight: 600 }}>Thank you! Your review for {productName} has been submitted.</span>
      </div>
    );
  }

  return (
    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', marginTop: 12, border: '1px solid #E5E7EB' }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <FiMessageSquare color="#EC4899" /> Write a Review for {productName}
      </p>
      
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={22}
            style={{ 
              cursor: 'pointer', 
              color: (hoverRating || rating) >= star ? '#FBBF24' : '#D1D5DB',
              fill: (hoverRating || rating) >= star ? '#FBBF24' : 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <textarea 
          placeholder="What did you think about this product?" 
          value={comment}
          onChange={e => setComment(e.target.value)}
          style={{ flex: 1, border: '1px solid #D1D5DB', borderRadius: 8, padding: '10px 12px', fontSize: '0.85rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
          rows={2}
        />
        <button 
          onClick={handleSubmit} 
          disabled={submitting || rating === 0}
          style={{ background: submitting || rating === 0 ? '#D1D5DB' : '#EC4899', color: 'white', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: submitting || rating === 0 ? 'not-allowed' : 'pointer', height: '100%' }}
        >
          {submitting ? 'Sending...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────── */
export default function OrderDetail() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchOrderById(id)); }, [id]);

  const refresh = () => dispatch(fetchOrderById(id));

  if (loading) return <div className="loader" style={{ margin: '100px auto' }} />;
  if (!order)  return <div style={{ textAlign: 'center', padding: 80 }}><h2>Order not found</h2></div>;

  const orderC = STATUS_COLORS[order.orderStatus] || { bg: '#F3F4F6', text: '#374151' };

  return (
    <div style={{ minHeight: '100vh', background: '#FDF7F9', paddingTop: 32, paddingBottom: 60 }}>
      <Helmet><title>Order #{order.orderNumber} — Gifting Bliss</title></Helmet>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 20px' }}>

        {/* Back */}
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem', marginBottom: 24 }}>
          <FiArrowLeft /> Back to My Orders
        </Link>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', color: 'var(--dark)', margin: 0 }}>
            🎁 Order #{order.orderNumber}
          </h1>
          <span style={{ background: orderC.bg, color: orderC.text, padding: '5px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700, textTransform: 'capitalize' }}>
            {order.orderStatus?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Payment Proof Upload (only for online payment) */}
        <PaymentProofCard order={order} onUploaded={refresh} />

        {/* Order Items */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #FCE7F3', boxShadow: '0 2px 10px rgba(236,72,153,0.06)', marginTop: 20 }}>
          <h3 style={{ marginBottom: 16, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 8 }}>🛍️ Order Items</h3>
          {order.items?.map((item, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid #FDF2F8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#1F2937', margin: 0, fontSize: '0.9rem' }}>{item.name}</p>
                  <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: 0 }}>Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}</p>
                </div>
                <strong style={{ color: '#1F2937' }}>Rs. {item.total?.toLocaleString()}</strong>
              </div>
              
              {/* Show review form if order is delivered */}
              {order.orderStatus === 'delivered' && item.product && (
                <ProductReviewCard productId={typeof item.product === 'object' ? item.product._id : item.product} productName={item.name} />
              )}
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontWeight: 800, fontSize: '1.05rem', borderTop: '2px solid #FCE7F3', paddingTop: 14 }}>
            <span>Total</span>
            <span style={{ color: '#EC4899' }}>Rs. {order.total?.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Delivery Address */}
        {order.shippingAddress && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #FCE7F3', boxShadow: '0 2px 10px rgba(236,72,153,0.06)', marginTop: 16 }}>
            <h3 style={{ marginBottom: 12, color: '#1F2937' }}>🚚 Delivery Address</h3>
            <p style={{ margin: 0, color: '#374151', fontSize: '0.9rem', lineHeight: 1.7 }}>
              <strong>{order.shippingAddress.name}</strong><br />
              {order.shippingAddress.phone}<br />
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.province}
            </p>
          </motion.div>
        )}

        {/* Order Timeline */}
        {order.statusHistory?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #FCE7F3', boxShadow: '0 2px 10px rgba(236,72,153,0.06)', marginTop: 16 }}>
            <h3 style={{ marginBottom: 16, color: '#1F2937' }}>📋 Order Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...order.statusHistory].reverse().map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#EC4899' : '#D1D5DB', flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1F2937', margin: 0, textTransform: 'capitalize' }}>{h.status?.replace(/_/g, ' ')}</p>
                    {h.note && <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '2px 0 0' }}>{h.note}</p>}
                    <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '2px 0 0' }}>{new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

