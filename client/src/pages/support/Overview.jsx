import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiRefreshCw, FiArrowRight, FiMessageSquare } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const STATUS_MAP = {
  open:        { label: 'Open',         bg: '#D1FAE5', color: '#059669' },
  waiting:     { label: 'Waiting',      bg: '#FEF3C7', color: '#D97706' },
  in_progress: { label: 'In Progress',  bg: '#DBEAFE', color: '#2563EB' },
  resolved:    { label: 'Resolved',     bg: '#F3F4F6', color: '#6B7280' },
  closed:      { label: 'Closed',       bg: '#F3F4F6', color: '#9CA3AF' },
};

const PRIORITY_MAP = {
  low:      { label: 'Low',    color: '#059669' },
  medium:   { label: 'Medium', color: '#D97706' },
  high:     { label: 'High',   color: '#DC2626' },
  urgent:   { label: 'Urgent', color: '#7C2D12' },
};

function StatCard({ icon, label, value, color, bg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: bg || 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid #E5E7EB' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: color || '#111827', lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 6 }}>{label}</div>
    </motion.div>
  );
}

export default function SupportOverview() {
  const user = useSelector(s => s.auth?.user);
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState({});
  const [recentTickets, setRecent] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [all, open, progress, resolved] = await Promise.all([
        api.get('/support?limit=5'),
        api.get('/support?status=open&limit=1'),
        api.get('/support?status=in_progress&limit=1'),
        api.get('/support?status=resolved&limit=1'),
      ]);
      setRecent(all.data.tickets || []);
      setStats({
        total:      all.data.total || 0,
        open:       open.data.total || 0,
        inProgress: progress.data.total || 0,
        resolved:   resolved.data.total || 0,
      });
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>Support Dashboard — Gifting Bliss</title></Helmet>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', padding: '28px 32px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>
              {greeting}, {user?.name?.split(' ')[0] || 'Support'} 🎧
            </h1>
            <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>
              Customer Support · {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={load}
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '8px 16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
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
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
              <StatCard icon="🎫" label="Total Tickets" value={stats.total} color="#111827" bg="white" />
              <StatCard icon="🟢" label="Open" value={stats.open} color="#059669" bg="#F0FDF4" />
              <StatCard icon="🔵" label="In Progress" value={stats.inProgress} color="#2563EB" bg="#EFF6FF" />
              <StatCard icon="✅" label="Resolved" value={stats.resolved} color="#6B7280" bg="#F9FAFB" />
            </div>

            {/* Recent Tickets */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiMessageSquare style={{ color: '#2563EB' }} /> Recent Tickets
                </h3>
                <Link to="/support/tickets" style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View All <FiArrowRight size={12} />
                </Link>
              </div>

              {recentTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎉</div>
                  <p style={{ color: '#9CA3AF' }}>No tickets yet! Enjoying the quiet.</p>
                </div>
              ) : recentTickets.map((t, i) => {
                const st = STATUS_MAP[t.status] || STATUS_MAP.open;
                const pr = PRIORITY_MAP[t.priority] || PRIORITY_MAP.medium;
                return (
                  <Link to={'/support/tickets/' + t._id} key={t._id} style={{ textDecoration: 'none' }}>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < recentTickets.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.8rem' }}>#{t.ticketNumber || t._id.toString().slice(-6).toUpperCase()}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: pr.color }}>● {pr.label}</span>
                          <span style={{ background: st.bg, color: st.color, padding: '1px 7px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700 }}>{st.label}</span>
                        </div>
                        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{t.subject}</p>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{t.customer?.name || t.guestEmail || 'Guest'} · {new Date(t.createdAt).toLocaleString()}</p>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginLeft: 16, flexShrink: 0 }}>
                         {t.messages?.length || 0} msg{t.messages?.length !== 1 ? 's' : ''}
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Links Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <Link to="/support/reviews" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ y: -2 }} style={{ background: 'white', borderRadius: 14, padding: '20px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FDF2F8', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⭐</div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: 0 }}>Product Reviews</h3>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, marginTop: 2 }}>Manage customer ratings</p>
                    </div>
                  </div>
                  <FiArrowRight color="#9CA3AF" />
                </motion.div>
              </Link>
              <Link to="/support/tickets" state={{ category: 'returns' }} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ y: -2 }} style={{ background: 'white', borderRadius: 14, padding: '20px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>↩️</div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: 0 }}>Refund Requests</h3>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, marginTop: 2 }}>View return/refund tickets</p>
                    </div>
                  </div>
                  <FiArrowRight color="#9CA3AF" />
                </motion.div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
