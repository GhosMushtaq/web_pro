import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { HiOutlineGift } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes = { admin: '/admin', finance: '/finance', staff: '/staff/portal', support: '/support' };
      navigate(roleRoutes[user.role] || '/dashboard');
    }
  }, [isAuthenticated, user]);

  useEffect(() => { return () => dispatch(clearError()); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    const result = await dispatch(loginUser(form));
    if (!result.error) {
      toast.success(`Welcome back! 🎁`);
    }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Login — Gifting Bliss</title></Helmet>

      <div className="auth-decoration">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="auth-particle" style={{ left: `${15 + i * 14}%`, animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <HiOutlineGift className="auth-logo-icon" />
              <span>Gifting Bliss</span>
            </Link>
            <h1 className="auth-title">Welcome Back! 💕</h1>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              ⚠️ {error}
            </motion.div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-group">
                <FiMail className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  autoComplete="current-password"
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="login-submit-btn">
              {loading ? <div className="btn-loader" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one 🎁</Link>
          </p>

          {/* Demo credentials notice */}
          <div className="demo-notice">
            <p>🔑 Admin Demo: admin@giftingbliss.com / Admin@GiftingBliss123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
