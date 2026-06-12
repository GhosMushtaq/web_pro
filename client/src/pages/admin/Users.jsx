import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminSidebar } from './Overview';
import { FiMenu, FiSearch, FiRefreshCw, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './AdminDashboard.css';

const ROLES = ['customer', 'staff', 'finance', 'support', 'admin'];
const ROLE_COLORS = { admin: { bg:'#FEE2E2',color:'#DC2626' }, staff: { bg:'#DBEAFE',color:'#2563EB' }, finance: { bg:'#D1FAE5',color:'#059669' }, support: { bg:'#FEF3C7',color:'#D97706' }, customer: { bg:'#F3F4F6',color:'#6B7280' } };

export default function AdminUsers() {
  const [sidebar, setSidebar] = useState(false);
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRole] = useState('');
  const [editUser, setEdit]   = useState(null);
  const [newRole, setNewRole] = useState('');
  const [saving, setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams({ limit: 100, ...(search && { search }), ...(roleFilter && { role: roleFilter }) }).toString();
    api.get(`/users?${q}`).then(r => { setUsers(r.data.users || []); setTotal(r.data.total || 0); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const handleEdit = u => { setEdit(u); setNewRole(u.role); };
  const handleSave = async () => {
    setSaving(true);
    try { await api.put(`/users/${editUser._id}`, { role: newRole }); toast.success('Role updated!'); setEdit(null); load(); }
    catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };
  const handleDelete = async u => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try { await api.delete(`/users/${u._id}`); toast.success('User deleted'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Delete failed'); }
  };
  const toggleActive = async u => {
    try { await api.put(`/users/${u._id}`, { role: u.role, isActive: !u.isActive }); toast.success(u.isActive ? 'User disabled' : 'User activated'); load(); }
    catch { toast.error('Update failed'); }
  };

  return (
    <div className="admin-layout">
      <Helmet><title>Users — Admin Dashboard</title></Helmet>
      <AdminSidebar open={sidebar} onClose={() => setSidebar(false)} />
      <div className="admin-content">
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebar(true)} id="admin-users-menu"><FiMenu /></button>
          <div><h1 className="admin-page-title">👤 User Management</h1><p className="admin-page-subtitle">{total} total users</p></div>
          <div className="admin-topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={load}><FiRefreshCw /></button>
          </div>
        </div>

        <div className="admin-body">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input className="input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} style={{ paddingLeft: 36 }} id="users-search" />
            </div>
            <select className="input" style={{ width: 160 }} value={roleFilter} onChange={e => { setRole(e.target.value); }} id="users-role-filter">
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={load}>Search</button>
          </div>

          <div className="admin-data-table">
            <table>
              <thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={{ textAlign:'center',padding:40 }}>Loading users...</td></tr>
                  : users.length === 0 ? <tr><td colSpan={7} style={{ textAlign:'center',padding:40,color:'var(--muted)' }}>No users found</td></tr>
                  : users.map(u => {
                    const rs = ROLE_COLORS[u.role] || ROLE_COLORS.customer;
                    return (
                      <tr key={u._id}>
                        <td><div style={{ display:'flex',alignItems:'center',gap:10 }}>
                          <div style={{ width:36,height:36,borderRadius:'50%',background:'var(--pink-100)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'var(--pink-600)',flexShrink:0 }}>
                            {u.avatar?.url ? <img src={u.avatar.url} style={{ width:36,height:36,borderRadius:'50%',objectFit:'cover' }} /> : u.name?.[0]?.toUpperCase()}
                          </div>
                          <div><strong style={{ fontSize:'0.88rem' }}>{u.name}</strong>{u.isVerified && <span style={{ fontSize:'0.7rem',color:'#059669',marginLeft:6 }}>✓ Verified</span>}</div>
                        </div></td>
                        <td style={{ fontSize:'0.83rem',color:'var(--muted)' }}>{u.email}</td>
                        <td style={{ fontSize:'0.83rem',color:'var(--muted)' }}>{u.phone || '—'}</td>
                        <td><span style={{ background:rs.bg,color:rs.color,padding:'3px 10px',borderRadius:20,fontSize:'0.75rem',fontWeight:600,textTransform:'capitalize' }}>{u.role}</span></td>
                        <td>
                          <button onClick={() => toggleActive(u)} style={{ background:u.isActive?'#D1FAE5':'#FEE2E2',color:u.isActive?'#059669':'#DC2626',border:'none',borderRadius:20,padding:'3px 10px',fontSize:'0.75rem',fontWeight:600,cursor:'pointer' }}>
                            {u.isActive ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td style={{ fontSize:'0.8rem',color:'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td><div style={{ display:'flex',gap:6 }}>
                          <button className="btn btn-secondary btn-sm" style={{ padding:'5px 10px' }} onClick={() => handleEdit(u)} id={`edit-user-${u._id}`}><FiEdit2 /></button>
                          <button style={{ background:'#FEE2E2',border:'none',borderRadius:6,padding:'5px 10px',cursor:'pointer',color:'#DC2626' }} onClick={() => handleDelete(u)}><FiTrash2 /></button>
                        </div></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editUser && (
          <motion.div className="admin-modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="admin-modal" style={{ maxWidth:400 }} initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }}>
              <div className="admin-modal-header"><h3>Change Role: {editUser.name}</h3><button className="admin-modal-close" onClick={() => setEdit(null)}>✕</button></div>
              <div className="admin-form-group">
                <label>Role</label>
                <select className="input" value={newRole} onChange={e => setNewRole(e.target.value)} id="change-role-select">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="admin-form-actions" style={{ marginTop:16 }}>
                <button className="btn btn-secondary" onClick={() => setEdit(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-role-btn">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
