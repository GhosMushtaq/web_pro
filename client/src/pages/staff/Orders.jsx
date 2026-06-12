import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiSearch, FiEye, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const STATUS_MAP = {
  pending:        { label: 'Pending',    bg: '#FEF3C7', color: '#D97706' },
  admin_approved: { label: 'Approved',   bg: '#DBEAFE', color: '#2563EB' },
  processing:     { label: 'Processing', bg: '#E0E7FF', color: '#4F46E5' },
  shipped:        { label: 'Shipped',    bg: '#F3E8FF', color: '#7C3AED' },
  delivered:      { label: 'Delivered',  bg: '#D1FAE5', color: '#059669' },
  cancelled:      { label: 'Cancelled',  bg: '#FEE2E2', color: '#DC2626' },
};

const STAFF_CAN_SET = ['processing', 'shipped', 'delivered'];

function Badge({ status }) {
  const s = STATUS_MAP[status] || { label: status, bg: '#F3F4F6', color: '#6B7280' };
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>{s.label}</span>;
}

function OrderModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.orderStatus);
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/orders/${order._id}/status`, { status, note });
      toast.success('Order status updated!');
      onUpdate();
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Order #{order.orderNumber}</h3>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX /></button>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Customer</p>
            <strong style={{ fontSize: '0.9rem' }}>{order.customer?.name}</strong>
            <p style={{ fontSize: '0.78rem', color: '#6B7280' }}>{order.customer?.phone}</p>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Order Total</p>
            <strong style={{ fontSize: '1.1rem', color: '#EC4899' }}>Rs. {order.total?.toLocaleString()}</strong>
            <div style={{ marginTop: 4 }}><Badge status={order.orderStatus} /></div>
          </div>
        </div>

        {/* Delivery address */}
        {order.shippingAddress && (
          <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.83rem', color: '#1D4ED8' }}>
            📍 {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.province].filter(Boolean).join(', ')}
          </div>
        )}

        {/* Items */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 10 }}>Items ({order.items?.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F9FAFB', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 6, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎁'}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem' }}>{item.name}</strong>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>× {item.quantity} · Rs. {item.price?.toLocaleString()}</p>
                </div>
                <strong style={{ fontSize: '0.88rem' }}>Rs. {item.total?.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Update status */}
        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>Update Status</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <select value={status} onChange={e => setStatus(e.target.value)} id="staff-order-status"
              style={{ flex: 1, border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: '0.85rem' }}>
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <option key={k} value={k} disabled={!STAFF_CAN_SET.includes(k) && k !== order.orderStatus}>{v.label}{!STAFF_CAN_SET.includes(k) && k !== order.orderStatus ? ' (admin only)' : ''}</option>
              ))}
            </select>
            <button onClick={handleUpdate} disabled={saving} id="staff-update-status-btn"
              style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note (e.g. tracking number, courier name...)"
            style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '10px 12px', fontSize: '0.85rem', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StaffOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/orders?limit=100');
      setOrders(r.data.orders || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const displayed = orders.filter(o => {
    const matchStatus = !filter || o.orderStatus === filter;
    const matchSearch = !search || o.orderNumber?.toString().includes(search) || o.customer?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>Orders — Staff Panel</title></Helmet>

      <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>📦 Order Management</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>{displayed.length} orders</p>
        </div>
        <button onClick={load} id="staff-refresh-orders" style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ padding: 24 }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input placeholder="Search by order# or customer..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px 9px 32px', fontSize: '0.85rem', boxSizing: 'border-box' }} id="staff-order-search" />
          </div>
          {['', 'pending', 'admin_approved', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => {
            const info = STATUS_MAP[s];
            const active = filter === s;
            return (
              <button key={s} onClick={() => setFilter(s)}
                style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${active ? (info?.color || '#EC4899') : '#E5E7EB'}`, background: active ? (info?.bg || '#FDF2F8') : 'white', color: active ? (info?.color || '#EC4899') : '#6B7280', fontWeight: active ? 700 : 400, cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {s ? (info?.label || s) : 'All'}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>Loading orders...</td></tr>
                : displayed.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>No orders found</td></tr>
                  : displayed.map((o, i) => (
                    <motion.tr key={o._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }} onClick={() => setSelected(o)}>
                      <td style={{ padding: '12px 14px' }}><strong style={{ color: '#EC4899' }}>#{o.orderNumber}</strong></td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{o.customer?.name || 'Guest'}</div>
                        <div style={{ fontSize: '0.74rem', color: '#9CA3AF' }}>{o.customer?.phone}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#6B7280' }}>{o.items?.length}</td>
                      <td style={{ padding: '12px 14px' }}><strong>Rs. {o.total?.toLocaleString()}</strong></td>
                      <td style={{ padding: '12px 14px' }}><Badge status={o.orderStatus} /></td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.78rem', textTransform: 'capitalize', color: '#6B7280' }}>{o.paymentStatus?.replace(/_/g, ' ')}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#9CA3AF' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelected(o)} id={'staff-view-' + o._id}
                          style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600 }}>
                          <FiEye size={13} /> View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selected && <OrderModal order={selected} onClose={() => setSelected(null)} onUpdate={load} />}
      </AnimatePresence>
    </div>
  );
}
