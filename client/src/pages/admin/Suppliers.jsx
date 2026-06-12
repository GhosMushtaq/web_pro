import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './Overview';
import {
  FiMenu, FiPlus, FiEdit2, FiTrash2, FiX, FiSearch,
  FiRefreshCw, FiStar, FiTruck, FiDollarSign, FiPackage,
  FiFileText, FiBarChart2, FiClock, FiCalendar, FiCheckCircle,
  FiAlertCircle, FiChevronDown, FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './AdminDashboard.css';

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = ['General', 'Gifting', 'Packaging', 'Raw Materials', 'Electronics', 'Textiles', 'Stationery', 'Food & Beverage', 'Other'];
const PAYMENT_TERMS = ['Advance', 'COD', 'Net 15', 'Net 30', 'Net 60', 'Monthly'];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Online'];
const STATUS_COLORS = {
  active:      { bg: '#D1FAE5', color: '#059669' },
  inactive:    { bg: '#F3F4F6', color: '#6B7280' },
  blacklisted: { bg: '#FEE2E2', color: '#DC2626' },
};
const ORDER_STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', color: '#D97706' },
  confirmed: { bg: '#DBEAFE', color: '#2563EB' },
  shipped:   { bg: '#EDE9FE', color: '#7C3AED' },
  received:  { bg: '#D1FAE5', color: '#059669' },
  cancelled: { bg: '#FEE2E2', color: '#DC2626' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StarRating({ value }) {
  return (
    <span style={{ color: '#F59E0B', fontSize: '0.85rem' }}>
      {[1,2,3,4,5].map(s => s <= Math.round(value) ? '★' : '☆').join('')}
    </span>
  );
}

function daysUntil(date) {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function CountdownChip({ endDate }) {
  const days = daysUntil(endDate);
  if (days < 0)  return <span style={{ background: '#FEE2E2', color: '#DC2626',  padding: '2px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600 }}>Expired</span>;
  if (days <= 7) return <span style={{ background: '#FEF3C7', color: '#D97706',  padding: '2px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600 }}>⚠️ {days}d left</span>;
  if (days <= 30) return <span style={{ background: '#FEF9C3', color: '#CA8A04', padding: '2px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600 }}>{days}d left</span>;
  return <span style={{ background: '#D1FAE5', color: '#059669', padding: '2px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600 }}>{days}d left</span>;
}

// ─── Modal: Add/Edit Supplier ────────────────────────────────────────────────
function SupplierFormModal({ supplier, onClose, onSaved }) {
  const editing = !!supplier;
  const [form, setForm] = useState({
    companyName:   supplier?.companyName   || '',
    contactPerson: supplier?.contactPerson || '',
    email:         supplier?.email         || '',
    phone:         supplier?.phone         || '',
    address:       supplier?.address       || '',
    category:      supplier?.category      || 'General',
    taxId:         supplier?.taxId         || '',
    status:        supplier?.status        || 'active',
    rating:        supplier?.rating        || 3,
    creditLimit:   supplier?.creditLimit   || '',
    paymentTerms:  supplier?.paymentTerms  || 'Advance',
    notes:         supplier?.notes         || '',
    tags:          supplier?.tags?.join(', ') || '',
    bankName:      supplier?.bankName      || '',
    accountTitle:  supplier?.accountTitle  || '',
    accountNumber: supplier?.accountNumber || '',
    iban:          supplier?.iban          || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.companyName.trim()) return toast.error('Company name is required');
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [], creditLimit: Number(form.creditLimit) || 0 };
      if (editing) { await api.put(`/suppliers/${supplier._id}`, payload); toast.success('Supplier updated!'); }
      else          { await api.post('/suppliers', payload);               toast.success('Supplier added!'); }
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 680 }} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        <div className="admin-modal-header" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <h3>{editing ? '✏️ Edit Supplier' : '➕ Add New Supplier'}</h3>
          <button className="admin-modal-close" onClick={onClose}><FiX /></button>
        </div>

        {/* Section: Company Info */}
        <div style={{ background: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏢 Company Info</h4>
          <div className="admin-form-grid">
            <div className="admin-form-group"><label>Company Name *</label><input className="input" value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="e.g. ABC Suppliers Ltd." /></div>
            <div className="admin-form-group"><label>Contact Person</label><input className="input" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} placeholder="e.g. Ali Khan" /></div>
            <div className="admin-form-group"><label>Email</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="supplier@email.com" /></div>
            <div className="admin-form-group"><label>Phone</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="03XXXXXXXXX" /></div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}><label>Address</label><input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full street address" /></div>
            <div className="admin-form-group"><label>Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-form-group"><label>Tax ID / NTN</label><input className="input" value={form.taxId} onChange={e => set('taxId', e.target.value)} placeholder="NTN or CNIC" /></div>
          </div>
        </div>

        {/* Section: Business Terms */}
        <div style={{ background: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>💼 Business Terms</h4>
          <div className="admin-form-grid">
            <div className="admin-form-group"><label>Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>
            <div className="admin-form-group"><label>Payment Terms</label>
              <select className="input" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
                {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="admin-form-group"><label>Credit Limit (Rs.)</label><input className="input" type="number" value={form.creditLimit} onChange={e => set('creditLimit', e.target.value)} placeholder="e.g. 100000" /></div>
            <div className="admin-form-group"><label>Rating (1–5)</label>
              <select className="input" value={form.rating} onChange={e => set('rating', Number(e.target.value))}>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5-r)} ({r})</option>)}
              </select>
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}><label>Tags (comma separated)</label><input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. trusted, local, bulk" /></div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}><label>Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes about this supplier..." style={{ resize: 'vertical' }} /></div>
          </div>
        </div>

        {/* Section: Bank Details */}
        <div style={{ background: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏦 Bank Details</h4>
          <div className="admin-form-grid">
            <div className="admin-form-group"><label>Bank Name</label><input className="input" value={form.bankName} onChange={e => set('bankName', e.target.value)} placeholder="e.g. HBL, Meezan" /></div>
            <div className="admin-form-group"><label>Account Title</label><input className="input" value={form.accountTitle} onChange={e => set('accountTitle', e.target.value)} placeholder="Account holder name" /></div>
            <div className="admin-form-group"><label>Account Number</label><input className="input" value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="XXXXXXXXXXXXXXXX" /></div>
            <div className="admin-form-group"><label>IBAN</label><input className="input" value={form.iban} onChange={e => set('iban', e.target.value)} placeholder="PK00XXXX..." /></div>
          </div>
        </div>

        <div className="admin-form-actions" style={{ position: 'sticky', bottom: -1, background: 'white', paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-supplier-btn">
            {saving ? 'Saving...' : editing ? '💾 Update Supplier' : '✅ Add Supplier'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Modal: Supplier Detail ───────────────────────────────────────────────────
function SupplierDetailModal({ supplier, onClose, onRefresh }) {
  const [inner, setInner] = useState('profile');

  const totalPaid = supplier.paymentHistory?.reduce((s, p) => p.status === 'paid' ? s + p.amount : s, 0) || 0;
  const totalOrders = supplier.orderHistory?.length || 0;
  const activeDeals = supplier.dealHistory?.filter(d => d.status === 'active').length || 0;

  return (
    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 720, maxHeight: '90vh' }} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#FF2D7A,#FF6FA1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.3rem', flexShrink: 0 }}>
            {supplier.companyName?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{supplier.companyName}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>{supplier.contactPerson} · {supplier.phone}</p>
          </div>
          <span style={{ ...STATUS_COLORS[supplier.status], padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize' }}>{supplier.status}</span>
          <button className="admin-modal-close" onClick={onClose}><FiX /></button>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total Paid', value: `Rs. ${totalPaid.toLocaleString()}`, icon: '💰' },
            { label: 'Purchase Orders', value: totalOrders, icon: '📦' },
            { label: 'Active Deals', value: activeDeals, icon: '🤝' },
          ].map(s => (
            <div key={s.label} style={{ background: '#F9FAFB', borderRadius: 10, padding: '12px 14px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', margin: '2px 0' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Inner Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#F3F4F6', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
          {[
            { key: 'profile',  label: '👤 Profile' },
            { key: 'orders',   label: `📦 Orders (${totalOrders})` },
            { key: 'payments', label: `💳 Payments (${supplier.paymentHistory?.length || 0})` },
            { key: 'deals',    label: `🤝 Deals (${supplier.dealHistory?.length || 0})` },
            { key: 'activity', label: '📋 Activity' },
          ].map(t => (
            <button key={t.key} onClick={() => setInner(t.key)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: inner === t.key ? 'white' : 'transparent', color: inner === t.key ? 'var(--pink-600)' : 'var(--muted)', boxShadow: inner === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {/* Profile */}
          {inner === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['📧 Email', supplier.email || '—'],
                ['📱 Phone', supplier.phone || '—'],
                ['📂 Category', supplier.category || '—'],
                ['💳 Payment Terms', supplier.paymentTerms || '—'],
                ['💰 Credit Limit', supplier.creditLimit ? `Rs. ${supplier.creditLimit.toLocaleString()}` : '—'],
                ['🏷️ Tax ID', supplier.taxId || '—'],
                ['⭐ Rating', ''],
                ['🏦 Bank', supplier.bankName || '—'],
                ['🏦 Account Title', supplier.accountTitle || '—'],
                ['🔢 Account #', supplier.accountNumber || '—'],
                ['📌 IBAN', supplier.iban || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 3 }}>{label}</div>
                  {label === '⭐ Rating' ? <StarRating value={supplier.rating} /> : <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{val}</div>}
                </div>
              ))}
              {supplier.address && (
                <div style={{ gridColumn: '1/-1', background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 3 }}>📍 Address</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{supplier.address}</div>
                </div>
              )}
              {supplier.notes && (
                <div style={{ gridColumn: '1/-1', background: '#FFFBEB', borderRadius: 8, padding: '10px 12px', border: '1px solid #FEF3C7' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 3 }}>📝 Notes</div>
                  <div style={{ fontSize: '0.85rem' }}>{supplier.notes}</div>
                </div>
              )}
              {supplier.tags?.length > 0 && (
                <div style={{ gridColumn: '1/-1' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 6 }}>🏷️ Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {supplier.tags.map(t => <span key={t} style={{ background: '#EFF6FF', color: '#2563EB', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 500 }}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {inner === 'orders' && (
            supplier.orderHistory?.length === 0
              ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 30 }}>No purchase orders yet.</p>
              : <div className="admin-data-table"><table>
                  <thead><tr><th>Ref</th><th>Items</th><th>Total</th><th>Ordered</th><th>Expected</th><th>Status</th></tr></thead>
                  <tbody>
                    {supplier.orderHistory.map(o => {
                      const sc = ORDER_STATUS_COLORS[o.status] || ORDER_STATUS_COLORS.pending;
                      return (
                        <tr key={o._id}>
                          <td><strong style={{ fontSize: '0.82rem' }}>{o.orderRef}</strong></td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{o.items?.length || 0} item(s)</td>
                          <td style={{ fontWeight: 600, color: '#059669' }}>Rs. {(o.totalAmount||0).toLocaleString()}</td>
                          <td style={{ fontSize: '0.8rem' }}>{o.orderedAt ? new Date(o.orderedAt).toLocaleDateString() : '—'}</td>
                          <td style={{ fontSize: '0.8rem' }}>{o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString() : '—'}</td>
                          <td><span style={{ ...sc, padding: '3px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600, textTransform: 'capitalize' }}>{o.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table></div>
          )}

          {/* Payments */}
          {inner === 'payments' && (
            supplier.paymentHistory?.length === 0
              ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 30 }}>No payments recorded yet.</p>
              : <div className="admin-data-table"><table>
                  <thead><tr><th>Amount</th><th>Method</th><th>Reference</th><th>Date</th><th>Status</th><th>Note</th></tr></thead>
                  <tbody>
                    {supplier.paymentHistory.map(p => (
                      <tr key={p._id}>
                        <td><strong style={{ color: '#059669' }}>Rs. {(p.amount||0).toLocaleString()}</strong></td>
                        <td style={{ fontSize: '0.82rem' }}>{p.method}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{p.reference || '—'}</td>
                        <td style={{ fontSize: '0.8rem' }}>{p.date ? new Date(p.date).toLocaleDateString() : '—'}</td>
                        <td><span style={{ background: p.status==='paid'?'#D1FAE5':p.status==='pending'?'#FEF3C7':'#FEE2E2', color: p.status==='paid'?'#059669':p.status==='pending'?'#D97706':'#DC2626', padding: '2px 8px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600 }}>{p.status}</span></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{p.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
          )}

          {/* Deals */}
          {inner === 'deals' && (
            supplier.dealHistory?.length === 0
              ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 30 }}>No deals yet.</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {supplier.dealHistory.map(d => (
                    <div key={d._id} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <strong style={{ fontSize: '0.9rem' }}>{d.title}</strong>
                        {d.endDate && d.status === 'active' ? <CountdownChip endDate={d.endDate} /> : <span style={{ background: d.status==='active'?'#D1FAE5':d.status==='expired'?'#FEE2E2':'#F3F4F6', color: d.status==='active'?'#059669':d.status==='expired'?'#DC2626':'#6B7280', padding: '2px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600, textTransform: 'capitalize' }}>{d.status}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--muted)', flexWrap: 'wrap' }}>
                        <span>💰 Rs. {(d.value||0).toLocaleString()}</span>
                        {d.startDate && <span>📅 {new Date(d.startDate).toLocaleDateString()}</span>}
                        {d.endDate   && <span>🏁 {new Date(d.endDate).toLocaleDateString()}</span>}
                      </div>
                      {d.terms && <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#374151' }}>{d.terms}</p>}
                    </div>
                  ))}
                </div>
          )}

          {/* Activity */}
          {inner === 'activity' && (
            supplier.activityLog?.length === 0
              ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 30 }}>No activity yet.</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {supplier.activityLog.map((a, i) => (
                    <div key={a._id || i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
                        {a.type==='payment'?'💳':a.type==='order'?'📦':a.type==='deal'?'🤝':a.type==='warning'?'⚠️':'📝'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.83rem' }}>{a.note}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.73rem', color: 'var(--muted)' }}>
                          {a.date ? new Date(a.date).toLocaleString() : ''}{a.by?.name ? ` · ${a.by.name}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Modal: Add Payment ───────────────────────────────────────────────────────
function AddPaymentModal({ suppliers, onClose, onSaved, preSelected }) {
  const [supplierId, setSupplierId] = useState(preSelected || '');
  const [amount, setAmount]         = useState('');
  const [method, setMethod]         = useState('Bank Transfer');
  const [reference, setReference]   = useState('');
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus]         = useState('paid');
  const [note, setNote]             = useState('');
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    if (!supplierId) return toast.error('Select a supplier');
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await api.post(`/suppliers/${supplierId}/payments`, { amount: Number(amount), date, method, reference, status, note });
      toast.success('Payment recorded!');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 480 }} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        <div className="admin-modal-header"><h3>💳 Log Payment to Supplier</h3><button className="admin-modal-close" onClick={onClose}><FiX /></button></div>
        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="admin-form-group">
            <label>Supplier *</label>
            <select className="input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
              <option value="">-- Select Supplier --</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName}</option>)}
            </select>
          </div>
          <div className="admin-form-grid">
            <div className="admin-form-group"><label>Amount (Rs.) *</label><input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 50000" /></div>
            <div className="admin-form-group"><label>Method</label>
              <select className="input" value={method} onChange={e => setMethod(e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="admin-form-group"><label>Reference #</label><input className="input" value={reference} onChange={e => setReference(e.target.value)} placeholder="Transaction ID" /></div>
            <div className="admin-form-group"><label>Date</label><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          </div>
          <div className="admin-form-group"><label>Status</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option>
            </select>
          </div>
          <div className="admin-form-group"><label>Note</label><input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note..." /></div>
        </div>
        <div className="admin-form-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '✅ Log Payment'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Modal: Add Purchase Order ────────────────────────────────────────────────
function AddOrderModal({ suppliers, onClose, onSaved, preSelected }) {
  const [supplierId, setSupplierId] = useState(preSelected || '');
  const [items, setItems]           = useState([{ productName: '', qty: 1, unitCost: 0 }]);
  const [expectedDelivery, setEd]   = useState('');
  const [note, setNote]             = useState('');
  const [saving, setSaving]         = useState(false);

  const addItem    = () => setItems(p => [...p, { productName: '', qty: 1, unitCost: 0 }]);
  const removeItem = i => setItems(p => p.filter((_, idx) => idx !== i));
  const setItem    = (i, k, v) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const total = items.reduce((s, it) => s + Number(it.qty) * Number(it.unitCost), 0);

  const handleSave = async () => {
    if (!supplierId) return toast.error('Select a supplier');
    if (items.some(it => !it.productName)) return toast.error('All items need a product name');
    setSaving(true);
    try {
      await api.post(`/suppliers/${supplierId}/orders`, { items, expectedDelivery: expectedDelivery || null, note });
      toast.success('Purchase order created!');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 600 }} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        <div className="admin-modal-header"><h3>📦 New Purchase Order</h3><button className="admin-modal-close" onClick={onClose}><FiX /></button></div>

        <div className="admin-form-group" style={{ marginBottom: 14 }}>
          <label>Supplier *</label>
          <select className="input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">-- Select Supplier --</option>
            {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName}</option>)}
          </select>
        </div>

        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Order Items</label>
            <button onClick={addItem} style={{ background: 'var(--pink-50)', color: 'var(--pink-600)', border: '1px solid var(--pink-200)', borderRadius: 6, padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>+ Add Item</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) 80px 110px 32px', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>PRODUCT NAME</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>QTY</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>UNIT COST</span>
            <span></span>
          </div>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) 80px 110px 32px', gap: 6, marginBottom: 6 }}>
              <input className="input" style={{ padding: '7px 10px' }} value={it.productName} onChange={e => setItem(i, 'productName', e.target.value)} placeholder="Product name" />
              <input className="input" style={{ padding: '7px 10px' }} type="number" min={1} value={it.qty} onChange={e => setItem(i, 'qty', e.target.value)} />
              <input className="input" style={{ padding: '7px 10px' }} type="number" min={0} value={it.unitCost} onChange={e => setItem(i, 'unitCost', e.target.value)} placeholder="0" />
              <button onClick={() => removeItem(i)} style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiX size={13} />
              </button>
            </div>
          ))}
          <div style={{ textAlign: 'right', marginTop: 8, fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>
            Total: Rs. {total.toLocaleString()}
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-group"><label>Expected Delivery</label><input className="input" type="date" value={expectedDelivery} onChange={e => setEd(e.target.value)} /></div>
          <div className="admin-form-group"><label>Note</label><input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional..." /></div>
        </div>

        <div className="admin-form-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '✅ Create Order'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Modal: Add Deal ──────────────────────────────────────────────────────────
function AddDealModal({ suppliers, onClose, onSaved, preSelected }) {
  const [supplierId, setSupplierId] = useState(preSelected || '');
  const [title, setTitle]           = useState('');
  const [startDate, setStart]       = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEnd]           = useState('');
  const [value, setValue]           = useState('');
  const [terms, setTerms]           = useState('');
  const [note, setNote]             = useState('');
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    if (!supplierId) return toast.error('Select a supplier');
    if (!title.trim()) return toast.error('Deal title is required');
    setSaving(true);
    try {
      await api.post(`/suppliers/${supplierId}/deals`, { title, startDate, endDate: endDate || null, value: Number(value)||0, terms, note });
      toast.success('Deal added!');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 500 }} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        <div className="admin-modal-header"><h3>🤝 New Deal / Contract</h3><button className="admin-modal-close" onClick={onClose}><FiX /></button></div>
        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="admin-form-group">
            <label>Supplier *</label>
            <select className="input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
              <option value="">-- Select Supplier --</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName}</option>)}
            </select>
          </div>
          <div className="admin-form-group"><label>Deal Title *</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Bulk Purchase Q3 2025" /></div>
          <div className="admin-form-grid">
            <div className="admin-form-group"><label>Start Date</label><input className="input" type="date" value={startDate} onChange={e => setStart(e.target.value)} /></div>
            <div className="admin-form-group"><label>End Date</label><input className="input" type="date" value={endDate} onChange={e => setEnd(e.target.value)} /></div>
          </div>
          <div className="admin-form-group"><label>Deal Value (Rs.)</label><input className="input" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 200000" /></div>
          <div className="admin-form-group"><label>Terms</label><textarea className="input" rows={2} value={terms} onChange={e => setTerms(e.target.value)} placeholder="Contract terms, conditions..." style={{ resize: 'vertical' }} /></div>
          <div className="admin-form-group"><label>Note</label><input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note..." /></div>
        </div>
        <div className="admin-form-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '✅ Add Deal'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Modal: Add Deadline ──────────────────────────────────────────────────────
function AddDeadlineModal({ suppliers, onClose, onSaved, preSelected }) {
  const [supplierId, setSupplierId] = useState(preSelected || '');
  const [title, setTitle]           = useState('');
  const [dueDate, setDueDate]       = useState('');
  const [type, setType]             = useState('general');
  const [note, setNote]             = useState('');
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    if (!supplierId) return toast.error('Select a supplier');
    if (!title.trim()) return toast.error('Deadline title is required');
    if (!dueDate) return toast.error('Due date is required');
    setSaving(true);
    try {
      await api.post(`/suppliers/${supplierId}/deadlines`, { title, dueDate, type, note });
      toast.success('Deadline added!');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 440 }} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        <div className="admin-modal-header"><h3>⏰ Add Deadline</h3><button className="admin-modal-close" onClick={onClose}><FiX /></button></div>
        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="admin-form-group">
            <label>Supplier *</label>
            <select className="input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
              <option value="">-- Select Supplier --</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName}</option>)}
            </select>
          </div>
          <div className="admin-form-group"><label>Title *</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Payment Due, Contract Renewal" /></div>
          <div className="admin-form-grid">
            <div className="admin-form-group"><label>Due Date *</label><input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
            <div className="admin-form-group"><label>Type</label>
              <select className="input" value={type} onChange={e => setType(e.target.value)}>
                <option value="general">General</option><option value="payment">Payment</option>
                <option value="delivery">Delivery</option><option value="contract">Contract</option>
              </select>
            </div>
          </div>
          <div className="admin-form-group"><label>Note</label><input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note..." /></div>
        </div>
        <div className="admin-form-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '✅ Add Deadline'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Modal: Update Order Status ───────────────────────────────────────────────
function UpdateOrderStatusModal({ order, supplier, onClose, onSaved }) {
  const [status, setStatus] = useState(order.status);
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/suppliers/${supplier._id}/orders/${order._id}`, { status, note });
      toast.success('Order status updated!');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 400 }} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        <div className="admin-modal-header"><h3>🔄 Update Order Status</h3><button className="admin-modal-close" onClick={onClose}><FiX /></button></div>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16 }}>Order: <strong>{order.orderRef}</strong> · {supplier.companyName}</p>
        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="admin-form-group"><label>New Status</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
              {['pending','confirmed','shipped','received','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
          </div>
          <div className="admin-form-group"><label>Note</label><input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note..." /></div>
        </div>
        <div className="admin-form-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '✅ Update Status'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSuppliers() {
  const [sidebar, setSidebar]           = useState(false);
  const [tab, setTab]                   = useState('suppliers');
  const [suppliers, setSuppliers]       = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter]       = useState('');
  const [orderStatusFilter, setOSF]     = useState('');
  const [dealStatusFilter, setDSF]      = useState('');

  // Modal states
  const [showAdd, setShowAdd]           = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [showPayment, setShowPayment]   = useState(false);
  const [showOrder, setShowOrder]       = useState(false);
  const [showDeal, setShowDeal]         = useState(false);
  const [showDeadline, setShowDeadline] = useState(false);
  const [updateOrder, setUpdateOrder]   = useState(null); // { order, supplier }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, stRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/suppliers/stats'),
      ]);
      setSuppliers(sRes.data.suppliers || []);
      setStats(stRes.data.stats || null);
    } catch { toast.error('Failed to load supplier data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (s) => {
    if (!window.confirm(`Permanently delete "${s.companyName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/suppliers/${s._id}`);
      toast.success('Supplier deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  // Derived: filtered suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.companyName.toLowerCase().includes(q) || (s.contactPerson||'').toLowerCase().includes(q) || (s.email||'').toLowerCase().includes(q);
    const matchStatus = !statusFilter || s.status === statusFilter;
    const matchCat    = !catFilter    || s.category === catFilter;
    return matchSearch && matchStatus && matchCat;
  });

  // Derived: all purchase orders across suppliers
  const allOrders = suppliers.flatMap(s =>
    (s.orderHistory || []).map(o => ({ ...o, supplierName: s.companyName, supplierId: s._id, supplierObj: s }))
  ).sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

  const filteredOrders = allOrders.filter(o => !orderStatusFilter || o.status === orderStatusFilter);

  // Derived: all payments
  const allPayments = suppliers.flatMap(s =>
    (s.paymentHistory || []).map(p => ({ ...p, supplierName: s.companyName }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPaidThisMonth = (() => {
    const ms = new Date(); ms.setDate(1); ms.setHours(0,0,0,0);
    return allPayments.filter(p => p.status==='paid' && new Date(p.date) >= ms).reduce((s,p) => s+p.amount, 0);
  })();

  // Derived: all deals
  const allDeals = suppliers.flatMap(s =>
    (s.dealHistory || []).map(d => ({ ...d, supplierName: s.companyName, supplierId: s._id, supplierObj: s }))
  ).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const filteredDeals = allDeals.filter(d => !dealStatusFilter || d.status === dealStatusFilter);

  // ─── TAB DEFINITIONS ───────────────────────────────────────────────────────
  const TABS = [
    { key: 'suppliers',  label: '🏢 Suppliers',        count: suppliers.length },
    { key: 'orders',     label: '📋 Purchase Orders',  count: allOrders.length },
    { key: 'payments',   label: '💳 Payments',          count: allPayments.length },
    { key: 'deals',      label: '🤝 Deals & Contracts', count: allDeals.length },
    { key: 'stats',      label: '📊 Stats',             count: null },
  ];

  return (
    <div className="admin-layout">
      <Helmet><title>Supplier Management — Admin Dashboard</title></Helmet>
      <AdminSidebar open={sidebar} onClose={() => setSidebar(false)} />

      <div className="admin-content">
        {/* Topbar */}
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebar(true)} id="admin-supplier-menu"><FiMenu /></button>
          <FiTruck style={{ color: 'var(--pink-500)', fontSize: '1.3rem', flexShrink: 0 }} />
          <div>
            <h1 className="admin-page-title">Supplier Management</h1>
            <p className="admin-page-subtitle">{suppliers.length} suppliers · Rs. {(stats?.totalSpend||0).toLocaleString()} total spend</p>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={load} id="refresh-suppliers-btn"><FiRefreshCw style={{ marginRight: 4 }} /> Refresh</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} id="add-supplier-btn"><FiPlus style={{ marginRight: 4 }} /> Add Supplier</button>
          </div>
        </div>

        <div className="admin-body">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F3F4F6', borderRadius: 12, padding: 4, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem', whiteSpace: 'nowrap',
                  background: tab === t.key ? 'white' : 'transparent',
                  color: tab === t.key ? 'var(--pink-600)' : 'var(--muted)',
                  boxShadow: tab === t.key ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s' }}>
                {t.label}{t.count !== null ? ` (${t.count})` : ''}
              </button>
            ))}
          </div>

          {/* ═══ TAB: SUPPLIERS ═══════════════════════════════════════════════ */}
          {tab === 'suppliers' && (
            <>
              {/* Summary strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total',       value: suppliers.length,                                         icon: '🏢', col: 'var(--dark)' },
                  { label: 'Active',      value: suppliers.filter(s=>s.status==='active').length,           icon: '✅', col: '#059669' },
                  { label: 'Inactive',    value: suppliers.filter(s=>s.status==='inactive').length,         icon: '⏸️', col: '#6B7280' },
                  { label: 'Blacklisted', value: suppliers.filter(s=>s.status==='blacklisted').length,      icon: '🚫', col: '#DC2626' },
                ].map(c => (
                  <div key={c.label} style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.2rem', color: c.col }}>{c.value}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500 }}>{c.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input className="input" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} id="supplier-search" />
                </div>
                <select className="input" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="blacklisted">Blacklisted</option>
                </select>
                <select className="input" style={{ width: 180 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Cards Grid */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                  {[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height: 220 }} />)}
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚚</div>
                  <h3>No Suppliers Found</h3>
                  <p style={{ color: 'var(--muted)', marginTop: 8 }}>Add your first supplier to get started.</p>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>➕ Add First Supplier</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                  {filteredSuppliers.map(s => {
                    const sc = STATUS_COLORS[s.status] || STATUS_COLORS.active;
                    const totalPaid = s.paymentHistory?.reduce((acc,p) => p.status==='paid'?acc+p.amount:acc, 0) || 0;
                    return (
                      <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 20, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.status==='blacklisted'?'#DC2626':s.status==='inactive'?'#9CA3AF':'linear-gradient(90deg,#FF2D7A,#FF6FA1)' }} />

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#FF2D7A,#FF6FA1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                            {s.companyName?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: '0.92rem', display: 'block', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.companyName}</strong>
                            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>{s.contactPerson || '—'}</p>
                          </div>
                          <span style={{ ...sc, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize', flexShrink: 0 }}>{s.status}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {s.email && <span>📧 {s.email}</span>}
                          {s.phone && <span>📱 {s.phone}</span>}
                          <span>📂 {s.category} · 💳 {s.paymentTerms}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', marginBottom: 14, border: '1px solid #F3F4F6' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#059669' }}>Rs. {totalPaid > 999 ? `${(totalPaid/1000).toFixed(1)}k` : totalPaid}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Total Paid</div>
                          </div>
                          <div style={{ textAlign: 'center', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.orderHistory?.length || 0}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Orders</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <StarRating value={s.rating} />
                            <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Rating</div>
                          </div>
                        </div>

                        {s.tags?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                            {s.tags.slice(0,3).map(t => <span key={t} style={{ background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 500 }}>{t}</span>)}
                            {s.tags.length > 3 && <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>+{s.tags.length-3}</span>}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
                          <button onClick={() => setViewSupplier(s)} style={{ flex: 2, background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600 }} id={`view-supplier-${s._id}`}>
                            <FiFileText size={13} /> View
                          </button>
                          <button onClick={() => setEditSupplier(s)} style={{ flex: 2, background: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600 }} id={`edit-supplier-${s._id}`}>
                            <FiEdit2 size={13} /> Edit
                          </button>
                          <button onClick={() => handleDelete(s)} style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} id={`del-supplier-${s._id}`}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ═══ TAB: PURCHASE ORDERS ════════════════════════════════════════ */}
          {tab === 'orders' && (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="input" style={{ width: 180 }} value={orderStatusFilter} onChange={e => setOSF(e.target.value)}>
                  <option value="">All Statuses</option>
                  {['pending','confirmed','shipped','received','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowOrder(true)} id="add-order-btn"><FiPlus style={{ marginRight: 4 }} /> New Purchase Order</button>
                </div>
              </div>

              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Orders', value: allOrders.length, icon: '📦' },
                  { label: 'Pending',      value: allOrders.filter(o=>o.status==='pending').length,   icon: '⏳' },
                  { label: 'Received',     value: allOrders.filter(o=>o.status==='received').length,  icon: '✅' },
                  { label: 'Cancelled',    value: allOrders.filter(o=>o.status==='cancelled').length, icon: '❌' },
                ].map(c => (
                  <div key={c.label} style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                    <div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{c.value}</div><div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{c.label}</div></div>
                  </div>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
                  <h3>No Purchase Orders Yet</h3>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowOrder(true)}>➕ Create First Order</button>
                </div>
              ) : (
                <div className="admin-data-table">
                  <table>
                    <thead>
                      <tr><th>Order Ref</th><th>Supplier</th><th>Items</th><th>Total</th><th>Ordered</th><th>Expected</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(o => {
                        const sc = ORDER_STATUS_COLORS[o.status] || ORDER_STATUS_COLORS.pending;
                        return (
                          <tr key={o._id}>
                            <td><strong style={{ fontSize: '0.83rem', color: 'var(--pink-600)' }}>{o.orderRef}</strong></td>
                            <td style={{ fontSize: '0.85rem' }}>{o.supplierName}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{o.items?.length || 0} item(s){o.items?.[0]?.productName ? `: ${o.items[0].productName}${o.items.length>1?'...':''}` : ''}</td>
                            <td><strong style={{ color: '#059669', fontSize: '0.85rem' }}>Rs. {(o.totalAmount||0).toLocaleString()}</strong></td>
                            <td style={{ fontSize: '0.8rem' }}>{o.orderedAt ? new Date(o.orderedAt).toLocaleDateString() : '—'}</td>
                            <td style={{ fontSize: '0.8rem' }}>{o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString() : '—'}</td>
                            <td><span style={{ ...sc, padding: '3px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600, textTransform: 'capitalize' }}>{o.status}</span></td>
                            <td>
                              <button onClick={() => setUpdateOrder({ order: o, supplier: o.supplierObj })} style={{ background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                                Update Status
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ═══ TAB: PAYMENTS ═══════════════════════════════════════════════ */}
          {tab === 'payments' && (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ marginLeft: 'auto' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowPayment(true)} id="add-payment-btn"><FiPlus style={{ marginRight: 4 }} /> Log Payment</button>
                </div>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'This Month',   value: `Rs. ${totalPaidThisMonth.toLocaleString()}`,                                                    icon: '📅', col: 'var(--pink-600)' },
                  { label: 'All Time Spend', value: `Rs. ${(stats?.totalSpend||0).toLocaleString()}`,                                              icon: '💰', col: '#059669' },
                  { label: 'Pending Payments', value: allPayments.filter(p=>p.status==='pending').length,                                          icon: '⏳', col: '#D97706' },
                ].map(c => (
                  <div key={c.label} style={{ background: 'white', borderRadius: 10, padding: '16px 18px', border: '1px solid #E5E7EB', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: '1.6rem' }}>{c.icon}</span>
                    <div><div style={{ fontWeight: 700, fontSize: '1.1rem', color: c.col }}>{c.value}</div><div style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>{c.label}</div></div>
                  </div>
                ))}
              </div>

              {allPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>💳</div>
                  <h3>No Payments Recorded</h3>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowPayment(true)}>➕ Log First Payment</button>
                </div>
              ) : (
                <div className="admin-data-table">
                  <table>
                    <thead>
                      <tr><th>Supplier</th><th>Amount</th><th>Method</th><th>Reference #</th><th>Date</th><th>Status</th><th>Note</th></tr>
                    </thead>
                    <tbody>
                      {allPayments.map((p, i) => (
                        <tr key={p._id || i}>
                          <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.supplierName}</td>
                          <td><strong style={{ color: '#059669' }}>Rs. {(p.amount||0).toLocaleString()}</strong></td>
                          <td style={{ fontSize: '0.82rem' }}>{p.method}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{p.reference || '—'}</td>
                          <td style={{ fontSize: '0.8rem' }}>{p.date ? new Date(p.date).toLocaleDateString() : '—'}</td>
                          <td><span style={{ background: p.status==='paid'?'#D1FAE5':p.status==='pending'?'#FEF3C7':'#FEE2E2', color: p.status==='paid'?'#059669':p.status==='pending'?'#D97706':'#DC2626', padding: '3px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600, textTransform: 'capitalize' }}>{p.status}</span></td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{p.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ═══ TAB: DEALS & CONTRACTS ══════════════════════════════════════ */}
          {tab === 'deals' && (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 4 }}>
                  {['','active','expired','cancelled'].map(s => (
                    <button key={s} onClick={() => setDSF(s)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: dealStatusFilter===s?'white':'transparent', color: dealStatusFilter===s?'var(--pink-600)':'var(--muted)', boxShadow: dealStatusFilter===s?'0 1px 4px rgba(0,0,0,0.08)':'none', transition: 'all 0.2s' }}>
                      {s ? s.charAt(0).toUpperCase()+s.slice(1) : 'All'}
                    </button>
                  ))}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowDeadline(true)}><FiClock style={{ marginRight: 4 }} /> Add Deadline</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowDeal(true)} id="add-deal-btn"><FiPlus style={{ marginRight: 4 }} /> New Deal</button>
                </div>
              </div>

              {filteredDeals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>🤝</div>
                  <h3>No Deals Yet</h3>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowDeal(true)}>➕ Add First Deal</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                  {filteredDeals.map((d, i) => (
                    <motion.div key={d._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 14, padding: 20, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: d.status==='active'?'linear-gradient(90deg,#059669,#34D399)':d.status==='expired'?'#DC2626':'#9CA3AF' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <strong style={{ fontSize: '0.92rem', flex: 1 }}>{d.title}</strong>
                        {d.endDate && d.status === 'active' ? <CountdownChip endDate={d.endDate} /> : (
                          <span style={{ background: d.status==='active'?'#D1FAE5':d.status==='expired'?'#FEE2E2':'#F3F4F6', color: d.status==='active'?'#059669':d.status==='expired'?'#DC2626':'#6B7280', padding: '3px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600, textTransform: 'capitalize' }}>{d.status}</span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--pink-600)', fontWeight: 600, margin: '0 0 10px' }}>🏢 {d.supplierName}</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', marginBottom: 12, border: '1px solid #F3F4F6' }}>
                        <div><div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: 2 }}>Deal Value</div><div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#059669' }}>Rs. {(d.value||0).toLocaleString()}</div></div>
                        {d.startDate && <div><div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: 2 }}>Start</div><div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{new Date(d.startDate).toLocaleDateString()}</div></div>}
                        {d.endDate && <div style={{ gridColumn: d.startDate?'auto':'1/-1' }}><div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: 2 }}>End Date</div><div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{new Date(d.endDate).toLocaleDateString()}</div></div>}
                      </div>

                      {d.terms && <p style={{ fontSize: '0.78rem', color: '#374151', marginBottom: 10, background: '#FFFBEB', padding: '8px 10px', borderRadius: 6 }}>{d.terms}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ═══ TAB: STATS ══════════════════════════════════════════════════ */}
          {tab === 'stats' && (
            <>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  {[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
                </div>
              ) : !stats ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>No stats available.</p>
              ) : (
                <>
                  {/* KPI Cards */}
                  <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', marginBottom: 28 }}>
                    {[
                      { label: 'Total Suppliers',  value: stats.totalSuppliers,                icon: '🏢', color: '' },
                      { label: 'Active',            value: stats.activeSuppliers,              icon: '✅', color: 'green' },
                      { label: 'Blacklisted',       value: stats.blacklisted,                  icon: '🚫', color: '' },
                      { label: 'Total Spend',       value: `Rs. ${(stats.totalSpend||0).toLocaleString()}`, icon: '💰', color: 'pink' },
                      { label: 'Spend This Month',  value: `Rs. ${(stats.spendThisMonth||0).toLocaleString()}`, icon: '📅', color: 'blue' },
                      { label: 'Active Deals',      value: stats.activeDeals,                  icon: '🤝', color: 'green' },
                      { label: 'Orders This Month', value: stats.ordersThisMonth,              icon: '📦', color: '' },
                      { label: 'Avg Rating',        value: `${stats.avgRating} ★`,             icon: '⭐', color: '' },
                    ].map(c => (
                      <motion.div key={c.label} className={`kpi-card kpi-${c.color}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="kpi-icon">{c.icon}</div>
                        <div className="kpi-info">
                          <p className="kpi-label">{c.label}</p>
                          <div className="kpi-value">{c.value}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    {/* Top Suppliers by Spend */}
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700 }}>🏆 Top Suppliers by Spend</h3>
                      {stats.topSuppliers?.length === 0
                        ? <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No data yet.</p>
                        : stats.topSuppliers.map((s, i) => {
                          const maxSpend = stats.topSuppliers[0]?.totalSpend || 1;
                          const pct = Math.round((s.totalSpend / maxSpend) * 100);
                          return (
                            <div key={s._id} style={{ marginBottom: 14 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                <span style={{ fontSize: '0.83rem', fontWeight: 600 }}>{i+1}. {s.companyName}</span>
                                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>Rs. {s.totalSpend.toLocaleString()}</span>
                              </div>
                              <div style={{ background: '#F3F4F6', borderRadius: 100, height: 6, overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#FF2D7A,#FF6FA1)', borderRadius: 100, transition: 'width 0.8s ease' }} />
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>

                    {/* Upcoming Deadlines */}
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700 }}>⏰ Upcoming Deadlines (30 days)</h3>
                      {stats.upcomingDeadlines?.length === 0
                        ? <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No upcoming deadlines.</p>
                        : stats.upcomingDeadlines.map((d, i) => {
                          const days = daysUntil(d.dueDate);
                          return (
                            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < stats.upcomingDeadlines.length-1 ? '1px solid #F3F4F6' : 'none' }}>
                              <FiAlertCircle style={{ color: days <= 7 ? '#DC2626' : '#D97706', marginTop: 2, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>{d.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{d.supplierName} · Due: {new Date(d.dueDate).toLocaleDateString()}</div>
                              </div>
                              <CountdownChip endDate={d.dueDate} />
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700 }}>📋 Recent Activity</h3>
                    {stats.recentActivity?.length === 0
                      ? <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No recent activity.</p>
                      : stats.recentActivity.map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < stats.recentActivity.length-1 ? '1px solid #F3F4F6' : 'none' }}>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
                            {a.type==='payment'?'💳':a.type==='order'?'📦':a.type==='deal'?'🤝':a.type==='warning'?'⚠️':'📝'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.83rem' }}>{a.note}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.73rem', color: 'var(--muted)' }}>
                              {a.supplierName} · {a.date ? new Date(a.date).toLocaleString() : ''}
                            </p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAdd        && <SupplierFormModal                                       onClose={() => setShowAdd(false)}        onSaved={() => { setShowAdd(false); load(); }} />}
        {editSupplier   && <SupplierFormModal supplier={editSupplier}               onClose={() => setEditSupplier(null)}    onSaved={() => { setEditSupplier(null); load(); }} />}
        {viewSupplier   && <SupplierDetailModal supplier={viewSupplier}             onClose={() => setViewSupplier(null)}   onRefresh={load} />}
        {showPayment    && <AddPaymentModal suppliers={suppliers}                   onClose={() => setShowPayment(false)}   onSaved={() => { setShowPayment(false); load(); }} />}
        {showOrder      && <AddOrderModal   suppliers={suppliers}                   onClose={() => setShowOrder(false)}     onSaved={() => { setShowOrder(false); load(); }} />}
        {showDeal       && <AddDealModal    suppliers={suppliers}                   onClose={() => setShowDeal(false)}      onSaved={() => { setShowDeal(false); load(); }} />}
        {showDeadline   && <AddDeadlineModal suppliers={suppliers}                  onClose={() => setShowDeadline(false)}  onSaved={() => { setShowDeadline(false); load(); }} />}
        {updateOrder    && <UpdateOrderStatusModal order={updateOrder.order} supplier={updateOrder.supplier} onClose={() => setUpdateOrder(null)} onSaved={() => { setUpdateOrder(null); load(); }} />}
      </AnimatePresence>
    </div>
  );
}
