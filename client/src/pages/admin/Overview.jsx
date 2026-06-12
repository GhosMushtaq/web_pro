import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiBarChart2,
  FiSettings, FiTag, FiStar, FiDollarSign, FiLogOut,
  FiMenu, FiX, FiList, FiHome, FiTruck
} from 'react-icons/fi';
import { HiOutlineGift } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { statsService } from '../../services';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const NAV_ITEMS = [
  { path: '/admin', icon: FiGrid, label: 'Overview', exact: true },
  { path: '/admin/orders', icon: FiPackage, label: 'Orders' },
  { path: '/admin/products', icon: FiShoppingBag, label: 'Products' },
  { path: '/admin/collections', icon: FiList, label: 'Collections' },
  { path: '/admin/users', icon: FiUsers, label: 'Users' },
  { path: '/admin/staff', icon: FiUsers, label: 'Staff Management' },
  { path: '/admin/suppliers', icon: FiTruck, label: 'Supplier Management' },
  { path: '/admin/coupons', icon: FiTag, label: 'Coupons' },
  { path: '/admin/reviews', icon: FiStar, label: 'Reviews' },
  { path: '/admin/reports', icon: FiBarChart2, label: 'Reports' },
  { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
];

function AdminSidebar({ open, onClose }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <>
      <div className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-sidebar-logo">
            <HiOutlineGift />
            <span>Gifting Bliss</span>
          </Link>
          <button className="sidebar-mobile-close" onClick={onClose}><FiX /></button>
        </div>

        <div className="admin-user-card">
          <div className="admin-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className={`admin-nav-item ${active ? 'active' : ''}`}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item"><FiHome /><span>View Store</span></Link>
          <button className="admin-nav-item danger" onClick={handleLogout}><FiLogOut /><span>Logout</span></button>
        </div>
      </div>
      {open && <div className="admin-sidebar-overlay" onClick={onClose} />}
    </>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsService.getDashboard()
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const KPI_CARDS = stats ? [
    { label: 'Total Revenue', value: `Rs. ${stats.revenue?.total?.toLocaleString() || 0}`, growth: `+${stats.revenue?.growth || 0}%`, icon: '💰', color: 'pink' },
    { label: 'Total Orders', value: stats.orders?.total?.toLocaleString() || 0, sub: `${stats.orders?.pending} pending`, icon: '📦', color: 'blue' },
    { label: 'Customers', value: stats.customers?.total?.toLocaleString() || 0, sub: `+${stats.customers?.newThisMonth} this month`, icon: '👥', color: 'green' },
    { label: 'Products', value: stats.products?.total?.toLocaleString() || 0, sub: `${stats.products?.lowStock} low stock`, icon: '🛍️', color: 'gold' },
    { label: 'This Month Revenue', value: `Rs. ${stats.revenue?.thisMonth?.toLocaleString() || 0}`, sub: 'vs last month', icon: '📈', color: 'pink' },
    { label: 'Open Tickets', value: stats.support?.openTickets || 0, sub: 'need attention', icon: '🎫', color: 'red' },
  ] : [];

  return (
    <div className="admin-layout">
      <Helmet><title>Admin Dashboard — Gifting Bliss</title></Helmet>

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-content">
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)} id="admin-menu-btn">
            <FiMenu />
          </button>
          <div>
            <h1 className="admin-page-title">Dashboard Overview</h1>
            <p className="admin-page-subtitle">Welcome back! Here's what's happening with Gifting Bliss.</p>
          </div>
          <div className="admin-topbar-actions">
            <Link to="/shop" className="btn btn-secondary btn-sm">View Store</Link>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, padding: 24 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
          </div>
        ) : (
          <div className="admin-body">
            {/* KPI Cards */}
            <div className="kpi-grid">
              {KPI_CARDS.map((card, i) => (
                <motion.div
                  key={card.label}
                  className={`kpi-card kpi-${card.color}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="kpi-icon">{card.icon}</div>
                  <div className="kpi-info">
                    <p className="kpi-label">{card.label}</p>
                    <div className="kpi-value">{card.value}</div>
                    {card.sub && <span className="kpi-sub">{card.sub}</span>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h3 className="section-heading">Quick Actions</h3>
              <div className="quick-actions-grid">
                {[
                  { label: 'Add Product', to: '/admin/products', icon: '➕', desc: 'Create new product listing' },
                  { label: 'Manage Orders', to: '/admin/orders', icon: '📦', desc: 'Review pending orders' },
                  { label: 'View Reports', to: '/admin/reports', icon: '📊', desc: 'Analytics & insights' },
                  { label: 'Manage Staff', to: '/admin/staff', icon: '👥', desc: 'Add or manage team members' },
                ].map(action => (
                  <Link key={action.to} to={action.to} className="quick-action-card">
                    <div className="qa-icon">{action.icon}</div>
                    <div>
                      <strong>{action.label}</strong>
                      <p>{action.desc}</p>
                    </div>
                    <span className="qa-arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { AdminSidebar, NAV_ITEMS };
