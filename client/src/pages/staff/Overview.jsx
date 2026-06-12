import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiAlertTriangle, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import api from '../../services/api';

function StatCard({ icon, label, value, color, bg, link }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: bg, borderRadius: 14, padding: '20px 22px', border: '1px solid #E5E7EB', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '1.2rem' }}>
          {icon}
        </div>
        {link && (
          <Link to={link} style={{ color, fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            View <FiArrowRight size={12} />
          </Link>
        )}
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: 6 }}>{label}</div>
      </div>
    </motion.div>
  );
}

export default function StaffOverview() {
  const user = useSelector(s => s.auth?.user);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [pendingOrders, setPending] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [inv, ls, orders] = await Promise.all([
        api.get('/inventory/overview'),
        api.get('/inventory/low-stock'),
        api.get('/orders?limit=5'),
      ]);
      setOverview(inv.data);
      setLowStock(ls.data.products || []);
      const all = orders.data.orders || [];
      setPending(all.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'admin_approved').length);
      setRecentOrders(all.slice(0, 5));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>Staff Dashboard — Gifting Bliss</title></Helmet>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', padding: '28px 32px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>
              {greeting}, {user?.name?.split(' ')[0] || 'Staff'} 👋
            </h1>
            <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>
              Staff Dashboard · {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={load}
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '8px 16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#9CA3AF' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
              <StatCard icon={<FiShoppingCart />} label="Orders to Process" value={pendingOrders} color="#EC4899" bg="white" link="/staff/orders" />
              <StatCard icon={<FiPackage />} label="Total Products" value={overview?.totalProducts} color="#8B5CF6" bg="white" link="/staff/inventory" />
              <StatCard icon={<FiAlertTriangle />} label="Low Stock Items" value={overview?.lowStock} color="#D97706" bg="white" link="/staff/inventory" />
              <StatCard icon="📦" label="Out of Stock" value={overview?.outOfStock} color="#DC2626" bg="white" link="/staff/inventory" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Recent Orders */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>📦 Recent Orders</h3>
                  <Link to="/staff/orders" style={{ fontSize: '0.8rem', color: '#EC4899', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View All <FiArrowRight size={12} /></Link>
                </div>
                {recentOrders.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>No recent orders</p>
                ) : recentOrders.map((o, i) => {
                  const statusColors = { pending: '#D97706', admin_approved: '#2563EB', processing: '#4F46E5', shipped: '#7C3AED', delivered: '#059669', cancelled: '#DC2626' };
                  const sc = statusColors[o.orderStatus] || '#6B7280';
                  return (
                    <motion.div key={o._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recentOrders.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#EC4899' }}>#{o.orderNumber}</strong>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{o.customer?.name} · {o.items?.length} item(s)</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: sc + '20', color: sc, padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700 }}>
                          {o.orderStatus?.replace(/_/g, ' ')}
                        </span>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827', marginTop: 2 }}>Rs. {o.total?.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Low Stock Alert */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>⚠️ Low Stock Alerts</h3>
                  <Link to="/staff/inventory" style={{ fontSize: '0.8rem', color: '#EC4899', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>Manage <FiArrowRight size={12} /></Link>
                </div>
                {lowStock.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                    <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>All products well-stocked!</p>
                  </div>
                ) : lowStock.slice(0, 6).map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < Math.min(lowStock.length, 6) - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: '#FEF3C7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.images?.[0]?.url
                        ? <img src={p.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '1.1rem' }}>🎁</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.83rem', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{p.collection?.name}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ background: p.stock === 0 ? '#FEE2E2' : '#FEF3C7', color: p.stock === 0 ? '#DC2626' : '#D97706', padding: '2px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 800 }}>
                        {p.stock === 0 ? '⛔ OUT' : `${p.stock} left`}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
