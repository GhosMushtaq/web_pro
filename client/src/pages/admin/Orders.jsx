import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders } from '../../store/slices/orderSlice';
import { AdminSidebar } from './Overview';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMenu, FiRefreshCw, FiEye, FiX, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import './AdminDashboard.css';

const STATUS_LABELS = {
  pending:        { label: 'Pending',        bg: '#FEF3C7', color: '#D97706' },
  admin_approved: { label: 'Approved',       bg: '#DBEAFE', color: '#2563EB' },
  processing:     { label: 'Processing',     bg: '#E0E7FF', color: '#4F46E5' },
  shipped:        { label: 'Shipped',        bg: '#F3E8FF', color: '#7C3AED' },
  delivered:      { label: 'Delivered',      bg: '#D1FAE5', color: '#059669' },
  cancelled:      { label: 'Cancelled',      bg: '#FEE2E2', color: '#DC2626' },
  returned:       { label: 'Returned',       bg: '#FEE2E2', color: '#B91C1C' },
};

const PAYMENT_LABELS = {
  pending:          { label: 'Pending',    bg: '#FEF3C7', color: '#D97706' },
  proof_submitted:  { label: 'Proof Sent', bg: '#DBEAFE', color: '#2563EB' },
  verified:         { label: 'Verified',   bg: '#D1FAE5', color: '#059669' },
  rejected:         { label: 'Rejected',   bg: '#FEE2E2', color: '#DC2626' },
  paid:             { label: 'Paid',       bg: '#D1FAE5', color: '#059669' },
  refunded:         { label: 'Refunded',   bg: '#F3F4F6', color: '#6B7280' },
};

function StatusBadge({ status, map }) {
  const s = map[status] || { label: status, bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const [status, setStatus] = useState(order.orderStatus);
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/orders/${order._id}/status`, { status, note });
      toast.success('Status updated!');
      onStatusChange();
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 600 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
        <div className="admin-modal-header">
          <h3>Order #{order.orderNumber}</h3>
          <button className="admin-modal-close" onClick={onClose}><FiX /></button>
        </div>

        {/* Customer Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>Customer</p>
            <strong>{order.customer?.name || 'Guest'}</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{order.customer?.email}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{order.customer?.phone}</p>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>Order Info</p>
            <p style={{ fontSize: '0.82rem' }}>Date: <strong>{new Date(order.createdAt).toLocaleDateString()}</strong></p>
            <p style={{ fontSize: '0.82rem' }}>Total: <strong>Rs. {order.total?.toLocaleString()}</strong></p>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <StatusBadge status={order.orderStatus} map={STATUS_LABELS} />
              {/* Only show payment status badge for online payment orders */}
              {order.paymentMethod !== 'cod' && (
                <StatusBadge status={order.paymentStatus} map={PAYMENT_LABELS} />
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 10 }}>Order Items ({order.items?.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                {item.image
                  ? <img src={item.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                  : <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--pink-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎁</div>
                }
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem' }}>{item.name}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}</p>
                </div>
                <strong style={{ fontSize: '0.88rem' }}>Rs. {item.total?.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        {order.shippingAddress && (
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--dark)' }}>📍 Delivery Address:</strong>{' '}
            {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.province].filter(Boolean).join(', ')}
          </div>
        )}

        {/* Update Status */}
        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, color: 'var(--dark)' }}>Update Order Status</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="input" value={status} onChange={e => setStatus(e.target.value)} id="order-status-select" style={{ flex: 1 }}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleUpdate} disabled={saving} id="update-status-btn" style={{ flexShrink: 0 }}>
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
          <textarea className="input" style={{ marginTop: 8, resize: 'vertical' }} rows={2}
            placeholder="Optional note for customer (e.g. tracking number, reason for delay...)"
            value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { allOrders, loading } = useSelector(s => s.orders);
  const [sidebar, setSidebar]   = useState(false);
  const [filter, setFilter]     = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => dispatch(fetchAllOrders());
  useEffect(() => { load(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you absolutely sure you want to permanently delete this order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order deleted successfully');
      load();
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete order');
    }
  };

  const orders = filter ? allOrders.filter(o => o.orderStatus === filter) : allOrders;

  const FILTERS = ['', 'pending', 'admin_approved', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="admin-layout">
      <Helmet><title>Orders — Admin Dashboard</title></Helmet>
      <AdminSidebar open={sidebar} onClose={() => setSidebar(false)} />

      <div className="admin-content">
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebar(true)} id="admin-orders-menu"><FiMenu /></button>
          <div>
            <h1 className="admin-page-title">📦 Order Management</h1>
            <p className="admin-page-subtitle">{allOrders.length} total orders</p>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={load} id="refresh-orders-btn"><FiRefreshCw /></button>
          </div>
        </div>

        <div className="admin-body">
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {FILTERS.map(s => {
              const info = STATUS_LABELS[s];
              const active = filter === s;
              return (
                <button key={s} onClick={() => setFilter(s)}
                  style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${active ? 'var(--pink-400)' : '#E5E7EB'}`, background: active ? 'var(--pink-50)' : 'white', color: active ? 'var(--pink-600)' : 'var(--muted)', fontWeight: active ? 700 : 400, cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.2s' }}>
                  {s ? (info?.label || s) : 'All Orders'}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="admin-data-table">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading orders...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                    {filter ? `No ${STATUS_LABELS[filter]?.label} orders` : 'No orders yet'}
                  </td></tr>
                ) : orders.map(o => (
                  <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(o)}>
                    <td><strong style={{ color: 'var(--pink-600)' }}>#{o.orderNumber}</strong></td>
                    <td>
                      <strong style={{ fontSize: '0.88rem' }}>{o.customer?.name || 'Guest'}</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{o.customer?.phone}</p>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{o.items?.length} item(s)</td>
                    <td><strong style={{ color: 'var(--dark)' }}>Rs. {o.total?.toLocaleString()}</strong></td>
                    <td>
                      {/* Payment method pill always visible */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                          background: o.paymentMethod === 'cod' ? '#F3F4F6' : o.paymentMethod === 'easypaisa' ? '#F3E8FF' : '#FEE2E2',
                          color:      o.paymentMethod === 'cod' ? '#374151' : o.paymentMethod === 'easypaisa' ? '#7C3AED'  : '#B91C1C'
                        }}>
                          {o.paymentMethod === 'cod' ? '💵' : o.paymentMethod === 'easypaisa' ? '🟣' : '🔴'}
                          {o.paymentMethod === 'cod' ? 'COD' : o.paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'}
                        </span>
                        {/* Payment status only for online orders */}
                        {o.paymentMethod !== 'cod' && (
                          <StatusBadge status={o.paymentStatus} map={PAYMENT_LABELS} />
                        )}
                      </div>
                    </td>
                    <td><StatusBadge status={o.orderStatus} map={STATUS_LABELS} /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '5px 10px' }}
                          onClick={() => setSelected(o)} id={'view-order-' + o._id}>
                          <FiEye />
                        </button>
                        <button className="btn btn-sm" style={{ padding: '5px 10px', background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, cursor: 'pointer' }}
                          onClick={(e) => handleDelete(e, o._id)} title="Delete Order">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <OrderDetailModal
            order={selected}
            onClose={() => setSelected(null)}
            onStatusChange={load}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
