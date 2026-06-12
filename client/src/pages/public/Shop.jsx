import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setFilters } from '../../store/slices/productSlice';
import { collectionService } from '../../services';
import ProductCard from '../../components/shop/ProductCard';
import './Shop.css';

export default function Shop() {
  const dispatch = useDispatch();
  const { items, total, page, pages, loading, filters } = useSelector(s => s.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [collections, setCollections] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    collectionService.getAll({ active: 'true' }).then(d => setCollections(d.collections || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const params = { ...filters, page: searchParams.get('page') || 1 };
    dispatch(fetchProducts(params));
  }, [filters]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleSearch = () => handleFilterChange('search', localSearch);

  const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Top Rated' },
  ];

  return (
    <div className="shop-page">
      <Helmet>
        <title>Shop All Gifts — Gifting Bliss</title>
        <meta name="description" content="Browse thousands of premium gifts. Filter by collection, price, and rating. Fast delivery across Pakistan." />
      </Helmet>

      {/* Shop Header */}
      <div className="shop-header">
        <div className="container">
          <h1>🛍️ Shop All Gifts</h1>
          <p>Discover the perfect gift from our curated collection of {total}+ products</p>
        </div>
      </div>

      <div className="container shop-layout">
        {/* Sidebar Filter */}
        <aside className={`shop-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>🔍 Filters</h3>
            <button className="sidebar-close hide-desktop" onClick={() => setSidebarOpen(false)}><FiX /></button>
          </div>

          {/* Search */}
          <div className="filter-group">
            <label>Search</label>
            <div className="search-input-group">
              <input
                type="text"
                className="input"
                placeholder="Search gifts..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                id="shop-search-input"
              />
              <button className="search-btn" onClick={handleSearch}><FiSearch /></button>
            </div>
          </div>

          {/* Collections */}
          <div className="filter-group">
            <label>Collection</label>
            <div className="collection-filter-list">
              <button
                className={`filter-option ${!filters.collection ? 'active' : ''}`}
                onClick={() => handleFilterChange('collection', '')}
              >All Collections</button>
              {collections.map(c => (
                <button
                  key={c._id}
                  className={`filter-option ${filters.collection === c._id ? 'active' : ''}`}
                  onClick={() => handleFilterChange('collection', c._id)}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label>Price Range (Rs.)</label>
            <div className="price-inputs">
              <input type="number" className="input" placeholder="Min" value={filters.minPrice} onChange={e => handleFilterChange('minPrice', e.target.value)} id="filter-min-price" />
              <span>–</span>
              <input type="number" className="input" placeholder="Max" value={filters.maxPrice} onChange={e => handleFilterChange('maxPrice', e.target.value)} id="filter-max-price" />
            </div>
          </div>

          {/* Rating */}
          <div className="filter-group">
            <label>Min. Rating</label>
            <div className="rating-filter">
              {[4, 3, 2, 1].map(r => (
                <button
                  key={r}
                  className={`filter-option ${filters.rating === String(r) ? 'active' : ''}`}
                  onClick={() => handleFilterChange('rating', filters.rating === String(r) ? '' : String(r))}
                >
                  {'⭐'.repeat(r)} & up
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-secondary clear-filters" onClick={() => dispatch({ type: 'products/clearFilters' })}>
            Clear All Filters
          </button>
        </aside>

        {/* Products Area */}
        <div className="shop-content">
          {/* Top Bar */}
          <div className="shop-topbar">
            <div className="shop-topbar-left">
              <button className="btn btn-secondary btn-sm filter-toggle hide-desktop" onClick={() => setSidebarOpen(true)}>
                <FiFilter /> Filters
              </button>
              <p className="results-count">
                {loading ? 'Loading...' : `${total} gifts found`}
              </p>
            </div>
            <div className="shop-topbar-right">
              <select
                className="sort-select"
                value={filters.sort}
                onChange={e => handleFilterChange('sort', e.target.value)}
                id="shop-sort-select"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="products-skeleton">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton" style={{ height: 240 }} />
                  <div className="skeleton" style={{ height: 16, marginTop: 12 }} />
                  <div className="skeleton" style={{ height: 12, marginTop: 8, width: '60%' }} />
                  <div className="skeleton" style={{ height: 20, marginTop: 8, width: '40%' }} />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="no-products">
              <div>🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <motion.div
              className="products-grid"
              initial="initial"
              animate="animate"
              variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
            >
              {items.map(product => <ProductCard key={product._id} product={product} />)}
            </motion.div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => dispatch(fetchProducts({ ...filters, page: i + 1 }))}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
