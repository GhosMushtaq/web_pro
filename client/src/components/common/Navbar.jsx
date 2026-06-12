import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag, FiSearch, FiUser, FiHeart, FiMenu, FiX,
  FiChevronDown, FiLogOut, FiPackage, FiGrid, FiMessageSquare
} from 'react-icons/fi';
import { HiOutlineGift } from 'react-icons/hi';
import { selectCartCount, toggleCart } from '../../store/slices/cartSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSearch, toggleMobileMenu, closeMobileMenu } from '../../store/slices/uiSlice';
import toast from 'react-hot-toast';
import './Navbar.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount);
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const { mobileMenuOpen } = useSelector(s => s.ui);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
    setUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    const roleMap = { admin: '/admin', finance: '/finance', staff: '/staff', support: '/support' };
    return roleMap[user.role] || '/dashboard';
  };

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => dispatch(closeMobileMenu())}>
          <HiOutlineGift className="logo-icon" />
          <div className="logo-text">
            <span className="logo-name">Gifting Bliss</span>
            <span className="logo-tagline">Gifts from the Heart</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          <NavLink to="/" end className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
          <NavLink to="/shop" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Shop</NavLink>
          <NavLink to="/collections" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Collections</NavLink>
          <NavLink to="/about" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>About</NavLink>
          <NavLink to="/contact" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Contact</NavLink>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="nav-icon-btn" onClick={() => dispatch(toggleSearch())} title="Search" id="nav-search-btn">
            <FiSearch />
          </button>

          {isAuthenticated && (
            <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
              <FiHeart />
            </Link>
          )}

          <button className="nav-icon-btn cart-btn" onClick={() => dispatch(toggleCart())} title="Cart" id="nav-cart-btn">
            <FiShoppingBag />
            {cartCount > 0 && (
              <motion.span
                className="cart-badge"
                key={cartCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="user-menu-wrapper">
              <button className="user-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)} id="nav-user-btn">
                {user?.avatar?.url
                  ? <img src={user.avatar.url} alt={user.name} className="user-avatar" />
                  : <div className="user-avatar-placeholder">{user?.name?.[0]?.toUpperCase()}</div>
                }
                <FiChevronDown className={`chevron ${userMenuOpen ? 'open' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="user-dropdown"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user?.name}</p>
                      <span className="dropdown-role">{user?.role}</span>
                    </div>
                    <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FiGrid /> Dashboard
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FiPackage /> My Orders
                    </Link>
                    <Link to="/my-tickets" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FiMessageSquare /> My Tickets
                    </Link>
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FiUser /> My Profile
                    </Link>
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <FiLogOut /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="mobile-menu-btn hide-desktop" onClick={() => dispatch(toggleMobileMenu())} id="nav-mobile-menu-btn">
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <NavLink to="/" end onClick={() => dispatch(closeMobileMenu())} className="mobile-nav-link">Home</NavLink>
            <NavLink to="/shop" onClick={() => dispatch(closeMobileMenu())} className="mobile-nav-link">Shop</NavLink>
            <NavLink to="/collections" onClick={() => dispatch(closeMobileMenu())} className="mobile-nav-link">Collections</NavLink>
            <NavLink to="/about" onClick={() => dispatch(closeMobileMenu())} className="mobile-nav-link">About</NavLink>
            <NavLink to="/contact" onClick={() => dispatch(closeMobileMenu())} className="mobile-nav-link">Contact</NavLink>
            {!isAuthenticated && (
              <div className="mobile-auth-btns">
                <Link to="/login" className="btn btn-secondary" onClick={() => dispatch(closeMobileMenu())}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => dispatch(closeMobileMenu())}>Sign Up</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
