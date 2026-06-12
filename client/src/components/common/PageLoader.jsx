import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineGift } from 'react-icons/hi';
import './PageLoader.css';

export default function PageLoader({ fullScreen = true }) {
  return (
    <motion.div
      className={`page-loader ${fullScreen ? 'fullscreen' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="loader-content">
        <motion.div
          className="loader-icon"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <HiOutlineGift />
        </motion.div>
        <div className="loader-spinner"></div>
        <p className="loader-text">Gifting Bliss</p>
      </div>
    </motion.div>
  );
}
