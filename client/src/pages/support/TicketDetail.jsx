import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiRefreshCw } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../../services/api';

const STATUS_OPTS = [
  { value: 'open',        label: '🟢 Open' },
  { value: 'in_progress', label: '🔵 In Progress' },
  { value: 'waiting',     label: '🟡 Waiting on Customer' },
  { value: 'resolved',    label: '✅ Resolved' },
  { value: 'closed',      label: '🔒 Closed' },
];

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

export default function TicketDetail() {
  const { id } = useParams();
  const user   = useSelector(s => s.auth?.user);
  const [ticket, setTicket]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply]     = useState('');
  const [sending, setSending] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdating] = useState(false);
  const messagesEnd = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/support/' + id);
      setTicket(r.data.ticket);
      setNewStatus(r.data.ticket.status);
    } catch { toast.error('Failed to load ticket'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket?.messages]);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/support/${id}/reply`, { message: reply });
      setReply('');
      toast.success('Reply sent!');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await api.put(`/support/${id}/status`, { status: newStatus });
      toast.success('Status updated!');
      load();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#9CA3AF' }}>Loading ticket...</div>;
  if (!ticket) return <div style={{ textAlign: 'center', padding: 80, color: '#DC2626' }}>Ticket not found.</div>;

  const st = STATUS_MAP[ticket.status] || STATUS_MAP.open;
  const pr = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.medium;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>Ticket #{ticket.ticketNumber || ticket._id.toString().slice(-6)} — Support</title></Helmet>

      {/* Header */}
      <div style={{ background: 'white', padding: '14px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Link to={['support', 'admin'].includes(user?.role) ? "/support/tickets" : "/my-tickets"} style={{ color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}>
          <FiArrowLeft /> Back
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>
              #{ticket.ticketNumber || ticket._id.toString().slice(-6).toUpperCase()}
            </span>
            <span style={{ background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>{st.label}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pr.color }}>● {pr.label} Priority</span>
          </div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</h2>
        </div>
        <button onClick={load} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', flexShrink: 0 }}>
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        {/* Messages */}
        <div>
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            {/* Messages list */}
            <div style={{ padding: 20, maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ticket.messages?.map((msg, i) => {
                const isAgent = ['support', 'admin', 'staff'].includes(msg.senderRole);
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ display: 'flex', flexDirection: isAgent ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-start' }}>
                    {/* Avatar */}
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: isAgent ? 'linear-gradient(135deg,#2563EB,#7C3AED)' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.88rem', color: isAgent ? 'white' : '#6B7280', flexShrink: 0, overflow: 'hidden' }}>
                      {msg.sender?.avatar?.url
                        ? <img src={msg.sender.avatar.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (msg.sender?.name?.[0]?.toUpperCase() || (isAgent ? '🎧' : '👤'))}
                    </div>
                    {/* Bubble */}
                    <div style={{ maxWidth: '72%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexDirection: isAgent ? 'row-reverse' : 'row' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isAgent ? '#2563EB' : '#374151' }}>
                          {msg.sender?.name || (isAgent ? 'Support Agent' : 'Customer')}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{new Date(msg.sentAt).toLocaleTimeString()}</span>
                        {isAgent && <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '1px 6px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700 }}>AGENT</span>}
                      </div>
                      <div style={{ background: isAgent ? 'linear-gradient(135deg,#2563EB,#7C3AED)' : '#F3F4F6', color: isAgent ? 'white' : '#111827', padding: '10px 14px', borderRadius: isAgent ? '12px 2px 12px 12px' : '2px 12px 12px 12px', fontSize: '0.88rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {msg.message}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEnd} />
            </div>

            {/* Reply box */}
            <div style={{ borderTop: '1px solid #F3F4F6', padding: '14px 20px', display: 'flex', gap: 10 }}>
              <textarea value={reply} onChange={e => setReply(e.target.value)} id="reply-box"
                placeholder="Type your reply..." rows={3}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleReply(); }}
                style={{ flex: 1, border: '1px solid #D1D5DB', borderRadius: 10, padding: '10px 12px', fontSize: '0.88rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
              <button onClick={handleReply} disabled={sending || !reply.trim()} id="send-reply-btn"
                style={{ background: sending || !reply.trim() ? '#D1D5DB' : 'linear-gradient(135deg,#2563EB,#7C3AED)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: sending || !reply.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.88rem', flexShrink: 0, alignSelf: 'flex-end' }}>
                <FiSend /> {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#9CA3AF', paddingLeft: 20, paddingBottom: 10 }}>Ctrl+Enter to send quickly</p>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Customer Info */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16 }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 10 }}>Customer</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2563EB' }}>
                {ticket.customer?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', display: 'block' }}>{ticket.customer?.name || ticket.guestEmail || 'Guest'}</strong>
                <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{ticket.customer?.email}</span>
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16 }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 10 }}>Ticket Info</p>
            {[
              ['Category', ticket.category?.replace(/_/g, ' ')],
              ['Priority', <span style={{ color: pr.color, fontWeight: 700 }}>{pr.label}</span>],
              ['Messages', ticket.messages?.length],
              ['Opened', new Date(ticket.createdAt).toLocaleDateString()],
              ticket.resolvedAt && ['Resolved', new Date(ticket.resolvedAt).toLocaleDateString()],
            ].filter(Boolean).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F9FAFB' }}>
                <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>{key}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Update Status (Agents Only) */}
          {['support', 'admin'].includes(user?.role) && (
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 10 }}>Update Status</p>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} id="ticket-status-select"
                style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 10px', fontSize: '0.85rem', marginBottom: 10 }}>
                {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button onClick={handleStatusUpdate} disabled={updatingStatus || newStatus === ticket.status} id="update-ticket-status"
                style={{ width: '100%', background: newStatus === ticket.status ? '#F3F4F6' : 'linear-gradient(135deg,#2563EB,#7C3AED)', color: newStatus === ticket.status ? '#9CA3AF' : 'white', border: 'none', borderRadius: 8, padding: '10px', cursor: newStatus === ticket.status ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                {updatingStatus ? 'Updating…' : 'Apply Status'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
