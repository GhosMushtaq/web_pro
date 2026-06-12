import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiMail } from 'react-icons/fi';
import { HiOutlineGift } from 'react-icons/hi';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Forgot Password — Gifting Bliss</title></Helmet>
      <motion.div className="auth-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo"><HiOutlineGift className="auth-logo-icon" /><span>Gifting Bliss</span></Link>
            <h1 className="auth-title">Forgot Password? 🔐</h1>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
          </div>

          {sent ? (
            <div className="auth-success">
              <div className="success-icon">📧</div>
              <h3>Email Sent!</h3>
              <p>Check your inbox for the password reset link. It expires in 1 hour.</p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Login</Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="forgot-email">Email Address</label>
                <div className="input-group">
                  <FiMail className="input-icon" />
                  <input id="forgot-email" type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? <div className="btn-loader" /> : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
