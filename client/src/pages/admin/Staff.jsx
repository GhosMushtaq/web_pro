import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './Overview';
import {
  FiMenu, FiPlus, FiEdit2, FiTrash2, FiX,
  FiUser, FiSearch, FiRefreshCw, FiShield,
  FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './AdminDashboard.css';
import ManageStaffModal from './ManageStaffModal';

const DEPARTMENTS = ['Warehouse', 'Packaging', 'Delivery', 'Customer Service', 'Operations'];
const PERMISSIONS  = ['manage_orders', 'manage_inventory', 'view_reports', 'process_returns', 'update_order_status'];
const ROLES        = ['customer', 'staff', 'finance', 'support', 'admin'];

const ROLE_COLORS = {
  admin:    { bg: '#FEE2E2', color: '#DC2626' },
  staff:    { bg: '#DBEAFE', color: '#2563EB' },
  finance:  { bg: '#D1FAE5', color: '#059669' },
  support:  { bg: '#FEF3C7', color: '#D97706' },
  customer: { bg: '#F3F4F6', color: '#6B7280' },
};

/* ─── Modal ─────────────────────────────────────────────── */
function UserRoleModal({ user, onClose, onSaved }) {
  const [role, setRole]       = useState(user.role);
  const [active, setActive]   = useState(user.isActive);
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${user._id}`, { role, isActive: active });
      toast.success('User updated!');
      onSaved();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="admin-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" style={{ maxWidth: 440 }}
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
        <div className="admin-modal-header">
          <h3>Edit Role &amp; Status</h3>
          <button className="admin-modal-close" onClick={onClose}><FiX /></button>
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 20px', borderBottom: '1px solid #F3F4F6', marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--pink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--pink-600)', fontWeight: 700 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem' }}>{user.name}</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{user.email}</p>
          </div>
        </div>

        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="admin-form-group">
            <label>Assign Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)} id="user-role-select">
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div className="admin-form-group">
            <label>Account Status</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 16px', borderRadius: 8, border: `2px solid ${active ? 'var(--pink-400)' : '#E5E7EB'}`, background: active ? 'var(--pink-50)' : 'white', transition: 'all 0.2s' }}>
                <input type="radio" name="status" checked={active} onChange={() => setActive(true)} style={{ display: 'none' }} />
                <FiCheckCircle style={{ color: active ? 'var(--pink-500)' : '#9CA3AF' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 500, color: active ? 'var(--pink-600)' : 'var(--muted)' }}>Active</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 16px', borderRadius: 8, border: `2px solid ${!active ? '#FCA5A5' : '#E5E7EB'}`, background: !active ? '#FEF2F2' : 'white', transition: 'all 0.2s' }}>
                <input type="radio" name="status" checked={!active} onChange={() => setActive(false)} style={{ display: 'none' }} />
                <FiXCircle style={{ color: !active ? '#EF4444' : '#9CA3AF' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 500, color: !active ? '#EF4444' : 'var(--muted)' }}>Disabled</span>
              </label>
            </div>
          </div>
        </div>

        {/* Role description */}
        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: '0.8rem', color: 'var(--muted)' }}>
          {role === 'admin'    && '⚙️ Full access to all admin panels and settings'}
          {role === 'staff'    && '📦 Can manage orders, inventory and packaging'}
          {role === 'finance'  && '💰 Can verify payments and view financial reports'}
          {role === 'support'  && '🎧 Can handle customer support tickets'}
          {role === 'customer' && '👤 Regular customer with no admin access'}
        </div>

        <div className="admin-form-actions" style={{ marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-user-role-btn">
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Add Staff Modal ────────────────────────────────────── */
function AddStaffModal({ users, onClose, onSaved }) {
  const [isNewUser, setIsNewUser] = useState(false);
  // User Mode
  const [userId, setUserId]       = useState('');
  // Custom Registration Mode
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [phone, setPhone]         = useState('');
  const [addressRaw, setAddress]  = useState('');

  // Employment Details
  const [dept, setDept]           = useState('Warehouse');
  const [perms, setPerms]         = useState([]);
  const [salary, setSalary]       = useState(0);
  const [workingHoursStart, setStart] = useState('09:00');
  const [workingHoursEnd, setEnd]     = useState('17:00');
  const [leaveDays, setLeaves]    = useState(20);
  const [daysOff, setDaysOff]     = useState([]);
  
  const [saving, setSaving]       = useState(false);

  const togglePerm = p => setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleDayOff = d => setDaysOff(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleSave = async () => {
    if (!isNewUser && !userId) return toast.error('Select a user');
    if (isNewUser && (!name || !email || !password)) return toast.error('Name, email, and password required');

    setSaving(true);
    try {
      await api.post('/staff', { 
        isNewUser, userId, 
        name, email, password, phone, addressRaw,
        department: dept, permissions: perms,
        salary: Number(salary), workingHoursStart, workingHoursEnd, leaveDays: Number(leaveDays), daysOff
      });
      toast.success('Staff member deployed successfully!');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Transaction Failed'); }
    finally { setSaving(false); }
  };

  const eligible = users.filter(u => u.role === 'customer' || u.role === 'staff');
  const weekDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  return (
    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Scrollable container for a big modal */}
      <motion.div className="admin-modal" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
        <div className="admin-modal-header" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, paddingBottom: 16 }}>
          <h3>{isNewUser ? '➕ Register New Employee' : '➕ Promote to Staff'}</h3>
          <button className="admin-modal-close" onClick={onClose}><FiX /></button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={() => setIsNewUser(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${!isNewUser ? 'var(--pink-400)' : '#E5E7EB'}`, background: !isNewUser ? 'var(--pink-50)' : 'white', color: !isNewUser ? 'var(--pink-600)' : 'var(--muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Select Existing User</button>
          <button onClick={() => setIsNewUser(true)} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${isNewUser ? 'var(--pink-400)' : '#E5E7EB'}`, background: isNewUser ? 'var(--pink-50)' : 'white', color: isNewUser ? 'var(--pink-600)' : 'var(--muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Register New Employee</button>
        </div>

        {/* IDENTITY SECTION */}
        <div style={{ background: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#374151' }}>Identity</h4>
          {!isNewUser ? (
             <div className="admin-form-group" style={{ margin: 0 }}>
               <label>Assign Account *</label>
               <select className="input" value={userId} onChange={e => setUserId(e.target.value)} id="staff-user-select">
                 <option value="">-- Choose an active user --</option>
                 {eligible.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email}) — {u.role}</option>)}
               </select>
             </div>
          ) : (
            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="admin-form-group"><label>Full Name *</label><input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Ali Khan" /></div>
              <div className="admin-form-group"><label>Email *</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@domain.com" /></div>
              <div className="admin-form-group"><label>Password *</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Temporary login password" /></div>
              <div className="admin-form-group"><label>Phone</label><input className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="03XXXXXXXXX" /></div>
              <div className="admin-form-group" style={{ gridColumn: '1 / -1', margin: 0 }}><label>Residential Address</label><input className="input" value={addressRaw} onChange={e=>setAddress(e.target.value)} placeholder="Full street address, city" /></div>
            </div>
          )}
        </div>

        {/* HR SECTION */}
        <div style={{ background: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#374151' }}>HR & Employment</h4>
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="admin-form-group">
              <label>Department</label>
              <select className="input" value={dept} onChange={e => setDept(e.target.value)} id="staff-dept-select">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Base Salary (Rs.)</label>
              <input type="number" className="input" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 50000" />
            </div>
            <div className="admin-form-group">
              <label>Shift Start / End</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="time" className="input" value={workingHoursStart} onChange={e => setStart(e.target.value)} />
                <input type="time" className="input" value={workingHoursEnd} onChange={e => setEnd(e.target.value)} />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Yearly Leave Quota (Days)</label>
              <input type="number" className="input" value={leaveDays} onChange={e => setLeaves(e.target.value)} placeholder="20" />
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
              <label>Weekly Days Off</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {weekDays.map(day => (
                  <label key={day} style={{ background: daysOff.includes(day) ? '#DBEAFE' : 'white', border: `1px solid ${daysOff.includes(day) ? '#3B82F6' : '#E5E7EB'}`, color: daysOff.includes(day) ? '#1D4ED8' : 'var(--muted)', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={daysOff.includes(day)} onChange={()=>toggleDayOff(day)} style={{display:'none'}} />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div style={{ background: '#F9FAFB', padding: 16, borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#374151' }}>Security Permissions</h4>
          <div className="admin-form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {PERMISSIONS.map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, background: perms.includes(p) ? 'var(--pink-50)' : 'white', border: `1px solid ${perms.includes(p) ? 'var(--pink-300)' : '#E5E7EB'}`, cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s' }}>
                  <input type="checkbox" checked={perms.includes(p)} onChange={() => togglePerm(p)} style={{ display: 'none' }} />
                  <FiShield style={{ color: perms.includes(p) ? 'var(--pink-500)' : '#9CA3AF', fontSize: '0.9rem' }} />
                  {p.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-form-actions" style={{ marginTop: 20, position: 'sticky', bottom: -1, background: 'white', paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="add-staff-save-btn">
            {saving ? 'Saving...' : '✅ Save Employee Record'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function AdminStaff() {
  const [sidebar, setSidebar]       = useState(false);
  const [users, setUsers]           = useState([]);
  const [staffList, setStaffList]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser]     = useState(null);
  const [manageStaff, setManageStaff] = useState(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [tab, setTab]               = useState('users'); // 'users' | 'staff'

  const load = async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([
        api.get('/users?limit=100'),
        api.get('/staff'),
      ]);
      setUsers(u.data.users || []);
      setStaffList(s.data.staff || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('This will permanently delete this staff member AND their user account. Continue?')) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Staff member and account deleted permanently');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Permanently delete account for "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User account deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="admin-layout">
      <Helmet><title>Staff Management — Admin Dashboard</title></Helmet>
      <AdminSidebar open={sidebar} onClose={() => setSidebar(false)} />

      <div className="admin-content">
        {/* Topbar */}
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebar(true)} id="admin-staff-menu"><FiMenu /></button>
          <div>
            <h1 className="admin-page-title">👥 Staff Management</h1>
            <p className="admin-page-subtitle">{users.length} users · {staffList.length} staff members</p>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={load} id="refresh-staff-btn">
              <FiRefreshCw style={{ marginRight: 4 }} /> Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddStaff(true)} id="add-staff-btn">
              <FiPlus style={{ marginRight: 4 }} /> Add Staff
            </button>
          </div>
        </div>

        <div className="admin-body">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F3F4F6', borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {[{ key: 'users', label: `👤 All Users (${users.length})` }, { key: 'staff', label: `🛡️ Staff Members (${staffList.length})` }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? 'var(--pink-600)' : 'var(--muted)', boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── USERS TAB ── */}
          {tab === 'users' && (
            <>
              {/* Filters */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input className="input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} id="staff-search" />
                </div>
                <select className="input" style={{ width: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)} id="role-filter">
                  <option value="">All Roles</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="admin-data-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ color: 'var(--muted)' }}>Loading users...</div>
                      </td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No users found</td></tr>
                    ) : filtered.map(u => {
                      const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.customer;
                      return (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pink-600)', fontWeight: 700, flexShrink: 0 }}>
                                {u.avatar?.url
                                  ? <img src={u.avatar.url} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                  : u.name?.[0]?.toUpperCase()}
                              </div>
                              <strong style={{ fontSize: '0.88rem' }}>{u.name}</strong>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{u.email}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{u.phone || '—'}</td>
                          <td>
                            <span style={{ background: roleStyle.bg, color: roleStyle.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            <span style={{ background: u.isActive ? '#D1FAE5' : '#FEE2E2', color: u.isActive ? '#059669' : '#DC2626', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                              {u.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-secondary btn-sm" style={{ padding: '5px 10px', gap: 4 }} onClick={() => setEditUser(u)} id={`edit-user-${u._id}`}>
                                <FiEdit2 /> Edit Role
                              </button>
                              <button className="btn btn-sm" style={{ padding: '5px 10px', gap: 4, background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 500, fontSize: '0.82rem' }} onClick={() => handleDeleteUser(u._id, u.name)} id={`del-user-${u._id}`}>
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── STAFF TAB ── */}
          {tab === 'staff' && (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading staff...</div>
              ) : staffList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>👥</div>
                  <h3>No Staff Members Yet</h3>
                  <p style={{ color: 'var(--muted)', marginTop: 8 }}>Click "Add Staff" to promote a user to the staff role.</p>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddStaff(true)}>➕ Add First Staff Member</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {staffList.map(s => (
                    <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: 20, position: 'relative', overflow: 'hidden' }}>
                      {/* Top accent */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--grad-primary)' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--pink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pink-600)', fontWeight: 700, fontSize: '1.2rem' }}>
                          {s.user?.avatar?.url
                            ? <img src={s.user.avatar.url} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                            : s.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong>{s.user?.name || 'Unknown'}</strong>
                          <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.user?.email}</p>
                        </div>
                        <span style={{ background: s.isActive !== false ? '#D1FAE5' : '#FEE2E2', color: s.isActive !== false ? '#059669' : '#DC2626', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>
                          {s.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
                          🏢 {s.department || 'Unassigned'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#F9FAFB', padding: '12px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #F3F4F6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#374151' }}>
                          <FiDollarSign style={{ color: '#059669' }} /> <strong>Rs. {(s.salary || 0).toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#374151' }}>
                          <FiClock style={{ color: '#3B82F6' }} /> <strong>{s.workingHours?.start || '09:00'} - {s.workingHours?.end || '17:00'}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#374151', gridColumn: '1 / -1' }}>
                          <FiCalendar style={{ color: '#F59E0B' }} /> <strong>Off: {s.daysOff?.length > 0 ? s.daysOff.join(', ') : 'None'}</strong> | Leaves: {s.leaveDays || 0}
                        </div>
                      </div>

                      {s.permissions?.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Permissions</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {s.permissions.map(p => (
                              <span key={p} style={{ background: 'var(--pink-50)', color: 'var(--pink-600)', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 500 }}>
                                {p.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
                        <button onClick={() => setManageStaff(s)} style={{ flex: 2, background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600 }}>
                          <FiEdit2 /> Manage HR Profile
                        </button>
                        <button onClick={() => handleDeleteStaff(s._id)} id={`del-staff-${s._id}`}
                          style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 500 }}>
                          <FiTrash2 /> Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editUser && <UserRoleModal user={editUser} onClose={() => setEditUser(null)} onSaved={() => { setEditUser(null); load(); }} />}
        {showAddStaff && <AddStaffModal users={users} onClose={() => setShowAddStaff(false)} onSaved={() => { setShowAddStaff(false); load(); }} />}
        {manageStaff && <ManageStaffModal staff={manageStaff} onClose={() => setManageStaff(null)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}
