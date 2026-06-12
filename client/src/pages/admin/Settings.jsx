import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './Overview';
import {
  FiMenu, FiSettings, FiUser, FiLock,
  FiTruck, FiBell, FiGlobe, FiCreditCard,
  FiSave, FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import './AdminDashboard.css';

/* ─── Reusable input group ───────────────────────────────── */
function Field({ label, id, type = 'text', value, onChange, placeholder, hint }) {
  return (
    <div className="admin-form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id} type={type} className="input"
        value={value ?? ''} onChange={onChange}
        placeholder={placeholder}
      />
      {hint && <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange, id }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{label}</span>
      <button id={id} onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: checked ? 'var(--pink-500)' : '#D1D5DB', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: checked ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 10, background: '#FAFAFA' }}>
        <span style={{ color: 'var(--pink-500)', fontSize: '1.1rem' }}>{icon}</span>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark)' }}>{title}</h3>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </motion.div>
  );
}

function SaveBtn({ onClick, saving, saved }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
      <button className="btn btn-primary" onClick={onClick} disabled={saving}
        style={{ minWidth: 140, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        {saving ? 'Saving...' : saved ? <><FiCheck />Saved!</> : <><FiSave />Save Changes</>}
      </button>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function AdminSettings() {
  const [sidebar, setSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setTab]   = useState('store');
  const authUser = useSelector(s => s.auth?.user);

  // Settings sections
  const [store, setStore]             = useState({});
  const [delivery, setDelivery]       = useState({});
  const [notifications, setNotif]     = useState({});
  const [social, setSocial]           = useState({});
  const [payment, setPayment]         = useState({});

  // Profile / password
  const [profile, setProfile]         = useState({ name: '', phone: '' });
  const [passwords, setPasswords]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Save state per section
  const [saving, setSaving] = useState({});
  const [saved,  setSaved]  = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([api.get('/settings'), api.get('/settings/profile')]);
      const st = s.data.settings;
      setStore(st.store        || {});
      setDelivery(st.delivery   || {});
      setNotif(st.notifications || {});
      setSocial(st.social       || {});
      setPayment(st.payment     || {});
      setProfile({ name: p.data.user?.name || '', phone: p.data.user?.phone || '' });
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (section, data) => {
    setSaving(v => ({ ...v, [section]: true }));
    try {
      await api.put(`/settings/${section}`, data);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved!`);
      setSaved(v => ({ ...v, [section]: true }));
      setTimeout(() => setSaved(v => ({ ...v, [section]: false })), 2000);
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(v => ({ ...v, [section]: false })); }
  };

  const saveProfile = async () => {
    setSaving(v => ({ ...v, profile: true }));
    try {
      await api.put('/settings/profile', profile);
      toast.success('Profile updated!');
      setSaved(v => ({ ...v, profile: true }));
      setTimeout(() => setSaved(v => ({ ...v, profile: false })), 2000);
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setSaving(v => ({ ...v, profile: false })); }
  };

  const savePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwords.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    setSaving(v => ({ ...v, password: true }));
    try {
      await api.put('/settings/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Password change failed'); }
    finally { setSaving(v => ({ ...v, password: false })); }
  };

  const TABS = [
    { key: 'store',    label: '🏪 Store',         icon: <FiGlobe /> },
    { key: 'delivery', label: '🚚 Delivery',       icon: <FiTruck /> },
    { key: 'payment',  label: '💳 Payment',        icon: <FiCreditCard /> },
    { key: 'notify',   label: '🔔 Notifications',  icon: <FiBell /> },
    { key: 'social',   label: '🌐 Social Links',   icon: <FiGlobe /> },
    { key: 'profile',  label: '👤 My Profile',     icon: <FiUser /> },
    { key: 'security', label: '🔒 Security',       icon: <FiLock /> },
  ];

  return (
    <div className="admin-layout">
      <Helmet><title>Settings — Admin Dashboard</title></Helmet>
      <AdminSidebar open={sidebar} onClose={() => setSidebar(false)} />

      <div className="admin-content">
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebar(true)} id="admin-settings-menu"><FiMenu /></button>
          <div>
            <h1 className="admin-page-title"><FiSettings style={{ marginRight: 8 }} />Settings</h1>
            <p className="admin-page-subtitle">Manage your store configuration</p>
          </div>
        </div>

        <div className="admin-body">
          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F3F4F6', borderRadius: 12, padding: 4, overflowX: 'auto', flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', background: activeTab === t.key ? 'white' : 'transparent', color: activeTab === t.key ? 'var(--pink-600)' : 'var(--muted)', boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>Loading settings...</div>
          ) : (
            <AnimatePresence mode="wait">
              {/* ── STORE ── */}
              {activeTab === 'store' && (
                <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Section icon={<FiGlobe />} title="Store Information">
                    <div className="admin-form-grid">
                      <Field label="Store Name" id="store-name" value={store.name} onChange={e => setStore({...store, name: e.target.value})} />
                      <Field label="Tagline" id="store-tagline" value={store.tagline} onChange={e => setStore({...store, tagline: e.target.value})} />
                      <Field label="Contact Email" id="store-email" type="email" value={store.email} onChange={e => setStore({...store, email: e.target.value})} />
                      <Field label="Contact Phone" id="store-phone" value={store.phone} onChange={e => setStore({...store, phone: e.target.value})} />
                      <div className="admin-form-group full-width">
                        <label>Address</label>
                        <textarea className="input" rows={2} style={{ resize: 'vertical' }} value={store.address || ''} onChange={e => setStore({...store, address: e.target.value})} />
                      </div>
                      <div className="admin-form-group">
                        <label>Currency</label>
                        <select className="input" value={store.currency} onChange={e => setStore({...store, currency: e.target.value})} id="store-currency">
                          <option value="PKR">PKR — Pakistani Rupee</option>
                          <option value="USD">USD — US Dollar</option>
                          <option value="AED">AED — UAE Dirham</option>
                        </select>
                      </div>
                      <Field label="Currency Symbol" id="store-symbol" value={store.currencySymbol} onChange={e => setStore({...store, currencySymbol: e.target.value})} placeholder="Rs." />
                    </div>
                    <SaveBtn onClick={() => save('store', store)} saving={saving.store} saved={saved.store} />
                  </Section>
                </motion.div>
              )}

              {/* ── DELIVERY ── */}
              {activeTab === 'delivery' && (
                <motion.div key="delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Section icon={<FiTruck />} title="Delivery & Shipping">
                    <div className="admin-form-grid">
                      <Field label="Free Delivery Threshold (Rs.)" id="free-del" type="number" value={delivery.freeDeliveryThreshold}
                        onChange={e => setDelivery({...delivery, freeDeliveryThreshold: e.target.value})}
                        hint="Orders above this amount get free delivery" />
                      <Field label="Standard Delivery Fee (Rs.)" id="std-fee" type="number" value={delivery.standardFee}
                        onChange={e => setDelivery({...delivery, standardFee: e.target.value})} />
                      <Field label="Estimated Delivery Days" id="est-days" value={delivery.estimatedDays}
                        onChange={e => setDelivery({...delivery, estimatedDays: e.target.value})} placeholder="3–5" />
                      <Field label="Express Delivery Days" id="exp-days" value={delivery.expressEstimatedDays}
                        onChange={e => setDelivery({...delivery, expressEstimatedDays: e.target.value})} placeholder="1–2" />
                    </div>
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16, marginTop: 4 }}>
                      <Toggle label="Cash on Delivery (COD) Available" id="cod-toggle"
                        checked={delivery.codAvailable} onChange={v => setDelivery({...delivery, codAvailable: v})} />
                      {delivery.codAvailable && (
                        <div style={{ marginTop: 12 }}>
                          <Field label="COD Extra Fee (Rs.)" id="cod-fee" type="number" value={delivery.codFee}
                            onChange={e => setDelivery({...delivery, codFee: e.target.value})} hint="Extra charge for COD orders (0 = free COD)" />
                        </div>
                      )}
                    </div>
                    <SaveBtn onClick={() => save('delivery', delivery)} saving={saving.delivery} saved={saved.delivery} />
                  </Section>
                </motion.div>
              )}

              {/* ── PAYMENT ── */}
              {activeTab === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Section icon={<FiCreditCard />} title="Payment Accounts">
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20, background: '#FEF3C7', padding: '10px 14px', borderRadius: 8 }}>
                      ⚠️ These details appear in the order payment instructions shown to customers.
                    </p>
                    <div className="admin-form-grid">
                      <Field label="Easypaisa Account Number" id="easy-num" value={payment.easypaisaNumber}
                        onChange={e => setPayment({...payment, easypaisaNumber: e.target.value})} placeholder="0300 0000000" />
                      <Field label="JazzCash Account Number" id="jazz-num" value={payment.jazzcashNumber}
                        onChange={e => setPayment({...payment, jazzcashNumber: e.target.value})} placeholder="0300 0000000" />
                    </div>
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 20, marginTop: 4 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 12, color: 'var(--dark)' }}>🏦 Bank Transfer Details</p>
                      <div className="admin-form-grid">
                        <Field label="Bank Name" id="bank-name" value={payment.bankName} onChange={e => setPayment({...payment, bankName: e.target.value})} placeholder="e.g. HBL / Meezan" />
                        <Field label="Account Title" id="bank-title" value={payment.bankTitle} onChange={e => setPayment({...payment, bankTitle: e.target.value})} />
                        <Field label="Account Number / IBAN" id="bank-acc" value={payment.bankAccount} onChange={e => setPayment({...payment, bankAccount: e.target.value})} placeholder="PK00XXXX..." />
                      </div>
                    </div>
                    <SaveBtn onClick={() => save('payment', payment)} saving={saving.payment} saved={saved.payment} />
                  </Section>
                </motion.div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === 'notify' && (
                <motion.div key="notify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Section icon={<FiBell />} title="Email Notifications">
                    <Field label="Admin Notification Email" id="admin-email" type="email" value={notifications.adminEmail}
                      onChange={e => setNotif({...notifications, adminEmail: e.target.value})} hint="Receives new order alerts, low stock warnings, etc." />
                    <div style={{ marginTop: 20, borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--dark)', marginBottom: 12 }}>Customer Email Triggers</p>
                      <Toggle label="Send order confirmation email" id="notif-order" checked={notifications.orderConfirmation} onChange={v => setNotif({...notifications, orderConfirmation: v})} />
                      <Toggle label="Send shipment update email" id="notif-ship" checked={notifications.shipmentUpdate} onChange={v => setNotif({...notifications, shipmentUpdate: v})} />
                      <Toggle label="Send payment receipt email" id="notif-pay" checked={notifications.paymentReceipt} onChange={v => setNotif({...notifications, paymentReceipt: v})} />
                    </div>
                    <div style={{ marginTop: 20, borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--dark)', marginBottom: 12 }}>Admin Alerts</p>
                      <Toggle label="Low stock alert notifications" id="notif-stock" checked={notifications.lowStockAlert} onChange={v => setNotif({...notifications, lowStockAlert: v})} />
                      {notifications.lowStockAlert && (
                        <div style={{ marginTop: 12 }}>
                          <Field label="Low Stock Threshold (units)" id="stock-thresh" type="number" value={notifications.lowStockThreshold}
                            onChange={e => setNotif({...notifications, lowStockThreshold: e.target.value})} hint="Alert when stock falls at or below this number" />
                        </div>
                      )}
                    </div>
                    <SaveBtn onClick={() => save('notifications', notifications)} saving={saving.notifications} saved={saved.notifications} />
                  </Section>
                </motion.div>
              )}

              {/* ── SOCIAL ── */}
              {activeTab === 'social' && (
                <motion.div key="social" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Section icon={<FiGlobe />} title="Social Media Links">
                    <p style={{ fontSize: '0.83rem', color: 'var(--muted)', marginBottom: 20 }}>These links appear in your store footer and contact page.</p>
                    <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                      <Field label="📸 Instagram URL" id="social-ig" value={social.instagram} onChange={e => setSocial({...social, instagram: e.target.value})} placeholder="https://instagram.com/yourhandle" />
                      <Field label="👥 Facebook URL" id="social-fb" value={social.facebook} onChange={e => setSocial({...social, facebook: e.target.value})} placeholder="https://facebook.com/yourpage" />
                      <Field label="📱 WhatsApp Number" id="social-wa" value={social.whatsapp} onChange={e => setSocial({...social, whatsapp: e.target.value})} placeholder="+92 300 0000000" hint="International format with +92" />
                      <Field label="🎵 TikTok URL" id="social-tt" value={social.tiktok} onChange={e => setSocial({...social, tiktok: e.target.value})} placeholder="https://tiktok.com/@yourhandle" />
                    </div>
                    <SaveBtn onClick={() => save('social', social)} saving={saving.social} saved={saved.social} />
                  </Section>
                </motion.div>
              )}

              {/* ── PROFILE ── */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Section icon={<FiUser />} title="My Admin Profile">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px 20px', background: 'var(--pink-50)', borderRadius: 12 }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--pink-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'var(--pink-700)', fontWeight: 700 }}>
                        {profile.name?.[0]?.toUpperCase() || '👤'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '1rem' }}>{profile.name || 'Admin'}</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{authUser?.email} · Role: {authUser?.role}</p>
                        <span style={{ background: '#D1FAE5', color: '#059669', padding: '2px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>✓ Verified Account</span>
                      </div>
                    </div>
                    <div className="admin-form-grid">
                      <Field label="Full Name" id="profile-name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                      <Field label="Phone Number" id="profile-phone" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+92 300 0000000" />
                    </div>
                    <SaveBtn onClick={saveProfile} saving={saving.profile} saved={saved.profile} />
                  </Section>
                </motion.div>
              )}

              {/* ── SECURITY ── */}
              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Section icon={<FiLock />} title="Change Password">
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '0.82rem', color: '#065F46' }}>
                      🔐 Use a strong password with at least 8 characters, numbers, and symbols.
                    </div>
                    <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                      <Field label="Current Password" id="cur-pass" type="password" value={passwords.currentPassword}
                        onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
                      <Field label="New Password" id="new-pass" type="password" value={passwords.newPassword}
                        onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                        hint="Minimum 8 characters" />
                      <Field label="Confirm New Password" id="conf-pass" type="password" value={passwords.confirmPassword}
                        onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
                    </div>
                    {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                      <p style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: 8 }}>⚠️ Passwords do not match</p>
                    )}
                    <SaveBtn onClick={savePassword} saving={saving.password} saved={saved.password} />
                  </Section>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
