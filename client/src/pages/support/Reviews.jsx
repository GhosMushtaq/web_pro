import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiCheck, FiX, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function SupportReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('pending'); // 'pending' | 'approved' | ''
  const [processing, setProcessing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ limit: 100, ...(status && { status }) }).toString();
      const r = await api.get('/reviews?' + q);
      setReviews(r.data.reviews || []);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]);

  const handleUpdate = async (id, approve) => {
    setProcessing(id);
    try {
      if (approve) {
        await api.put(`/reviews/${id}/approve`, { isApproved: true });
        toast.success('Review approved and visible to public');
      } else {
        await api.delete(`/reviews/${id}`);
        toast.success('Review deleted');
      }
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update review'); }
    finally { setProcessing(null); }
  };

  const handleFeature = async (id, isFeatured) => {
    setProcessing(id);
    try {
      await api.put(`/reviews/${id}/feature`, { isFeatured });
      toast.success(isFeatured ? 'Review featured on Homepage' : 'Removed from Homepage');
      load();
    } catch { toast.error('Failed to update feature status'); }
    finally { setProcessing(null); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>Product Reviews — Support Panel</title></Helmet>

      {/* Header */}
      <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>⭐ Product Reviews</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>Manage customer reviews & ratings</p>
        </div>
        <button onClick={load}
          style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ padding: 24 }}>
        {/* Status Filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[
            ['pending', 'Pending Approval'],
            ['approved', 'Approved (Live)'],
            ['', 'All Reviews']
          ].map(([val, lbl]) => (
            <button key={val} onClick={() => setStatus(val)}
              style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${status === val ? '#EC4899' : '#E5E7EB'}`, background: status === val ? '#FDF2F8' : 'white', color: status === val ? '#EC4899' : '#6B7280', fontWeight: status === val ? 700 : 400, cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.15s' }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#9CA3AF' }}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 14, border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✌️</div>
            <h3 style={{ color: '#111827' }}>No {status} reviews</h3>
            <p style={{ color: '#9CA3AF' }}>You're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {reviews.map((r, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={r._id}
                style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', borderTop: `4px solid ${r.isApproved ? '#059669' : '#D97706'}`, padding: 20, display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(s => <FiStar key={s} size={14} fill={s <= r.rating ? '#FBBF24' : 'none'} color={s <= r.rating ? '#FBBF24' : '#D1D5DB'} />)}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 4 }}>
                      <strong style={{ color: '#111827' }}>{r.customer?.name || 'Customer'}</strong> on {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{ background: r.isApproved ? '#D1FAE5' : '#FEF3C7', color: r.isApproved ? '#059669' : '#D97706', padding: '2px 8px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 700 }}>
                    {r.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 16, flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Product: <span style={{ color: '#EC4899' }}>{r.product?.name || 'Unknown Item'}</span></p>
                  <p style={{ fontSize: '0.88rem', color: '#111827', lineHeight: 1.5, wordBreak: 'break-word', fontStyle: 'italic' }}>
                    "{r.comment}"
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                  {!r.isApproved && (
                    <button onClick={() => handleUpdate(r._id, true)} disabled={processing === r._id}
                      style={{ flex: 1, background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: 8, padding: '8px', cursor: processing === r._id ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <FiCheck /> Approve
                    </button>
                  )}
                  {r.isApproved && (
                    <button onClick={() => handleFeature(r._id, !r.isFeatured)} disabled={processing === r._id}
                      style={{ flex: 1, background: r.isFeatured ? '#FEF3C7' : '#EFF6FF', color: r.isFeatured ? '#D97706' : '#2563EB', border: `1px solid ${r.isFeatured ? '#FDE68A' : '#BFDBFE'}`, borderRadius: 8, padding: '8px', cursor: processing === r._id ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <FiStar fill={r.isFeatured ? '#D97706' : 'none'} /> {r.isFeatured ? 'Unfeature' : 'Feature on Home'}
                    </button>
                  )}
                  <button onClick={() => { if(window.confirm('Delete this review permanently?')) handleUpdate(r._id, false); }} disabled={processing === r._id}
                    style={{ flex: 1, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 8, padding: '8px', cursor: processing === r._id ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <FiX /> Reject & Delete
                  </button>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
