import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineGift } from 'react-icons/hi';
import {
  FiInstagram, FiFacebook, FiTwitter, FiMail, FiPhone, FiMapPin
} from 'react-icons/fi';
import './Footer.css';

const collections = ['Birthday Bliss', 'For Her', 'Luxury Gift Boxes', 'Valentine\'s Day', 'Eid Mubarak', 'Personalized Gifts'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-particles">
        {[...Array(8)].map((_, i) => <div key={i} className="particle" style={{ left: `${10 + i * 12}%`, animationDelay: `${i * 0.5}s` }} />)}
      </div>

      <div className="container footer-content">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <HiOutlineGift className="footer-logo-icon" />
            <span className="footer-logo-name">Gifting Bliss</span>
          </Link>
          <p className="footer-desc">
            Premium gifts that speak from the heart. Curated collections for every occasion, delivered with love across Pakistan.
          </p>
          <div className="social-links">
            <a href="#" className="social-btn" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" className="social-btn" aria-label="Facebook"><FiFacebook /></a>
            <a href="#" className="social-btn" aria-label="Twitter"><FiTwitter /></a>
          </div>
        </div>

        {/* Collections */}
        <div className="footer-col">
          <h4 className="footer-heading">Collections</h4>
          <ul className="footer-links">
            {collections.map(c => (
              <li key={c}>
                <Link to={`/collections/${c.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}`}>
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/contact-support">Help & Support</Link></li>
            <li><Link to="/track-order">Track Order</Link></li>
            <li><Link to="/dashboard">My Account</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4 className="footer-heading">Contact</h4>
          <ul className="footer-contact-list">
            <li><FiMapPin /> Lahore, Punjab, Pakistan</li>
            <li><FiPhone /> +92 300 0000000</li>
            <li><FiMail /> hello@giftingbliss.com</li>
          </ul>
          <div className="payment-methods">
            <h4 className="footer-heading" style={{marginTop: 20}}>Payment We Accept</h4>
            <div className="payment-badges">
              <span className="payment-badge">💚 EasyPaisa</span>
              <span className="payment-badge">🟠 JazzCash</span>
              <span className="payment-badge">💵 COD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>© {new Date().getFullYear()} Gifting Bliss. Made with 💕 in Pakistan.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/refunds">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
