import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiDollarSign, FiCalendar, FiClock, FiFileText, FiShield, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const DEPARTMENTS = ['Warehouse', 'Packaging', 'Delivery', 'Customer Service', 'Operations'];
const PERMISSIONS  = ['manage_orders', 'manage_inventory', 'view_reports', 'process_returns', 'update_order_status'];
const weekDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function ManageStaffModal({ staff, onClose, onSaved }) {
  const [tab, setTab] = useState('profile'); // profile, payroll, activity, attendance
  const [saving, setSaving] = useState(false);

  // --- Attendance State ---
  const [attType, setAttType] = useState('leave'); // leave, holiday, overtime
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attReason, setAttReason] = useState('');
  const [attHours, setAttHours] = useState('');
  const [attLeaveType, setAttLeaveType] = useState('annual');

  const handleAddAttendance = async () => {
    if (!attDate) return toast.error('Date is required');
    if ((attType === 'leave' || attType === 'overtime') && !attReason) return toast.error('Reason / Name is required');
    if (attType === 'holiday' && !attReason) return toast.error('Holiday name is required');
    if (attType === 'overtime' && !attHours) return toast.error('Hours are required for overtime');

    setSaving(true);
    try {
      await api.post(`/staff/${staff._id}/attendance`, {
        recordType: attType,
        date: attDate,
        reason: attType === 'holiday' ? undefined : attReason,
        name: attType === 'holiday' ? attReason : undefined,
        type: attType === 'leave' ? attLeaveType : undefined,
        hours: attType === 'overtime' ? attHours : undefined
      });
      toast.success(attType === 'leave' ? 'Leave recorded!' : attType === 'holiday' ? 'Holiday recorded!' : 'Overtime recorded!');
      setAttReason('');
      setAttHours('');
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  // --- Profile State ---
  const [dept, setDept] = useState(staff.department || 'Warehouse');
  const [perms, setPerms] = useState(staff.permissions || []);
  const [salary, setSalary] = useState(staff.salary || 0);
  const [workingHoursStart, setStart] = useState(staff.workingHours?.start || '09:00');
  const [workingHoursEnd, setEnd]     = useState(staff.workingHours?.end || '17:00');
  const [leaveDays, setLeaves] = useState(staff.leaveDays || 0);
  const [daysOff, setDaysOff] = useState(staff.daysOff || []);
  const [isActive, setIsActive] = useState(staff.isActive !== false);

  const togglePerm = p => setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleDayOff = d => setDaysOff(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await api.put(`/staff/${staff._id}`, {
        department: dept, permissions: perms, isActive,
        salary: Number(salary), workingHoursStart, workingHoursEnd, leaveDays: Number(leaveDays), daysOff
      });
      toast.success('Staff profile updated!');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  // --- Payroll State ---
  const [payMonth, setPayMonth] = useState(new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()));
  const [payBonus, setPayBonus] = useState(0);
  const [payDed, setPayDed] = useState(0);
  const [payMethod, setPayMethod] = useState('Bank Transfer');
  const [payRemarks, setPayRemarks] = useState('');

  const handlePaySalary = async () => {
    if (!window.confirm(`Dispense salary to ${staff.user?.name}?`)) return;
    setSaving(true);
    try {
      await api.post(`/staff/${staff._id}/pay`, {
        month: payMonth, bonus: Number(payBonus), deductions: Number(payDed),
        paymentMethod: payMethod, remarks: payRemarks
      });
      toast.success('Salary Dispensed!');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Transaction failed'); }
    finally { setSaving(false); }
  };

  // --- Activity Log State ---
  const [actType, setActType] = useState('general');
  const [actNote, setActNote] = useState('');

  const handleAddLog = async () => {
    if (!actNote) return toast.error('Enter a remark');
    setSaving(true);
    try {
      await api.post(`/staff/${staff._id}/log`, { type: actType, note: actNote });
      toast.success('Activity Log Appended!');
      setActNote('');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Network failed'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Scrollable massive container */}
      <motion.div className="admin-modal" style={{ maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
        
        {/* Header Block */}
        <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--pink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'var(--pink-600)', fontWeight: 700 }}>
                {staff.user?.avatar?.url ? <img src={staff.user.avatar.url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : staff.user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#111827' }}>{staff.user?.name}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>{staff.department} • Joined {new Date(staff.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <button className="admin-modal-close" onClick={onClose}><FiX /></button>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 4, marginTop: 24, background: '#F3F4F6', padding: 4, borderRadius: 10, width: 'fit-content' }}>
            {[
              { id: 'profile', icon: <FiBriefcase />, label: 'Profile Editor' },
              { id: 'payroll', icon: <FiDollarSign />, label: 'Payroll Ledger' },
              { id: 'activity', icon: <FiFileText />, label: 'Activity Logs' },
              { id: 'attendance', icon: <FiClock />, label: 'Attendance' }
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: tab === t.id ? 'white' : 'transparent', color: tab === t.id ? 'var(--pink-600)' : 'var(--muted)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Body */}
        <div style={{ padding: 24 }}>
          
          {/* TAB: PROFILE */}
          {tab === 'profile' && (
            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="admin-form-group">
                <label>Department</label>
                <select className="input" value={dept} onChange={e => setDept(e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Base Salary (Rs.)</label>
                <input type="number" className="input" value={salary} onChange={e => setSalary(e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label>Daily Shift Form</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="time" className="input" value={workingHoursStart} onChange={e => setStart(e.target.value)} />
                  <input type="time" className="input" value={workingHoursEnd} onChange={e => setEnd(e.target.value)} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Leave Days (Yearly Quota)</label>
                <input type="number" className="input" value={leaveDays} onChange={e => setLeaves(e.target.value)} />
              </div>
              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Weekly Days Off</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {weekDays.map(day => (
                    <label key={day} style={{ background: daysOff.includes(day) ? '#DBEAFE' : '#F9FAFB', border: `1px solid ${daysOff.includes(day) ? '#3B82F6' : '#E5E7EB'}`, color: daysOff.includes(day) ? '#1D4ED8' : 'var(--muted)', padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
                      <input type="checkbox" checked={daysOff.includes(day)} onChange={()=>toggleDayOff(day)} style={{display:'none'}} />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Security Permissions</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {PERMISSIONS.map(p => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: perms.includes(p) ? 'var(--pink-50)' : 'white', border: `1px solid ${perms.includes(p) ? 'var(--pink-300)' : '#E5E7EB'}`, cursor: 'pointer', fontSize: '0.8rem' }}>
                      <input type="checkbox" checked={perms.includes(p)} onChange={() => togglePerm(p)} style={{ display: 'none' }} />
                      <FiShield style={{ color: perms.includes(p) ? 'var(--pink-500)' : '#9CA3AF' }} />
                      {p.replace(/_/g, ' ')}
                    </label>
                  ))}
                </div>
              </div>

              <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px 16px', background: isActive ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${isActive ? '#A7F3D0' : '#FECACA'}`, borderRadius: 8, width: 'fit-content' }}>
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                  <span style={{ fontWeight: 600, color: isActive ? '#065F46' : '#991B1B' }}>{isActive ? 'Active Employee' : 'Deactivated / Terminated'}</span>
                </label>
              </div>

              <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginTop: 10 }}>
                <button className="btn btn-primary" onClick={handleUpdateProfile} disabled={saving} style={{ width: '100%' }}>
                  {saving ? 'Saving...' : '💾 Save Profile Details'}
                </button>
              </div>
            </div>
          )}

          {/* TAB: PAYROLL */}
          {tab === 'payroll' && (
            <div>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 16px', color: '#111827', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}><FiDollarSign color="var(--pink-600)" /> Dispense Salary</h4>
                <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div className="admin-form-group"><label>Month Frame</label><input type="text" className="input" value={payMonth} onChange={e=>setPayMonth(e.target.value)} /></div>
                  <div className="admin-form-group"><label>Base Salary</label><input type="text" className="input" value={`Rs. ${staff.salary || 0}`} disabled /></div>
                  <div className="admin-form-group"><label>Bonus Payment (+)</label><input type="number" className="input" value={payBonus} onChange={e=>setPayBonus(e.target.value)} placeholder="0" /></div>
                  <div className="admin-form-group"><label>Deductions (-)</label><input type="number" className="input" value={payDed} onChange={e=>setPayDed(e.target.value)} placeholder="0" /></div>
                  <div className="admin-form-group"><label>Method</label>
                    <select className="input" value={payMethod} onChange={e=>setPayMethod(e.target.value)}>
                      <option>Bank Transfer</option><option>Cash</option><option>Cheque</option>
                    </select>
                  </div>
                  <div className="admin-form-group"><label>Net Dispensation</label><input type="text" className="input" value={`Rs. ${(Number(staff.salary) || 0) + Number(payBonus) - Number(payDed)}`} disabled style={{ background: '#ECFDF5', color: '#065F46', fontWeight: 700 }} /></div>
                  <div className="admin-form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
                    <input type="text" className="input" value={payRemarks} onChange={e=>setPayRemarks(e.target.value)} placeholder="Transaction remarks (e.g. Cleared via HBL Account)" />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handlePaySalary} disabled={saving} style={{ marginTop: 16, width: '100%', padding: 12 }}>
                  {saving ? 'Processing...' : '💳 Dispatch Payment'}
                </button>
              </div>

              <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#374151' }}>Payroll Ledger</h4>
              <div className="admin-data-table">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Month</th><th>Amount</th><th>Type</th><th>Net Paid</th></tr>
                  </thead>
                  <tbody>
                    {staff.payrollHistory?.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>No payroll records found.</td></tr>
                    ) : (
                      [...staff.payrollHistory].reverse().map((p, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: '0.85rem' }}>{new Date(p.datePaid).toLocaleDateString()}</td>
                          <td><strong>{p.month}</strong></td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            Base: {p.baseAmount}<br/>
                            <span style={{ color: '#059669' }}>+ {p.bonus}</span> | <span style={{ color: '#DC2626' }}>- {p.deductions}</span>
                          </td>
                          <td><span style={{ fontSize: '0.8rem', background: '#F3F4F6', padding: '3px 8px', borderRadius: 4 }}>{p.paymentMethod}</span></td>
                          <td><strong style={{ color: '#065F46' }}>Rs. {p.netPaid.toLocaleString()}</strong></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY LOGS */}
          {tab === 'activity' && (
            <div>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <select className="input" style={{ width: 160 }} value={actType} onChange={e=>setActType(e.target.value)}>
                    <option value="general">📝 General Note</option>
                    <option value="warning">⚠️ Warning File</option>
                    <option value="award">⭐ Award Given</option>
                    <option value="promotion">🚀 Promotion</option>
                    <option value="leave_approved">🏖️ Leave Day</option>
                  </select>
                  <input type="text" className="input" style={{ flex: 1 }} value={actNote} onChange={e=>setActNote(e.target.value)} placeholder="Enter details..." />
                  <button className="btn btn-secondary" onClick={handleAddLog} disabled={saving || !actNote}>Add Record</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {staff.activityLogs?.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, border: '1px dashed #E5E7EB', borderRadius: 12 }}>No activity logged yet.</div>
                ) : (
                  staff.activityLogs.map((log, i) => {
                    let color = '#3B82F6', bg = '#EFF6FF', icon = '📝';
                    if (log.type === 'warning') { color = '#DC2626'; bg = '#FEF2F2'; icon = '⚠️'; }
                    if (log.type === 'award') { color = '#D97706'; bg = '#FEF3C7'; icon = '⭐'; }
                    if (log.type === 'promotion') { color = '#059669'; bg = '#D1FAE5'; icon = '🚀'; }
                    if (log.type === 'leave_approved') { color = '#7C3AED'; bg = '#EDE9FE'; icon = '🏖️'; }
                    return (
                      <div key={i} style={{ display: 'flex', gap: 16, borderLeft: `2px solid ${color}`, paddingLeft: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{icon}</div>
                        <div style={{ flex: 1, background: 'white', border: '1px solid #E5E7EB', padding: 14, borderRadius: 8 }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#111827', lineHeight: 1.5 }}>{log.note}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
                            <span>On {new Date(log.date).toLocaleString()}</span>
                            <span>Logged by {log.addedBy?.name || 'Admin'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: ATTENDANCE */}
          {tab === 'attendance' && (
            <div>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 16px', color: '#111827', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}><FiClock color="#2563EB" /> Record Attendance Event</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(140px, 1fr) 2fr', gap: 12, alignItems: 'flex-start' }}>
                  <select className="input" value={attType} onChange={e => setAttType(e.target.value)}>
                    <option value="leave">🏖️ Leave Day</option>
                    <option value="holiday">🎉 Public Holiday</option>
                    <option value="overtime">⏱️ Overtime</option>
                  </select>
                  <input type="date" className="input" value={attDate} onChange={e => setAttDate(e.target.value)} />
                  
                  {attType === 'leave' && (
                    <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                      <select className="input" style={{ width: 150 }} value={attLeaveType} onChange={e => setAttLeaveType(e.target.value)}>
                        <option value="annual">Annual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="casual">Casual Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                      </select>
                      <input type="text" className="input" style={{ flex: 1 }} value={attReason} onChange={e => setAttReason(e.target.value)} placeholder="Reason for leave" />
                    </div>
                  )}

                  {attType === 'holiday' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <input type="text" className="input" value={attReason} onChange={e => setAttReason(e.target.value)} placeholder="Name of Holiday (e.g. Eid-ul-Fitr)" />
                    </div>
                  )}

                  {attType === 'overtime' && (
                    <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                      <input type="number" className="input" style={{ width: 120 }} value={attHours} onChange={e => setAttHours(e.target.value)} placeholder="Hours (e.g. 2.5)" step="0.5" />
                      <input type="text" className="input" style={{ flex: 1 }} value={attReason} onChange={e => setAttReason(e.target.value)} placeholder="Reason for overtime work" />
                    </div>
                  )}
                  
                  <button className="btn btn-primary" style={{ gridColumn: '1 / -1', marginTop: 8 }} onClick={handleAddAttendance} disabled={saving}>
                    {saving ? 'Recording...' : '💾 Save Attendance Record'}
                  </button>
                </div>
              </div>

              {/* Attendance Histories */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Leaves & Holidays */}
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16 }}>
                  <h5 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#374151' }}>Leaves & Holidays</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(!staff.leaveHistory?.length && !staff.holidays?.length) ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: 10 }}>No records found</div>
                    ) : (
                      <>
                        {staff.holidays?.map((h, i) => (
                          <div key={`h-${i}`} style={{ padding: '8px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                            <div><span style={{ color: '#166534', fontWeight: 700 }}>🎉 {h.name}</span> <br/><span style={{ color: '#15803D', fontSize: '0.7rem' }}>Public Holiday</span></div>
                            <div style={{ color: '#166534', fontWeight: 600 }}>{new Date(h.date).toLocaleDateString()}</div>
                          </div>
                        ))}
                        {staff.leaveHistory?.map((l, i) => (
                          <div key={`l-${i}`} style={{ padding: '8px 12px', background: l.type === 'unpaid' ? '#FEF2F2' : '#EFF6FF', border: `1px solid ${l.type==='unpaid'? '#FECACA' : '#BFDBFE'}`, borderRadius: 8, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                              <span style={{ color: l.type==='unpaid' ? '#991B1B' : '#1D4ED8', fontWeight: 700, textTransform: 'capitalize' }}>🏖️ {l.type} Leave</span>
                              <br/><span style={{ color: l.type==='unpaid' ? '#B91C1C' : '#3B82F6', fontSize: '0.75rem' }}>{l.reason}</span>
                            </div>
                            <div style={{ color: l.type==='unpaid' ? '#991B1B' : '#1D4ED8', fontWeight: 600 }}>{new Date(l.date).toLocaleDateString()}</div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Overtime */}
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16 }}>
                  <h5 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#374151' }}>Overtime Log</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(!staff.overtime?.length) ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: 10 }}>No records found</div>
                    ) : (
                      staff.overtime?.map((o, i) => (
                         <div key={`o-${i}`} style={{ padding: '8px 12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ color: '#B45309', fontWeight: 700 }}>⏱️ {o.hours} Hours OT</span>
                            <br/><span style={{ color: '#D97706', fontSize: '0.75rem' }}>{o.reason}</span>
                          </div>
                          <div style={{ color: '#B45309', fontWeight: 600 }}>{new Date(o.date).toLocaleDateString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
}
