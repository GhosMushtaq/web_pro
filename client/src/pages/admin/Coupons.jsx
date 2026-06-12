import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './Overview';
import {
  FiMenu, FiPlus, FiEdit2, FiTrash2, FiX,
  FiTag, FiRefreshCw, FiCopy, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './AdminDashboard.css';

const EMPTY = {
  code: '', type: 'percentage', value: '', minOrder: '',
  maxDiscount: '', usageLimit: '', userLimit: 1,
  isActive: true, expiresAt: ''
};

function CouponModal({ coupon, onClose, onSaved }) {
  const [form, setForm] = useState(coupon
    ? { ...coupon, expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : '' }
    : { ...EMPTY }
  );
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (coupon) await api.put(`/coupons/${coupon._id}`, form);
      else await api.post('/coupons', form);
      toast.success(coupon ? 'Coupon updated!' : 'Coupon created!');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    set('code', code);
  };

  return (
    <motion.div className="admin-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 560 }}
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
        <div className="admin-modal-header">
          <h3>{coupon ? '✏️ Edit Coupon' : '➕ Create New Coupon'}</h3>
          <button className="admin-modal-close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            {/* Code */}
            <div className="admin-form-group full-width">
              <label>Coupon Code *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20" required id="coupon-code"
                  style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', flex: 1 }} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={generateCode} style={{ whiteSpace: 'nowrap' }}>
                  🎲 Generate
                </button>
              </div>
            </div>

            {/* Type + Value */}
            <div className="admin-form-group">
              <label>Discount Type *</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)} id="coupon-type">
                <option value="percentage">% Percentage Off</option>
                <option value="fixed">Rs. Fixed Amount Off</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Discount Value * {form.type === 'percentage' ? '(%)' : '(Rs.)'}</label>
              <input className="input" type="number" min="1" value={form.value}
                onChange={e => set('value', e.target.value)} required id="coupon-value"
                placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 500'} />
            </div>

            {/* Min Order + Max Discount */}
            <div className="admin-form-group">
              <label>Minimum Order (Rs.)</label>
              <input className="input" type="number" min="0" value={form.minOrder}
                onChange={e => set('minOrder', e.target.value)} id="coupon-min-order" placeholder="0 = no minimum" />
            </div>
            <div className="admin-form-group">
              <label>Max Discount (Rs.)</label>
              <input className="input" type="number" min="0" value={form.maxDiscount}
                onChange={e => set('maxDiscount', e.target.value)} id="coupon-max-discount" placeholder="leave blank = unlimited" />
            </div>

            {/* Usage Limits */}
            <div className="admin-form-group">
              <label>Total Usage Limit</label>
              <input className="input" type="number" min="1" value={form.usageLimit}
                onChange={e => set('usageLimit', e.target.value)} id="coupon-usage-limit" placeholder="leave blank = unlimited" />
            </div>
            <div className="admin-form-group">
              <label>Per User Limit</label>
              <input className="input" type="number" min="1" value={form.userLimit}
                onChange={e => set('userLimit', e.target.value)} id="coupon-user-limit" />
            </div>

            {/* Expiry */}
            <div className="admin-form-group">
              <label>Expiry Date</label>
              <input className="input" type="date" value={form.expiresAt}
                onChange={e => set('expiresAt', e.target.value)} id="coupon-expiry"
                min={new Date().toISOString().slice(0, 10)} />
            </div>

            {/* Active toggle */}
            <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: 28 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div onClick={() => set('isActive', !form.isActive)}
                  style={{ fontSize: '1.6rem', color: form.isActive ? 'var(--pink-500)' : '#9CA3AF' }}>
                  {form.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                </div>
                <span style={{ fontWeight: 500, color: form.isActive ? 'var(--pink-600)' : 'var(--muted)' }}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {form.code && (
            <div style={{ background: 'var(--pink-50)', border: '1px dashed var(--pink-300)', borderRadius: 10, padding: '12px 16px', marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 2 }}>Preview</p>
                <strong style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--pink-700)', letterSpacing: 2 }}>{form.code}</strong>
                <span style={{ marginLeft: 12, fontSize: '0.85rem', color: 'var(--text)' }}>
                  {form.type === 'percentage' ? `${form.value}% off` : `Rs. ${form.value} off`}
                  {form.minOrder > 0 && ` on orders over Rs. ${form.minOrder}`}
                </span>
              </div>
              {form.expiresAt && <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Expires {form.expiresAt}</span>}
            </div>
          )}

          <div className="admin-form-actions" style={{ marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="coupon-save-btn">
              {saving ? 'Saving...' : coupon ? '💾 Update Coupon' : '✅ Create Coupon'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminCoupons() {
  const [sidebar, setSidebar]     = useState(false);
  const [coupons, setCoupons]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/coupons').then(r => { setCoupons(r.data.coupons || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setModal(true); };
  const openEdit   = c => { setEditing(c); setModal(true); };

  const handleDelete = async id => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await api.delete(`/coupons/${id}`); toast.success('Coupon deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const handleToggle = async c => {
    try {
      await api.put(`/coupons/${c._id}`, { isActive: !c.isActive });
      toast.success(c.isActive ? 'Coupon deactivated' : 'Coupon activated');
      load();
    } catch { toast.error('Update failed'); }
  };

  const copyCode = code => { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`); };

  const isExpired = c => c.expiresAt && new Date(c.expiresAt) < new Date();

  return (
    <div className="admin-layout">
      <Helmet><title>Coupons — Admin Dashboard</title></Helmet>
      <AdminSidebar open={sidebar} onClose={() => setSidebar(false)} />

      <div className="admin-content">
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebar(true)} id="admin-coupons-menu"><FiMenu /></button>
          <div>
            <h1 className="admin-page-title"><FiTag style={{ marginRight: 8 }} />Coupons & Discounts</h1>
            <p className="admin-page-subtitle">{coupons.length} coupons · {coupons.filter(c => c.isActive && !isExpired(c)).length} active</p>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={load}><FiRefreshCw /></button>
            <button className="btn btn-primary btn-sm" onClick={openCreate} id="add-coupon-btn">
              <FiPlus style={{ marginRight: 4 }} />Create Coupon
            </button>
          </div>
        </div>

        <div className="admin-body">
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total', value: coupons.length, color: 'var(--dark)', bg: 'white' },
              { label: 'Active', value: coupons.filter(c => c.isActive && !isExpired(c)).length, color: '#059669', bg: '#D1FAE5' },
              { label: 'Expired', value: coupons.filter(isExpired).length, color: '#DC2626', bg: '#FEE2E2' },
              { label: 'Total Uses', value: coupons.reduce((a, c) => a + (c.usedCount || 0), 0), color: '#2563EB', bg: '#DBEAFE' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: '1px solid #E5E7EB', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{s.label}</p>
                <strong style={{ fontSize: '1.4rem', color: s.color }}>{s.value}</strong>
              </div>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎫</div>
              <h3>No Coupons Yet</h3>
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>Create your first discount coupon to attract customers.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>➕ Create First Coupon</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {coupons.map((c, i) => {
                const expired = isExpired(c);
                const usagePct = c.usageLimit ? Math.round((c.usedCount / c.usageLimit) * 100) : null;
                return (
                  <motion.div key={c._id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ background: 'white', border: `1px solid ${expired ? '#FCA5A5' : c.isActive ? '#E5E7EB' : '#E5E7EB'}`, borderLeft: `4px solid ${expired ? '#EF4444' : c.isActive ? 'var(--pink-500)' : '#D1D5DB'}`, borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>

                    {/* Code badge */}
                    <div style={{ background: expired ? '#FEE2E2' : 'var(--pink-50)', borderRadius: 8, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 150 }}>
                      <FiTag style={{ color: expired ? '#EF4444' : 'var(--pink-500)', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', letterSpacing: 2, color: expired ? '#EF4444' : 'var(--pink-700)' }}>{c.code}</span>
                      <button onClick={() => copyCode(c.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex' }} title="Copy code"><FiCopy size={13} /></button>
                    </div>

                    {/* Discount */}
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--dark)' }}>
                        {c.type === 'percentage' ? `${c.value}% Off` : `Rs. ${c.value} Off`}
                      </strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
                        {c.minOrder > 0 && `Min. Rs. ${c.minOrder} • `}
                        {c.maxDiscount && `Max Rs. ${c.maxDiscount} •`}
                        {c.userLimit > 1 ? ` ${c.userLimit}x per user` : ' 1x per user'}
                      </div>
                    </div>

                    {/* Usage */}
                    <div style={{ minWidth: 120, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.usedCount || 0} used</div>
                      {c.usageLimit && (
                        <>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>of {c.usageLimit} limit</div>
                          <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(usagePct, 100)}%`, background: usagePct >= 90 ? '#EF4444' : 'var(--pink-400)', borderRadius: 2, transition: 'width 0.5s' }} />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Expiry */}
                    <div style={{ minWidth: 100, textAlign: 'center' }}>
                      {c.expiresAt ? (
                        <>
                          <div style={{ fontSize: '0.75rem', color: expired ? '#DC2626' : 'var(--muted)' }}>{expired ? '⛔ Expired' : '⏳ Expires'}</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: expired ? '#DC2626' : 'var(--dark)' }}>{new Date(c.expiresAt).toLocaleDateString()}</div>
                        </>
                      ) : <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>No expiry</span>}
                    </div>

                    {/* Status badge */}
                    <span style={{ background: expired ? '#FEE2E2' : c.isActive ? '#D1FAE5' : '#F3F4F6', color: expired ? '#DC2626' : c.isActive ? '#059669' : '#6B7280', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}>
                      {expired ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
                    </span>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleToggle(c)} title={c.isActive ? 'Deactivate' : 'Activate'}
                        style={{ background: c.isActive ? '#FEF3C7' : '#D1FAE5', color: c.isActive ? '#D97706' : '#059669', border: 'none', borderRadius: 6, padding: '7px 10px', cursor: 'pointer', fontSize: '1rem' }}>
                        {c.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                      <button onClick={() => openEdit(c)} id={`edit-coupon-${c._id}`}
                        style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: 6, padding: '7px 10px', cursor: 'pointer' }}>
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(c._id)}
                        style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 6, padding: '7px 10px', cursor: 'pointer' }}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <CouponModal
            coupon={editing}
            onClose={() => { setModal(false); setEditing(null); }}
            onSaved={() => { setModal(false); setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
