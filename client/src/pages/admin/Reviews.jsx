import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './Overview';
import {
  FiMenu, FiStar, FiTrash2, FiCheck, FiX,
  FiRefreshCw, FiFilter, FiEye
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './AdminDashboard.css';

const STARS = [1, 2, 3, 4, 5];

function StarRating({ rating, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {STARS.map(s => (
        <FiStar key={s} size={size} style={{ fill: s <= rating ? '#F59E0B' : 'none', color: s <= rating ? '#F59E0B' : '#D1D5DB', flexShrink: 0 }} />
      ))}
    </span>
  );
}

function ReviewDetailModal({ review, onClose, onApprove, onReject, onDelete }) {
  return (
    <motion.div className="admin-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 520 }}
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
        <div className="admin-modal-header">
          <h3>Review Details</h3>
          <button className="admin-modal-close" onClick={onClose}><FiX /></button>
        </div>

        {/* Product */}
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          {review.product?.images?.[0]?.url
            ? <img src={review.product.images[0].url} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
            : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--pink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🎁</div>}
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Product</p>
            <strong style={{ fontSize: '0.9rem' }}>{review.product?.name || 'Deleted Product'}</strong>
          </div>
        </div>

        {/* Customer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--pink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--pink-600)', flexShrink: 0 }}>
            {review.customer?.avatar?.url
              ? <img src={review.customer.avatar.url} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              : review.customer?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <strong style={{ fontSize: '0.9rem' }}>{review.customer?.name || 'Anonymous'}</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{review.customer?.email} · {new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarRating rating={review.rating} size={16} />
            {review.isVerifiedPurchase && (
              <span style={{ background: '#D1FAE5', color: '#059669', padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600 }}>✓ Verified</span>
            )}
          </div>
        </div>

        {/* Content */}
        {review.title && <h4 style={{ marginBottom: 8, fontSize: '0.95rem' }}>{review.title}</h4>}
        {review.comment && (
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6, background: '#F9FAFB', padding: '12px 14px', borderRadius: 8, marginBottom: 16 }}>
            "{review.comment}"
          </p>
        )}

        {/* Images */}
        {review.images?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {review.images.map((img, i) => (
              <img key={i} src={img.url} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover' }} />
            ))}
          </div>
        )}

        {/* Status */}
        <div style={{ padding: '10px 14px', borderRadius: 8, background: review.isApproved ? '#D1FAE5' : '#FEF3C7', marginBottom: 20 }}>
          <span style={{ color: review.isApproved ? '#059669' : '#D97706', fontSize: '0.85rem', fontWeight: 600 }}>
            {review.isApproved ? '✅ Approved & Visible' : '⏳ Pending Approval'}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          {!review.isApproved && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={onApprove} id="approve-review-btn">
              <FiCheck style={{ marginRight: 6 }} />Approve Review
            </button>
          )}
          {review.isApproved && (
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onReject} id="reject-review-btn">
              <FiX style={{ marginRight: 6 }} />Unpublish
            </button>
          )}
          <button onClick={onDelete} id="delete-review-btn"
            style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiTrash2 />Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminReviews() {
  const [sidebar, setSidebar]   = useState(false);
  const [reviews, setReviews]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all'); // all | pending | approved
  const [starFilter, setStar]   = useState('');
  const [selected, setSelected] = useState(null);

  const load = (f = filter, s = starFilter) => {
    setLoading(true);
    const q = new URLSearchParams({ limit: 50, ...(f !== 'all' && { status: f }), ...(s && { rating: s }) }).toString();
    api.get(`/reviews?${q}`)
      .then(r => { setReviews(r.data.reviews || []); setTotal(r.data.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async id => {
    try {
      await api.put(`/reviews/${id}/approve`, { isApproved: true });
      toast.success('Review approved & published!');
      setSelected(null); load();
    } catch { toast.error('Failed'); }
  };

  const handleReject = async id => {
    try {
      await api.put(`/reviews/${id}/approve`, { isApproved: false });
      toast.success('Review unpublished');
      setSelected(null); load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Permanently delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      setSelected(null); load();
    } catch { toast.error('Failed'); }
  };

  const pending   = reviews.filter(r => !r.isApproved).length;
  const approved  = reviews.filter(r => r.isApproved).length;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="admin-layout">
      <Helmet><title>Reviews — Admin Dashboard</title></Helmet>
      <AdminSidebar open={sidebar} onClose={() => setSidebar(false)} />

      <div className="admin-content">
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebar(true)} id="admin-reviews-menu"><FiMenu /></button>
          <div>
            <h1 className="admin-page-title">⭐ Reviews & Ratings</h1>
            <p className="admin-page-subtitle">{total} total · {pending} pending approval</p>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => load()} id="refresh-reviews-btn"><FiRefreshCw /></button>
          </div>
        </div>

        <div className="admin-body">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Reviews', value: total, icon: '💬', color: 'var(--dark)' },
              { label: 'Pending', value: pending, icon: '⏳', color: '#D97706' },
              { label: 'Approved', value: approved, icon: '✅', color: '#059669' },
              { label: 'Avg Rating', value: avgRating, icon: '⭐', color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
                  <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                </div>
                <strong style={{ fontSize: '1.6rem', color: s.color }}>{s.value}</strong>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <FiFilter style={{ color: 'var(--muted)' }} />
            {['all', 'pending', 'approved'].map(f => (
              <button key={f} onClick={() => { setFilter(f); load(f, starFilter); }}
                style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${filter === f ? 'var(--pink-400)' : '#E5E7EB'}`, background: filter === f ? 'var(--pink-50)' : 'white', color: filter === f ? 'var(--pink-600)' : 'var(--muted)', fontWeight: filter === f ? 700 : 400, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                {f === 'all' ? '📋 All' : f === 'pending' ? '⏳ Pending' : '✅ Approved'}
              </button>
            ))}
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Stars:</span>
            {['', '5', '4', '3', '2', '1'].map(s => (
              <button key={s} onClick={() => { setStar(s); load(filter, s); }}
                style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${starFilter === s ? '#F59E0B' : '#E5E7EB'}`, background: starFilter === s ? '#FEF3C7' : 'white', color: starFilter === s ? '#D97706' : 'var(--muted)', fontWeight: starFilter === s ? 700 : 400, cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.2s' }}>
                {s ? `${s}★` : 'All'}
              </button>
            ))}
          </div>

          {/* Reviews List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>⭐</div>
              <h3>No Reviews Yet</h3>
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>Customer reviews will appear here once products are purchased and reviewed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((r, i) => (
                <motion.div key={r._id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{ background: 'white', border: `1px solid ${!r.isApproved ? '#FDE68A' : '#E5E7EB'}`, borderLeft: `4px solid ${r.isApproved ? 'var(--pink-400)' : '#FCD34D'}`, borderRadius: 'var(--radius-md)', padding: '14px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onClick={() => setSelected(r)}
                  whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>

                  {/* Product image */}
                  <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--pink-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r.product?.images?.[0]?.url
                      ? <img src={r.product.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '1.4rem' }}>🎁</span>}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>{r.customer?.name || 'Anonymous'}</strong>
                      <StarRating rating={r.rating} />
                      {r.isVerifiedPurchase && <span style={{ background: '#D1FAE5', color: '#059669', padding: '1px 7px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 600 }}>✓ Verified</span>}
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: 'auto' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 3 }}>
                      On <span style={{ color: 'var(--pink-600)', fontWeight: 500 }}>{r.product?.name || 'Deleted Product'}</span>
                    </p>
                    {r.title && <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 3 }}>{r.title}</p>}
                    {r.comment && <p style={{ fontSize: '0.83rem', color: '#4B5563', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.comment}</p>}
                  </div>

                  {/* Status + Quick Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{ background: r.isApproved ? '#D1FAE5' : '#FEF3C7', color: r.isApproved ? '#059669' : '#D97706', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
                      {r.isApproved ? '✅ Live' : '⏳ Pending'}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      {!r.isApproved && (
                        <button onClick={() => handleApprove(r._id)} title="Approve"
                          style={{ background: '#D1FAE5', color: '#059669', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}>
                          <FiCheck size={13} />
                        </button>
                      )}
                      {r.isApproved && (
                        <button onClick={() => handleReject(r._id)} title="Unpublish"
                          style={{ background: '#FEF3C7', color: '#D97706', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}>
                          <FiX size={13} />
                        </button>
                      )}
                      <button onClick={() => setSelected(r)} title="View details"
                        style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}>
                        <FiEye size={13} />
                      </button>
                      <button onClick={() => handleDelete(r._id)} title="Delete"
                        style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <ReviewDetailModal
            review={selected}
            onClose={() => setSelected(null)}
            onApprove={() => handleApprove(selected._id)}
            onReject={() => handleReject(selected._id)}
            onDelete={() => handleDelete(selected._id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
