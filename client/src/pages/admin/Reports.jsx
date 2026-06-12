import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AdminSidebar } from './Overview';
import {
  FiMenu, FiRefreshCw, FiTrendingUp, FiTrendingDown,
  FiPackage, FiUsers, FiDollarSign, FiShoppingCart,
  FiPieChart, FiBarChart2, FiDownload
} from 'react-icons/fi';
import api from '../../services/api';
import './AdminDashboard.css';

/* ─── Helpers ─────────────────────────────────────────────── */
const fmt = n => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;
const pct = n => `${n >= 0 ? '+' : ''}${n}%`;

/* ─── Mini bar chart (pure CSS) ─────────────────────────── */
function BarChart({ data, valueKey = 'revenue', labelKey = 'month', color = 'var(--pink-400)' }) {
  if (!data?.length) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No data yet</div>;
  const max = Math.max(...data.map(d => d[valueKey] || 0)) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, paddingBottom: 24, position: 'relative' }}>
      {data.map((d, i) => {
        const h = Math.round(((d[valueKey] || 0) / max) * 120);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}
            title={`${d[labelKey]}: ${valueKey === 'revenue' ? fmt(d[valueKey]) : d[valueKey]}`}>
            <motion.div
              initial={{ height: 0 }} animate={{ height: h }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              style={{ width: '100%', background: color, borderRadius: '4px 4px 0 0', minHeight: 2, opacity: 0.85 + (i / data.length) * 0.15 }} />
            <span style={{ position: 'absolute', bottom: 0, fontSize: '0.62rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Donut chart (SVG) ──────────────────────────────────── */
const DONUT_COLORS = ['#EC4899', '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];
function DonutChart({ data, labelKey, valueKey }) {
  if (!data?.length) return <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>No data yet</div>;
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0) || 1;
  let cumPct = 0;
  const slices = data.map((d, i) => {
    const pctVal = (d[valueKey] || 0) / total;
    const start = cumPct; cumPct += pctVal;
    return { ...d, pct: pctVal, start, color: DONUT_COLORS[i % DONUT_COLORS.length] };
  });
  const arc = (pct, r = 40) => {
    const a = pct * 2 * Math.PI - Math.PI / 2;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
  };
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 100 100" style={{ width: 140, height: 140, flexShrink: 0 }}>
        {slices.map((s, i) => {
          if (s.pct < 0.001) return null;
          const [sx, sy] = arc(s.start);
          const [ex, ey] = arc(s.start + s.pct);
          const large = s.pct > 0.5 ? 1 : 0;
          return (
            <path key={i}
              d={`M50,50 L${sx},${sy} A40,40 0 ${large},1 ${ex},${ey} Z`}
              fill={s.color} stroke="white" strokeWidth="1" opacity={0.9}>
              <title>{s[labelKey]}: {valueKey === 'total' || valueKey === 'revenue' ? fmt(s[valueKey]) : s[valueKey]}</title>
            </path>
          );
        })}
        <circle cx="50" cy="50" r="24" fill="white" />
      </svg>
      <div style={{ flex: 1 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', flex: 1, color: 'var(--text)' }}>{s[labelKey]}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark)' }}>{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, growth, color = 'var(--pink-500)' }) {
  const up = growth >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '1.1rem' }}>
          {icon}
        </div>
        {growth !== undefined && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: up ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: 2 }}>
            {up ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />} {pct(growth)}
          </span>
        )}
      </div>
      <strong style={{ fontSize: '1.5rem', color: 'var(--dark)', display: 'block', lineHeight: 1.2 }}>{value}</strong>
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>{label}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{sub}</p>}
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function AdminReports() {
  const [sidebar, setSidebar]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue]     = useState([]);
  const [orderStatus, setOrderStatus]     = useState([]);
  const [topCollections, setTopCols]      = useState([]);
  const [paymentMethods, setPayMethods]   = useState([]);
  const [topProducts, setTopProducts]     = useState([]);
  const [financeStats, setFinance]        = useState(null);
  const [activeTab, setActiveTab]         = useState('overview');

  const load = async () => {
    setLoading(true);
    try {
      const [d, r, os, tc, pm, tp, fin] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/stats/revenue-chart'),
        api.get('/stats/order-status'),
        api.get('/stats/top-collections'),
        api.get('/stats/payment-methods'),
        api.get('/stats/top-products'),
        api.get('/stats/finance'),
      ]);
      setDashboard(d.data);
      setRevenue(r.data.data || []);
      setOrderStatus(os.data.data || []);
      setTopCols(tc.data.data || []);
      setPayMethods(pm.data.data || []);
      setTopProducts(tp.data.products || []);
      setFinance(fin.data);
    } catch (e) {
      console.error('Reports load error:', e);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const TABS = [
    { key: 'overview',  label: '📊 Overview' },
    { key: 'revenue',   label: '💰 Revenue' },
    { key: 'orders',    label: '📦 Orders' },
    { key: 'products',  label: '🎁 Products' },
    { key: 'finance',   label: '🧾 Finance' },
  ];

  return (
    <div className="admin-layout">
      <Helmet><title>Reports — Admin Dashboard</title></Helmet>
      <AdminSidebar open={sidebar} onClose={() => setSidebar(false)} />

      <div className="admin-content">
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebar(true)} id="admin-reports-menu"><FiMenu /></button>
          <div>
            <h1 className="admin-page-title"><FiBarChart2 style={{ marginRight: 8 }} />Reports & Analytics</h1>
            <p className="admin-page-subtitle">Live business intelligence from your store data</p>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={load} id="refresh-reports-btn">
              <FiRefreshCw style={{ marginRight: 4 }} />Refresh
            </button>
          </div>
        </div>

        <div className="admin-body">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F3F4F6', borderRadius: 12, padding: 4, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', background: activeTab === t.key ? 'white' : 'transparent', color: activeTab === t.key ? 'var(--pink-600)' : 'var(--muted)', boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12, animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>📊</div>
              <p style={{ color: 'var(--muted)' }}>Loading analytics data...</p>
            </div>
          ) : (
            <>
              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && dashboard && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
                    <StatCard icon={<FiDollarSign />} label="Total Revenue" value={fmt(dashboard.revenue?.total)} sub={`This month: ${fmt(dashboard.revenue?.thisMonth)}`} growth={dashboard.revenue?.growth} color="#EC4899" />
                    <StatCard icon={<FiShoppingCart />} label="Total Orders" value={dashboard.orders?.total} sub={`${dashboard.orders?.pending} pending`} color="#8B5CF6" />
                    <StatCard icon={<FiUsers />} label="Total Customers" value={dashboard.customers?.total} sub={`${dashboard.customers?.newThisMonth} new this month`} color="#06B6D4" />
                    <StatCard icon={<FiPackage />} label="Active Products" value={dashboard.products?.total} sub={`${dashboard.products?.lowStock} low stock`} color="#F59E0B" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--dark)' }}>📈 Revenue (12 months)</h3>
                      <BarChart data={revenue} valueKey="revenue" labelKey="month" color="var(--pink-400)" />
                    </div>
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--dark)' }}>🥧 Order Status</h3>
                      <DonutChart data={orderStatus} labelKey="status" valueKey="count" />
                    </div>
                  </div>
                </>
              )}

              {/* ── REVENUE TAB ── */}
              {activeTab === 'revenue' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
                    <StatCard icon={<FiDollarSign />} label="Total Revenue" value={fmt(dashboard?.revenue?.total)} color="#EC4899" />
                    <StatCard icon="📅" label="This Month" value={fmt(dashboard?.revenue?.thisMonth)} growth={dashboard?.revenue?.growth} color="#8B5CF6" />
                    <StatCard icon="📆" label="Last Month" value={fmt(dashboard?.revenue?.lastMonth)} color="#06B6D4" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: 4, color: 'var(--dark)' }}>Monthly Revenue Trend</h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 16 }}>Last 12 months</p>
                      <BarChart data={revenue} valueKey="revenue" labelKey="month" color="#EC4899" />
                    </div>
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: 4, color: 'var(--dark)' }}>Orders per Month</h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 16 }}>Order volume</p>
                      <BarChart data={revenue} valueKey="orders" labelKey="month" color="#8B5CF6" />
                    </div>
                  </div>

                  {/* Payment methods */}
                  <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--dark)' }}>💳 Revenue by Payment Method</h3>
                    {paymentMethods.length === 0
                      ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>No payment data yet</p>
                      : <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {paymentMethods.map((p, i) => (
                            <div key={i} style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 20px', minWidth: 160 }}>
                              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'capitalize', marginBottom: 4 }}>{p.method || 'Unknown'}</p>
                              <strong style={{ fontSize: '1.1rem', color: 'var(--dark)' }}>{fmt(p.total)}</strong>
                              <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{p.count} transactions</p>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                </>
              )}

              {/* ── ORDERS TAB ── */}
              {activeTab === 'orders' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
                    <StatCard icon={<FiShoppingCart />} label="Total Orders" value={dashboard?.orders?.total} color="#8B5CF6" />
                    <StatCard icon="⏳" label="Pending Orders" value={dashboard?.orders?.pending} color="#D97706" />
                    <StatCard icon="✅" label="Open Tickets" value={dashboard?.support?.openTickets} color="#EF4444" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>Order Status Breakdown</h3>
                      <DonutChart data={orderStatus} labelKey="status" valueKey="count" />
                    </div>
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>Top Collections by Revenue</h3>
                      {topCollections.length === 0
                        ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>No data yet</p>
                        : topCollections.slice(0, 6).map((c, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                              <span style={{ width: 20, height: 20, borderRadius: '50%', background: DONUT_COLORS[i % 6], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                              <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>{fmt(c.revenue)}</span>
                            </div>
                          ))
                      }
                    </div>
                  </div>
                </>
              )}

              {/* ── PRODUCTS TAB ── */}
              {activeTab === 'products' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 20 }}>
                    <StatCard icon={<FiPackage />} label="Active Products" value={dashboard?.products?.total} color="#F59E0B" />
                    <StatCard icon="⚠️" label="Low Stock Products" value={dashboard?.products?.lowStock} color="#EF4444" />
                  </div>

                  <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>🏆 Top Selling Products</h3>
                    {topProducts.length === 0
                      ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📦</div>
                          <p>No products with sales yet. Add products and receive orders to see data here.</p>
                        </div>
                      : <div className="admin-data-table">
                          <table>
                            <thead><tr><th>#</th><th>Product</th><th>Collection</th><th>Stock</th><th>Sold</th><th>Rating</th><th>Views</th></tr></thead>
                            <tbody>
                              {topProducts.map((p, i) => (
                                <tr key={p._id}>
                                  <td><strong style={{ color: 'var(--pink-600)' }}>#{i + 1}</strong></td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                      {p.images?.[0]?.url
                                        ? <img src={p.images[0].url} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                                        : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--pink-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎁</div>}
                                      <div>
                                        <strong style={{ fontSize: '0.85rem', display: 'block' }}>{p.name}</strong>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{fmt(p.price)}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{p.collection?.name || '—'}</td>
                                  <td>
                                    <span style={{ color: p.stock <= p.lowStockAlert ? '#DC2626' : '#059669', fontWeight: 600, fontSize: '0.85rem' }}>{p.stock}</span>
                                  </td>
                                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.soldCount || 0}</td>
                                  <td>⭐ {p.ratings?.average?.toFixed(1) || '—'} <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>({p.ratings?.count || 0})</span></td>
                                  <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{p.viewCount || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                    }
                  </div>
                </>
              )}

              {/* ── FINANCE TAB ── */}
              {activeTab === 'finance' && financeStats && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
                    <StatCard icon="⏳" label="Pending Verification" value={financeStats.pendingVerification} color="#D97706" />
                    <StatCard icon="✅" label="Verified Today" value={financeStats.verifiedToday} color="#059669" />
                    <StatCard icon="❌" label="Rejected Total" value={financeStats.rejectedTotal} color="#EF4444" />
                    <StatCard icon={<FiDollarSign />} label="Total Verified Revenue" value={fmt(financeStats.totalVerified)} color="#EC4899" />
                  </div>

                  <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>💳 Verified Revenue by Payment Method</h3>
                    {Object.keys(financeStats.byMethod || {}).length === 0
                      ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>No verified payments yet</p>
                      : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                          {Object.entries(financeStats.byMethod).map(([method, total], i) => (
                            <div key={method} style={{ background: '#F9FAFB', borderRadius: 10, padding: '20px 24px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>
                                {method === 'easypaisa' ? '🟣' : method === 'jazzcash' ? '🔴' : '💵'}
                              </div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'capitalize', marginBottom: 4 }}>{method}</p>
                              <strong style={{ fontSize: '1.2rem', color: 'var(--dark)' }}>{fmt(total)}</strong>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
