import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../../services/api';

const STATUS_MAP = {
  open:        { label: 'Open',        bg: '#D1FAE5', color: '#059669' },
  waiting:     { label: 'Waiting',     bg: '#FEF3C7', color: '#D97706' },
  in_progress: { label: 'In Progress', bg: '#DBEAFE', color: '#2563EB' },
  resolved:    { label: 'Resolved',    bg: '#F3F4F6', color: '#6B7280' },
  closed:      { label: 'Closed',      bg: '#F3F4F6', color: '#9CA3AF' },
};

const PRIORITY_MAP = {
  low:    { label: 'Low',    color: '#059669', dot: '🟢' },
  medium: { label: 'Medium', color: '#D97706', dot: '🟡' },
  high:   { label: 'High',   color: '#DC2626', dot: '🔴' },
  urgent: { label: 'Urgent', color: '#7C2D12', dot: '🚨' },
};

const CATEGORY_LABELS = {
  order:     '📦 Order Issue',
  payment:   '💳 Payment',
  product:   '🎁 Product Query',
  shipping:  '🚚 Shipping/Delivery',
  returns:   '↩️ Return/Refund',
  general:   '💬 General/Feedback',
};

function Badge({ map, value, fallback }) {
  const s = map[value] || { label: fallback || value, bg: '#F3F4F6', color: '#6B7280' };
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('');
  const [priority, setPri]    = useState('');
  const location = useLocation();
  const [category, setCategory] = useState(location.state?.category || '');
  const [search, setSearch]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ limit: 100, ...(status && { status }), ...(priority && { priority }), ...(category && { category }) }).toString();
      const r = await api.get('/support?' + q);
      let list = r.data.tickets || [];
      if (search) list = list.filter(t => t.subject?.toLowerCase().includes(search.toLowerCase()) || t.customer?.name?.toLowerCase().includes(search.toLowerCase()) || t.guestEmail?.includes(search));
      setTickets(list);
      setTotal(r.data.total || 0);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status, priority, category]);

  const timeSince = d => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>All Tickets — Support Panel</title></Helmet>

      <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>🎫 Support Tickets</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>{tickets.length} tickets</p>
        </div>
        <button onClick={load} id="refresh-tickets-btn"
          style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ padding: 24 }}>
        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {[['', 'All'], ['open', 'Open'], ['in_progress', 'In Progress'], ['waiting', 'Waiting'], ['resolved', 'Resolved']].map(([val, lbl]) => (
            <button key={val} onClick={() => setStatus(val)}
              style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${status === val ? '#2563EB' : '#E5E7EB'}`, background: status === val ? '#EFF6FF' : 'white', color: status === val ? '#2563EB' : '#6B7280', fontWeight: status === val ? 700 : 400, cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.15s' }}>
              {lbl}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {/* Priority + Search */}
          <select value={priority} onChange={e => setPri(e.target.value)} id="priority-filter"
            style={{ border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 12px', fontSize: '0.82rem', color: '#374151' }}>
            <option value="">All Priorities</option>
            {Object.entries(PRIORITY_MAP).map(([k, v]) => <option key={k} value={k}>{v.dot} {v.label}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} id="category-filter"
            style={{ border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 12px', fontSize: '0.82rem', color: '#374151' }}>
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input placeholder="Search by subject or customer name..." value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} id="ticket-search"
            style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px 9px 32px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
        </div>

        {/* Ticket Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#9CA3AF' }}>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 14, border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
            <h3 style={{ color: '#111827' }}>All clear!</h3>
            <p style={{ color: '#9CA3AF' }}>No tickets match your current filter.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tickets.map((t, i) => {
              const st = STATUS_MAP[t.status] || STATUS_MAP.open;
              const pr = PRIORITY_MAP[t.priority] || PRIORITY_MAP.medium;
              const lastMsg = t.messages?.[t.messages.length - 1];
              const isUrgent = t.priority === 'urgent' || t.priority === 'high';

              return (
                <Link to={'/support/tickets/' + t._id} key={t._id} style={{ textDecoration: 'none' }}>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ background: 'white', borderRadius: 12, border: `1px solid ${isUrgent && t.status !== 'resolved' ? '#FCA5A5' : '#E5E7EB'}`, borderLeft: `4px solid ${st.color}`, padding: '14px 18px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                    whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.07)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.8rem' }}>
                            #{t.ticketNumber || t._id.toString().slice(-6).toUpperCase()}
                          </span>
                          <span style={{ background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 700 }}>{st.label}</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: pr.color }}>{pr.dot} {pr.label}</span>
                          <span style={{ fontSize: '0.72rem', color: '#9CA3AF', background: '#F3F4F6', padding: '2px 7px', borderRadius: 10 }}>
                            {CATEGORY_LABELS[t.category] || t.category}
                          </span>
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111827', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.subject}
                        </p>
                        {lastMsg && (
                          <p style={{ fontSize: '0.79rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            💬 "{lastMsg.message?.slice(0, 100)}{lastMsg.message?.length > 100 ? '…' : ''}"
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{t.customer?.name || t.guestEmail || 'Guest'}</p>
                        <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 2 }}>{timeSince(t.createdAt)}</p>
                        <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 2 }}>{t.messages?.length || 0} message{t.messages?.length !== 1 ? 's' : ''}</p>
                        {t.assignedTo && (
                          <p style={{ fontSize: '0.7rem', color: '#2563EB', marginTop: 4, fontWeight: 600 }}>→ {t.assignedTo.name}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
