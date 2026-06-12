import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { HiOutlineGift } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError, clearRegisterSuccess } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success('Account created successfully! 🎁');
      const roleRoutes = { admin: '/admin', finance: '/finance', staff: '/staff/portal', support: '/support' };
      navigate(roleRoutes[user.role] || '/dashboard');
    }
  }, [isAuthenticated, user]);

  useEffect(() => { return () => dispatch(clearError()); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    dispatch(registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password }));
  };

  return (
    <div className="auth-page">
      <Helmet><title>Create Account — Gifting Bliss</title></Helmet>

      <motion.div className="auth-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo"><HiOutlineGift className="auth-logo-icon" /><span>Gifting Bliss</span></Link>
            <h1 className="auth-title">Create Account 🎁</h1>
            <p className="auth-subtitle">Join us and discover beautiful gifts</p>
          </div>

          {error && <motion.div className="auth-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>⚠️ {error}</motion.div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-name">Full Name</label>
                <div className="input-group">
                  <FiUser className="input-icon" />
                  <input id="reg-name" type="text" className="input" placeholder="Your full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-phone">Phone Number</label>
                <div className="input-group">
                  <FiPhone className="input-icon" />
                  <input id="reg-phone" type="tel" className="input" placeholder="+92 300 0000000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="input-group">
                <FiMail className="input-icon" />
                <input id="reg-email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-group">
                  <FiLock className="input-icon" />
                  <input id="reg-password" type={showPass ? 'text' : 'password'} className="input" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? <FiEyeOff /> : <FiEye />}</button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <div className="input-group">
                  <FiLock className="input-icon" />
                  <input id="reg-confirm" type="password" className="input" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="register-submit-btn">
              {loading ? <div className="btn-loader" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in 💕</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
