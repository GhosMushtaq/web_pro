import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { HiOutlineGift } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import './Auth.css';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userId = location.state?.userId;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return toast.error('Please enter the complete 6-digit OTP');
    setLoading(true);
    try {
      const data = await authService.verifyOTP({ userId, otp: otpString });
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success('Email verified! Welcome to Gifting Bliss 🎁');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendOTP(userId);
      toast.success('New OTP sent to your email');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Verify Email — Gifting Bliss</title></Helmet>
      <motion.div className="auth-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo"><HiOutlineGift className="auth-logo-icon" /><span>Gifting Bliss</span></Link>
            <div className="otp-icon">📧</div>
            <h1 className="auth-title">Verify Your Email</h1>
            <p className="auth-subtitle">We've sent a 6-digit code to your email. Enter it below.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="otp-inputs">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`otp-input ${digit ? 'filled' : ''}`}
                  value={digit}
                  onChange={e => handleChange(e.target.value, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  id={`otp-${i}`}
                />
              ))}
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="verify-otp-btn">
              {loading ? <div className="btn-loader" /> : 'Verify Email'}
            </button>
          </form>

          <p className="auth-switch">
            Didn't receive the code? <button className="resend-btn" onClick={handleResend}>Resend OTP</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
