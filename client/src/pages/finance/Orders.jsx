import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import api from '../../services/api';

const STATUS_MAP = {
  pending:        { label: 'Pending',    bg: '#FEF3C7', color: '#D97706' },
  admin_approved: { label: 'Approved',   bg: '#DBEAFE', color: '#2563EB' },
  processing:     { label: 'Processing', bg: '#E0E7FF', color: '#4F46E5' },
  shipped:        { label: 'Shipped',    bg: '#F3E8FF', color: '#7C3AED' },
  delivered:      { label: 'Delivered',  bg: '#D1FAE5', color: '#059669' },
  cancelled:      { label: 'Cancelled',  bg: '#FEE2E2', color: '#DC2626' },
};

const PAY_MAP = {
  pending:         { label: 'Pending',    bg: '#FEF3C7', color: '#D97706' },
  proof_submitted: { label: 'Proof Sent', bg: '#DBEAFE', color: '#2563EB' },
  verified:        { label: 'Verified',   bg: '#D1FAE5', color: '#059669' },
  rejected:        { label: 'Rejected',   bg: '#FEE2E2', color: '#DC2626' },
  paid:            { label: 'Paid',       bg: '#D1FAE5', color: '#059669' },
};

function Badge({ status, map }) {
  const s = map[status] || { label: status, bg: '#F3F4F6', color: '#6B7280' };
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

export default function FinanceOrders() {
  const [orders, setOrders]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [payFilter, setPay]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ limit: 100, ...(payFilter && { paymentStatus: payFilter }) }).toString();
      const r = await api.get('/orders?' + q);
      let list = r.data.orders || [];
      if (search) list = list.filter(o => o.orderNumber?.toString().includes(search) || o.customer?.name?.toLowerCase().includes(search.toLowerCase()));
      setOrders(list);
      setTotal(r.data.total || list.length);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [payFilter]);

  const totalRevenue = orders.filter(o => ['verified','paid'].includes(o.paymentStatus)).reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>Orders — Finance Panel</title></Helmet>

      <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>📦 Orders — Finance View</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>{orders.length} orders · Verified Revenue: Rs. {totalRevenue.toLocaleString()}</p>
        </div>
        <button onClick={load} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ padding: 24 }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input placeholder="Search by order # or customer name..." value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
              style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px 9px 32px', fontSize: '0.85rem', boxSizing: 'border-box' }} id="finance-search" />
          </div>
          <select value={payFilter} onChange={e => setPay(e.target.value)}
            style={{ border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: '0.85rem', minWidth: 160 }} id="payment-filter">
            <option value="">All Payments</option>
            {Object.entries(PAY_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={load} style={{ background: '#EC4899', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Search</button>
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Order #', 'Customer', 'Items', 'Total', 'Payment Method', 'Payment Status', 'Order Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>No orders found</td></tr>
              ) : orders.map((o, i) => (
                <motion.tr key={o._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px' }}><strong style={{ color: '#EC4899' }}>#{o.orderNumber}</strong></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{o.customer?.name || 'Guest'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{o.customer?.phone}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280' }}>{o.items?.length}</td>
                  <td style={{ padding: '12px 16px' }}><strong style={{ fontSize: '0.9rem' }}>Rs. {o.total?.toLocaleString()}</strong></td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', textTransform: 'capitalize', color: '#374151' }}>{o.paymentMethod?.replace('_', ' ') || '—'}</td>
                  <td style={{ padding: '12px 16px' }}><Badge status={o.paymentStatus} map={PAY_MAP} /></td>
                  <td style={{ padding: '12px 16px' }}><Badge status={o.orderStatus} map={STATUS_MAP} /></td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9CA3AF' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
