import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { HiOutlineGift } from 'react-icons/hi';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import './Auth.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Reset Password — Gifting Bliss</title></Helmet>
      <motion.div className="auth-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo"><HiOutlineGift className="auth-logo-icon" /><span>Gifting Bliss</span></Link>
            <h1 className="auth-title">Set New Password 🔐</h1>
            <p className="auth-subtitle">Choose a strong password for your account.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <div className="input-group">
                <FiLock className="input-icon" />
                <input id="new-password" type={showPass ? 'text' : 'password'} className="input" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? <FiEyeOff /> : <FiEye />}</button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="input-group">
                <FiLock className="input-icon" />
                <input id="confirm-password" type="password" className="input" placeholder="Repeat password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <div className="btn-loader" /> : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
