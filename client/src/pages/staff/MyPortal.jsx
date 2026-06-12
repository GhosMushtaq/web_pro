import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiDollarSign, FiFileText, FiCalendar, FiUser,
  FiLogOut, FiPackage, FiBox, FiClock, FiRefreshCw,
  FiShield, FiAward, FiAlertTriangle, FiCheckCircle
} from 'react-icons/fi';
import { HiOutlineGift } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* ── Helper: stat mini-card ───────────────────────────────── */
function MiniStat({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: bg || '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '1.3rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Helper: activity log entry ───────────────────────────── */
function ActivityEntry({ log }) {
  const config = {
    warning:       { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: '⚠️', label: 'Warning' },
    award:         { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', icon: '⭐', label: 'Award' },
    promotion:     { color: '#059669', bg: '#D1FAE5', border: '#A7F3D0', icon: '🚀', label: 'Promotion' },
    leave_approved:{ color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', icon: '🏖️', label: 'Leave Approved' },
    general:       { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: '📝', label: 'Note' },
  };
  const c = config[log.type] || config.general;
  return (
    <div style={{ display: 'flex', gap: 14, borderLeft: `3px solid ${c.color}`, paddingLeft: 16 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
        {c.icon}
      </div>
      <div style={{ flex: 1, background: 'white', border: `1px solid ${c.border}`, padding: '12px 16px', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ background: c.bg, color: c.color, padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, border: `1px solid ${c.border}` }}>{c.label}</span>
          <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{new Date(log.date).toLocaleString('en-PK')}</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#374151', lineHeight: 1.6 }}>{log.note}</p>
        {log.addedBy?.name && (
          <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#9CA3AF' }}>— Logged by {log.addedBy.name}</p>
        )}
      </div>
    </div>
  );
}

/* ── Main Portal ──────────────────────────────────────────── */
export default function StaffPortal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector(s => s.auth?.user);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/me');
      setStaff(res.data.staff);
    } catch (e) {
      toast.error('Could not load your profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const leaveBalance = (staff?.leaveDays || 0) - (staff?.leavesTaken || 0);
  const totalEarned = (staff?.payrollHistory || []).reduce((sum, p) => sum + (p.netPaid || 0), 0);
  const lastPay = [...(staff?.payrollHistory || [])].reverse()[0];

  const TABS = [
    { id: 'dashboard', icon: <FiHome />, label: 'Dashboard' },
    { id: 'payroll',   icon: <FiDollarSign />, label: 'My Payroll' },
    { id: 'activity',  icon: <FiFileText />, label: 'Instructions' },
    { id: 'schedule',  icon: <FiCalendar />, label: 'My Schedule' },
    { id: 'profile',   icon: <FiUser />, label: 'My Profile' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'DM Sans, sans-serif' }}>
      <Helmet><title>My HR Portal — Gifting Bliss</title></Helmet>

      {/* ── Top Nav Bar ── */}
      <nav style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(236,72,153,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HiOutlineGift style={{ color: 'white', fontSize: '1.5rem' }} />
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>Gifting Bliss</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem', padding: '2px 10px', borderRadius: 20, fontWeight: 600, marginLeft: 8 }}>Staff Portal</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Link to="/staff/orders" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
            <FiPackage size={14} /> Orders
          </Link>
          <Link to="/staff/inventory" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
            <FiBox size={14} /> Inventory
          </Link>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'white', background: 'rgba(255,255,255,0.15)', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            <FiLogOut size={14} /> Log Out
          </button>
        </div>
      </nav>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: 16, color: '#9CA3AF' }}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <p style={{ fontSize: '1rem' }}>Loading your HR profile…</p>
        </div>
      ) : !staff ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: 16, color: '#9CA3AF' }}>
          <div style={{ fontSize: '3rem' }}>🚫</div>
          <p>No staff profile found. Please contact your administrator.</p>
        </div>
      ) : (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

          {/* ── Hero Header ── */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'white', borderRadius: 16, padding: '28px 32px', marginBottom: 20, border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'white', fontWeight: 800, flexShrink: 0, overflow: 'hidden' }}>
              {staff.user?.avatar?.url
                ? <img src={staff.user.avatar.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : staff.user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{greeting}, {staff.user?.name} 👋</h1>
                <span style={{ background: staff.isActive ? '#D1FAE5' : '#FEE2E2', color: staff.isActive ? '#065F46' : '#991B1B', padding: '4px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                  {staff.isActive ? '🟢 Active Employee' : '🔴 Inactive'}
                </span>
              </div>
              <p style={{ margin: '6px 0 0', color: '#6B7280', fontSize: '0.88rem' }}>
                <strong>{staff.department}</strong> · Joined {new Date(staff.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button onClick={load} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
              <FiRefreshCw size={14} /> Refresh
            </button>
          </motion.div>

          {/* ── Tab Navigation ── */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '6px 8px', marginBottom: 20, display: 'flex', gap: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none', background: activeTab === t.id ? 'linear-gradient(135deg, #EC4899, #8B5CF6)' : 'transparent', color: activeTab === t.id ? 'white' : '#6B7280', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.2s', boxShadow: activeTab === t.id ? '0 4px 12px rgba(236,72,153,0.35)' : 'none' }}>
                {t.icon} <span style={{ display: 'none' }}>{t.label}</span>
                <span style={{ display: 'block' }}>{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>

              {/* ─── DASHBOARD ─── */}
              {activeTab === 'dashboard' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
                    <MiniStat icon={<FiDollarSign />} label="Base Salary / Month" value={`Rs. ${(staff.salary || 0).toLocaleString()}`} color="#059669" />
                    <MiniStat icon={<FiClock />} label="Shift Hours" value={`${staff.workingHours?.start || '--'} – ${staff.workingHours?.end || '--'}`} color="#2563EB" />
                    <MiniStat icon={<FiCalendar />} label="Leave Balance" value={`${leaveBalance} days`} color={leaveBalance < 5 ? '#DC2626' : '#7C3AED'} />
                    <MiniStat icon={<FiAward />} label="Total Earned to Date" value={`Rs. ${totalEarned.toLocaleString()}`} color="#D97706" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Latest Pay */}
                    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 22 }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}><FiDollarSign color="#EC4899" /> Last Salary Received</h3>
                      {!lastPay ? (
                        <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>No payroll records yet.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          {[
                            ['Month', lastPay.month],
                            ['Base', `Rs. ${(lastPay.baseAmount || 0).toLocaleString()}`],
                            ['Bonus', <span style={{ color: '#059669' }}>+ Rs. {(lastPay.bonus || 0).toLocaleString()}</span>],
                            ['Deductions', <span style={{ color: '#DC2626' }}>- Rs. {(lastPay.deductions || 0).toLocaleString()}</span>],
                            ['Method', lastPay.paymentMethod],
                            ['Net Paid', <strong style={{ color: '#059669', fontSize: '1.0rem' }}>Rs. {(lastPay.netPaid || 0).toLocaleString()}</strong>],
                          ].map(([l, v]) => (
                            <div key={l} style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 12px' }}>
                              <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: 2 }}>{l}</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Latest Instructions */}
                    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 22 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}><FiFileText color="#8B5CF6" /> Latest from Admin</h3>
                        <button onClick={() => setActiveTab('activity')} style={{ fontSize: '0.75rem', color: '#EC4899', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(staff.activityLogs || []).slice(0, 3).length === 0 ? (
                          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>No messages yet.</p>
                        ) : (staff.activityLogs || []).slice(0, 3).map((log, i) => (
                          <ActivityEntry key={i} log={log} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── PAYROLL ─── */}
              {activeTab === 'payroll' && (
                <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  {/* Summary strip */}
                  <div style={{ background: 'linear-gradient(135deg, #064E3B, #065F46)', padding: '24px 28px', display: 'flex', gap: 40, alignItems: 'center' }}>
                    {[
                      ['Total Earned', `Rs. ${totalEarned.toLocaleString()}`],
                      ['Payments Made', `${staff.payrollHistory?.length || 0} payments`],
                      ['Latest Month', lastPay?.month || 'No records'],
                      ['Base / Month', `Rs. ${(staff.salary || 0).toLocaleString()}`],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginTop: 2 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Ledger table */}
                  <div style={{ padding: 24 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>Full Salary Ledger</h3>
                    {(staff.payrollHistory || []).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 8 }}>💳</div>
                        <p>No salary records found yet.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#F9FAFB' }}>
                              {['Date', 'Month', 'Base Salary', 'Bonus', 'Deductions', 'Net Paid', 'Method', 'Remarks'].map(h => (
                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[...(staff.payrollHistory || [])].reverse().map((p, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '12px 14px', fontSize: '0.83rem', color: '#6B7280' }}>{new Date(p.datePaid).toLocaleDateString()}</td>
                                <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.88rem' }}>{p.month}</td>
                                <td style={{ padding: '12px 14px', fontSize: '0.88rem' }}>Rs. {(p.baseAmount || 0).toLocaleString()}</td>
                                <td style={{ padding: '12px 14px', fontSize: '0.88rem', color: '#059669', fontWeight: 600 }}>+ {(p.bonus || 0).toLocaleString()}</td>
                                <td style={{ padding: '12px 14px', fontSize: '0.88rem', color: '#DC2626', fontWeight: 600 }}>- {(p.deductions || 0).toLocaleString()}</td>
                                <td style={{ padding: '12px 14px' }}><strong style={{ color: '#059669', fontSize: '0.95rem' }}>Rs. {(p.netPaid || 0).toLocaleString()}</strong></td>
                                <td style={{ padding: '12px 14px' }}><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{p.paymentMethod}</span></td>
                                <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#9CA3AF' }}>{p.remarks || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── ACTIVITY / INSTRUCTIONS ─── */}
              {activeTab === 'activity' && (
                <div>
                  <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 24 }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>📋 Admin Instructions, Notes & Warnings</h3>
                    <p style={{ margin: '0 0 24px', color: '#9CA3AF', fontSize: '0.82rem' }}>All messages recorded by your administrator. Read-only.</p>
                    {(staff.activityLogs || []).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 8 }}>📭</div>
                        <p>No messages from admin yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(staff.activityLogs || []).map((log, i) => (
                          <ActivityEntry key={i} log={log} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── SCHEDULE ─── */}
              {activeTab === 'schedule' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Shift card */}
                  <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 24 }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}><FiClock color="#2563EB" /> Daily Shift</h3>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', padding: '28px 0' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Clock In</div>
                        <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#059669', background: '#D1FAE5', borderRadius: 14, padding: '12px 22px', minWidth: 100 }}>{staff.workingHours?.start || '—'}</div>
                      </div>
                      <div style={{ fontSize: '1.5rem', color: '#9CA3AF', fontWeight: 300 }}>→</div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Clock Out</div>
                        <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#DC2626', background: '#FEE2E2', borderRadius: 14, padding: '12px 22px', minWidth: 100 }}>{staff.workingHours?.end || '—'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Days off card */}
                  <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 24 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}><FiCalendar color="#7C3AED" /> Weekly Schedule</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {WEEK_DAYS.map(day => {
                        const isOff = (staff.daysOff || []).includes(day);
                        return (
                          <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: isOff ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${isOff ? '#FECACA' : '#A7F3D0'}` }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: isOff ? '#DC2626' : '#065F46' }}>{day}</span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isOff ? '#DC2626' : '#059669' }}>
                              {isOff ? '🏖️ Day Off' : '✅ Working'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Leave balance */}
                  <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 24, gridColumn: '1 / -1' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>🏖️ Leave Status</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 20 }}>
                        {[
                          ['Yearly Quota', staff.leaveDays || 0, '#2563EB'],
                          ['Taken', staff.leavesTaken || 0, '#DC2626'],
                          ['Remaining', leaveBalance, leaveBalance < 5 ? '#DC2626' : '#059669'],
                        ].map(([l, v, c]) => (
                          <div key={l} style={{ textAlign: 'center', background: '#F9FAFB', borderRadius: 12, padding: '14px 22px', border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: c }}>{v}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6B7280', marginBottom: 6 }}>
                          <span>Leave Used</span>
                          <span>{staff.leavesTaken || 0} / {staff.leaveDays || 0} days</span>
                        </div>
                        <div style={{ height: 12, background: '#E5E7EB', borderRadius: 20, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(((staff.leavesTaken || 0) / (staff.leaveDays || 1)) * 100, 100)}%`, background: leaveBalance < 5 ? '#DC2626' : 'linear-gradient(90deg, #059669, #10B981)', borderRadius: 20, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leave & Holiday History */}
                  <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 24 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>✈️ My Leaves & Holidays</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(!staff.leaveHistory?.length && !staff.holidays?.length) ? (
                        <div style={{ color: '#9CA3AF', fontSize: '0.85rem', textAlign: 'center', padding: 16 }}>No leaves or holidays recorded yet.</div>
                      ) : (
                        <>
                          {staff.holidays?.map((h, i) => (
                            <div key={`h-${i}`} style={{ display: 'flex', justifyContent: 'space-between', background: '#F0FDF4', padding: '12px 14px', borderRadius: 10, border: '1px solid #BBF7D0' }}>
                              <div><div style={{ fontWeight: 700, color: '#166534', fontSize: '0.85rem' }}>🎉 {h.name}</div><div style={{ fontSize: '0.72rem', color: '#15803D' }}>Public Holiday</div></div>
                              <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.85rem' }}>{new Date(h.date).toLocaleDateString('en-PK')}</div>
                            </div>
                          ))}
                          {staff.leaveHistory?.map((l, i) => {
                            const isUnpaid = l.type === 'unpaid';
                            return (
                              <div key={`l-${i}`} style={{ display: 'flex', justifyContent: 'space-between', background: isUnpaid ? '#FEF2F2' : '#EFF6FF', padding: '12px 14px', borderRadius: 10, border: `1px solid ${isUnpaid ? '#FECACA' : '#BFDBFE'}` }}>
                                <div><div style={{ fontWeight: 700, color: isUnpaid ? '#991B1B' : '#1D4ED8', fontSize: '0.85rem', textTransform: 'capitalize' }}>🏖️ {l.type} Leave</div><div style={{ fontSize: '0.72rem', color: isUnpaid ? '#B91C1C' : '#3B82F6' }}>{l.reason}</div></div>
                                <div style={{ fontWeight: 700, color: isUnpaid ? '#991B1B' : '#1D4ED8', fontSize: '0.85rem' }}>{new Date(l.date).toLocaleDateString('en-PK')}</div>
                              </div>
                           );
                          })}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Overtime Logs */}
                  <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 24 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>⏱️ My Overtime Records</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(!staff.overtime?.length) ? (
                        <div style={{ color: '#9CA3AF', fontSize: '0.85rem', textAlign: 'center', padding: 16 }}>No overtime recorded.</div>
                      ) : (
                        staff.overtime?.map((o, i) => (
                          <div key={`o-${i}`} style={{ display: 'flex', justifyContent: 'space-between', background: '#FEF3C7', padding: '12px 14px', borderRadius: 10, border: '1px solid #FDE68A' }}>
                            <div><div style={{ fontWeight: 700, color: '#B45309', fontSize: '0.85rem' }}>⏱️ {o.hours} Hours Overtime</div><div style={{ fontSize: '0.72rem', color: '#D97706' }}>{o.reason}</div></div>
                            <div style={{ fontWeight: 700, color: '#B45309', fontSize: '0.85rem' }}>{new Date(o.date).toLocaleDateString('en-PK')}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── PROFILE ─── */}
              {activeTab === 'profile' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 28 }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}><FiUser color="#EC4899" /> Personal Details</h3>
                    {[
                      ['Full Name', staff.user?.name],
                      ['Email', staff.user?.email],
                      ['Phone', staff.user?.phone || 'Not on file'],
                      ['Address', staff.user?.address?.[0]?.street || 'Not on file'],
                      ['Account Since', new Date(staff.user?.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long' })],
                    ].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                        <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 600 }}>{l}</span>
                        <span style={{ fontSize: '0.88rem', color: '#111827', fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{v || '—'}</span>
                      </div>
                    ))}
                    <Link to="/profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem' }}>
                      ✏️ Update My Profile
                    </Link>
                  </div>

                  <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: 28 }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}><FiShield color="#7C3AED" /> Employment & Permissions</h3>
                    {[
                      ['Department', staff.department],
                      ['Status', staff.isActive ? 'Active' : 'Inactive'],
                      ['Base Salary', `Rs. ${(staff.salary || 0).toLocaleString()} / month`],
                      ['Shift', `${staff.workingHours?.start || '—'} to ${staff.workingHours?.end || '—'}`],
                      ['Days Off', (staff.daysOff || []).join(', ') || 'None assigned'],
                    ].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                        <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 600 }}>{l}</span>
                        <span style={{ fontSize: '0.88rem', color: '#111827', fontWeight: 500, textAlign: 'right' }}>{v || '—'}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Security Permissions</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(staff.permissions || []).length === 0 ? (
                          <span style={{ color: '#9CA3AF', fontSize: '0.82rem' }}>No special permissions assigned.</span>
                        ) : (staff.permissions || []).map(p => (
                          <span key={p} style={{ background: '#EDE9FE', color: '#5B21B6', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <FiCheckCircle size={11} /> {p.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
