import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CATEGORIES = [
  { value: 'order',         label: 'Order Issue' },
  { value: 'payment',       label: 'Payment Problem' },
  { value: 'returns',       label: 'Return / Refund Request' },
  { value: 'product',       label: 'Product Query' },
  { value: 'shipping',      label: 'Shipping / Delivery' },
  { value: 'general',       label: 'General Inquiry / Feedback' }
];

export default function ContactSupport() {
  const user = useSelector(s => s.auth?.user);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    guestEmail: user?.email || '',
    subject:    '',
    category:   'general',
    priority:   'medium',
    message:    ''
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      return toast.error('Please fill in all required fields');
    }
    if (!user && !form.guestEmail.trim()) {
      return toast.error('Please provide an email address');
    }

    setLoading(true);
    try {
      const res = await api.post('/support', form);
      toast.success('Support ticket created successfully!');
      
      if (user) {
        navigate('/my-tickets');
      } else {
        setForm({ guestEmail: '', subject: '', category: 'general', priority: 'medium', message: '' });
        toast('We will contact you via email shortly.', { icon: '📧' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', background: '#F9FAFB', padding: '40px 20px' }}>
      <Helmet><title>Contact Support — Gifting Bliss</title></Helmet>
      
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'white', borderRadius: 16, padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.8rem', color: '#111827', margin: 0 }}>How can we help?</h1>
            <p style={{ color: '#6B7280', marginTop: 8 }}>
              {form.category === 'returns' 
                ? "Request a refund or return an item. Please include your order number." 
                : "Send us a message and our support team will get back to you quickly."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!user && (
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Email Address *</label>
                <input type="email" required className="input" value={form.guestEmail} onChange={e => set('guestEmail', e.target.value)} placeholder="you@example.com" />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Category *</label>
              <select className="input" value={form.category} onChange={e => {
                set('category', e.target.value);
                if (e.target.value === 'returns') set('priority', 'high');
              }}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Subject *</label>
                <input type="text" required className="input" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Where is my order?" />
              </div>
              <div style={{ width: 140 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Priority</label>
                <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                Message * {form.category === 'returns' && <span style={{ color: '#DC2626' }}>(Please include Order #)</span>}
              </label>
              <textarea required className="input" value={form.message} onChange={e => set('message', e.target.value)} rows={5} placeholder="Describe your issue in detail..." style={{ resize: 'vertical' }} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', marginTop: 10, padding: '14px', background: loading ? '#D1D5DB' : 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
