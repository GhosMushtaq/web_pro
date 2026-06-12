import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import api from '../../services/api';

function fmt(n) { return 'Rs. ' + Number(n || 0).toLocaleString('en-PK'); }

function BarChart({ data, valueKey, labelKey, color = '#EC4899' }) {
  if (!data?.length) return <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>No data yet</p>;
  const max = Math.max(...data.map(d => d[valueKey] || 0)) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingBottom: 24, position: 'relative' }}>
      {data.map((d, i) => {
        const h = Math.round(((d[valueKey] || 0) / max) * 100);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
            title={d[labelKey] + ': ' + fmt(d[valueKey])}>
            <motion.div initial={{ height: 0 }} animate={{ height: h }}
              transition={{ delay: i * 0.05 }}
              style={{ width: '100%', background: color, borderRadius: '4px 4px 0 0', minHeight: 2 }} />
            <span style={{ position: 'absolute', bottom: 0, fontSize: '0.6rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function FinanceReports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats]     = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [payMethods, setPay]  = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [s, r, p] = await Promise.all([
        api.get('/stats/finance'),
        api.get('/stats/revenue-chart'),
        api.get('/stats/payment-methods'),
      ]);
      setStats(s.data);
      setRevenue(r.data.data || []);
      setPay(p.data.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>Reports — Finance Panel</title></Helmet>

      <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>📊 Finance Reports</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>Live financial analytics</p>
        </div>
        <button onClick={load} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div style={{ padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#9CA3AF' }}>Loading financial data...</div>
        ) : (
          <>
            {/* KPI Cards */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
                {[
                  { icon: '💰', label: 'Total Verified Revenue', value: fmt(stats.totalVerified), color: '#059669', bg: '#D1FAE5' },
                  { icon: '⏳', label: 'Pending Verification', value: stats.pendingVerification, color: '#D97706', bg: '#FEF3C7' },
                  { icon: '✅', label: 'Verified Today', value: stats.verifiedToday, color: '#2563EB', bg: '#DBEAFE' },
                  { icon: '❌', label: 'Total Rejected', value: stats.rejectedTotal, color: '#DC2626', bg: '#FEE2E2' },
                ].map(s => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: s.bg, borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Revenue Chart */}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <FiTrendingUp style={{ color: '#EC4899' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>Monthly Revenue Trend</h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 16 }}>Last 12 months (verified payments)</p>
                <BarChart data={revenue} valueKey="revenue" labelKey="month" color="#EC4899" />
              </div>

              {/* Orders per month */}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>Order Volume</h3>
                <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 16 }}>Total orders per month</p>
                <BarChart data={revenue} valueKey="orders" labelKey="month" color="#8B5CF6" />
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: 16 }}>💳 Revenue by Payment Method</h3>
              {payMethods.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>No payment data yet</p>
              ) : (
                <>
                  {/* by Payment Method Bars */}
                  {stats?.byMethod && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                      {[
                        { key: 'easypaisa', icon: '🟣', label: 'Easypaisa' },
                        { key: 'jazzcash',  icon: '🔴', label: 'JazzCash'  },
                        { key: 'cod',       icon: '💵', label: 'COD'       },
                      ].map(m => (
                        <div key={m.key} style={{ background: '#F9FAFB', borderRadius: 10, padding: '16px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                          <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{m.icon}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: 4 }}>{m.label}</div>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1F2937' }}>{fmt(stats.byMethod[m.key])}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}>Method</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}>Transactions</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payMethods.map(p => (
                          <tr key={p.method} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '10px 12px', textTransform: 'capitalize', fontWeight: 600 }}>{p.method?.replace('_', ' ')}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#6B7280' }}>{p.count}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>{fmt(p.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
