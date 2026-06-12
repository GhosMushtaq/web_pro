import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './Overview';
import { FiMenu, FiPlus, FiEdit2, FiTrash2, FiX, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './AdminDashboard.css';

const EMPTY = { name: '', description: '', emoji: '🎁', isActive: true, isFeatured: false, sortOrder: 0 };

export default function AdminCollections() {
  const [sidebar, setSidebar] = useState(false);
  const [cols, setCols]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/collections?limit=100').then(r => { setCols(r.data.collections || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const openEdit = c => { setEditing(c); setForm({ name: c.name, description: c.description || '', emoji: c.emoji || '🎁', isActive: c.isActive, isFeatured: c.isFeatured, sortOrder: c.sortOrder }); setModal(true); };
  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api.put(`/collections/${editing._id}`, form);
      else await api.post('/collections', form);
      toast.success(editing ? 'Collection updated!' : 'Collection created!');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Delete this collection?')) return;
    try { await api.delete(`/collections/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="admin-layout">
      <Helmet><title>Collections — Admin Dashboard</title></Helmet>
      <AdminSidebar open={sidebar} onClose={() => setSidebar(false)} />
      <div className="admin-content">
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebar(true)} id="admin-col-menu"><FiMenu /></button>
          <div><h1 className="admin-page-title">🗂️ Collections</h1><p className="admin-page-subtitle">{cols.length} collections</p></div>
          <div className="admin-topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={load}><FiRefreshCw /></button>
            <button className="btn btn-primary btn-sm" onClick={openCreate} id="add-collection-btn"><FiPlus /> Add Collection</button>
          </div>
        </div>
        <div className="admin-body">
          <div className="admin-data-table">
            <table>
              <thead><tr><th>Collection</th><th>Products</th><th>Featured</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
                  : cols.map(c => (
                    <tr key={c._id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.4rem' }}>{c.emoji}</span>
                        <div><strong style={{ fontSize: '0.9rem' }}>{c.name}</strong><p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.description?.substring(0, 50)}</p></div>
                      </div></td>
                      <td>{c.productCount || 0}</td>
                      <td>{c.isFeatured ? <span style={{ color: '#D97706', fontWeight: 700 }}>⭐ Yes</span> : '—'}</td>
                      <td><span style={{ background: c.isActive ? '#D1FAE5' : '#FEE2E2', color: c.isActive ? '#059669' : '#DC2626', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{c.isActive ? 'Active' : 'Hidden'}</span></td>
                      <td>{c.sortOrder}</td>
                      <td><div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '5px 10px' }} onClick={() => openEdit(c)} id={`edit-col-${c._id}`}><FiEdit2 /></button>
                        <button style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#DC2626' }} onClick={() => del(c._id)}><FiTrash2 /></button>
                      </div></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="admin-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="admin-modal-header">
                <h3>{editing ? 'Edit Collection' : 'Add Collection'}</h3>
                <button className="admin-modal-close" onClick={() => setModal(false)}><FiX /></button>
              </div>
              <form onSubmit={save}>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Name *</label>
                    <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required id="col-name" />
                  </div>
                  <div className="admin-form-group">
                    <label>Emoji</label>
                    <input className="input" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} id="col-emoji" />
                  </div>
                  <div className="admin-form-group full-width">
                    <label>Description</label>
                    <textarea className="input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} id="col-desc" style={{ resize: 'vertical' }} />
                  </div>
                  <div className="admin-form-group">
                    <label>Sort Order</label>
                    <input className="input" type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} id="col-sort" />
                  </div>
                  <div className="admin-form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20, paddingTop: 28 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} id="col-active" /> Active
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} id="col-featured" /> Featured
                    </label>
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} id="col-save-btn">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
