import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlus, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';

const STATUS_MAP = {
  open:        { label: 'Open',        bg: '#D1FAE5', color: '#059669' },
  waiting:     { label: 'Waiting',     bg: '#FEF3C7', color: '#D97706' },
  in_progress: { label: 'In Progress', bg: '#DBEAFE', color: '#2563EB' },
  resolved:    { label: 'Resolved',    bg: '#F3F4F6', color: '#6B7280' },
  closed:      { label: 'Closed',      bg: '#F3F4F6', color: '#9CA3AF' },
};

const PRIORITY_MAP = {
  low:    { label: 'Low',    color: '#059669' },
  medium: { label: 'Medium', color: '#D97706' },
  high:   { label: 'High',   color: '#DC2626' },
  urgent: { label: 'Urgent', color: '#7C2D12' },
};

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/support/my')
      .then(res => setTickets(res.data.tickets || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '40px 20px' }}>
      <Helmet><title>My Support Tickets — Gifting Bliss</title></Helmet>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#111827', margin: 0, fontFamily: 'var(--font-display)' }}>🎫 My Tickets</h1>
            <p style={{ color: '#6B7280', marginTop: 4 }}>Check your support requests and replies.</p>
          </div>
          <Link to="/contact-support" style={{
            background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white', textDecoration: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <FiPlus /> New Ticket
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#9CA3AF' }}>Loading your tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: 60, textAlign: 'center', border: '1px solid #FCE7F3' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
            <h3 style={{ color: '#111827', marginBottom: 8 }}>No active requests!</h3>
            <p style={{ color: '#6B7280', marginBottom: 24 }}>Need help with an order, or looking for a refund?</p>
            <Link to="/contact-support" className="btn btn-primary" style={{ display: 'inline-flex' }}>Contact Support</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tickets.map((t, i) => {
              const st = STATUS_MAP[t.status] || STATUS_MAP.open;
              const pr = PRIORITY_MAP[t.priority] || PRIORITY_MAP.medium;
              return (
                <Link to={'/my-tickets/' + t._id} key={t._id} onClick={(e) => {
                  e.preventDefault(); 
                  window.location.href = '/my-tickets/' + t._id;
                }} style={{ textDecoration: 'none' }}>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', borderLeft: `4px solid ${st.color}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: '#111827', fontSize: '0.88rem' }}>
                          #{t.ticketNumber}
                        </span>
                        <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
                          {st.label}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pr.color }}>● {pr.label}</span>
                      </div>
                      <p style={{ color: '#374151', fontWeight: 600, fontSize: '0.95rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.subject}
                      </p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: 4 }}>
                        {new Date(t.createdAt).toLocaleDateString()} · {t.messages?.length || 0} messages
                      </p>
                    </div>

                    <div style={{ background: '#F9FAFB', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0 }}>
                      <FiArrowRight />
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
