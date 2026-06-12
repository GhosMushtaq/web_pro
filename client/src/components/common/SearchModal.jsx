import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { closeSearch } from '../../store/slices/uiSlice';
import { setFilters } from '../../store/slices/productSlice';

export default function SearchModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchOpen } = useSelector(s => s.ui);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') dispatch(closeSearch());
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(setFilters({ search: query.trim() }));
      dispatch(closeSearch());
      navigate('/shop');
    }
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '15vh'
          }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => dispatch(closeSearch())}
        >
          <motion.div
            style={{ width: '90%', maxWidth: 640, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #F3F4F6' }}>
              <FiSearch style={{ color: '#EC4899', fontSize: '1.5rem', marginRight: 16 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for gifts, collections..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.25rem', color: '#111827', background: 'transparent' }}
                id="global-search-input"
              />
              <button type="button" onClick={() => dispatch(closeSearch())} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', padding: 8 }}>
                <FiX style={{ fontSize: '1.5rem' }} />
              </button>
            </form>
            <div style={{ padding: '16px 24px', background: '#FDF2F8', fontSize: '0.85rem', color: '#9D174D', fontWeight: 600 }}>
              Hit Enter to search products
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
