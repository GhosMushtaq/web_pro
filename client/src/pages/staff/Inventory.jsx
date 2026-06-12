import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiSearch, FiPlus, FiX, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ACTION_OPTS = [
  { value: 'restock',    label: '📦 Restock (add to stock)' },
  { value: 'adjustment', label: '🔧 Manual Adjustment (set exact)' },
  { value: 'damage',     label: '💔 Damage / Write-off (remove)' },
  { value: 'return',     label: '↩️ Customer Return (add back)' },
];

function AdjustModal({ products, onClose, onDone }) {
  const [productId, setProductId] = useState('');
  const [action, setAction]       = useState('restock');
  const [quantity, setQty]        = useState('');
  const [note, setNote]           = useState('');
  const [saving, setSaving]       = useState(false);

  const handleSave = async () => {
    if (!productId) return toast.error('Select a product');
    if (!quantity || Number(quantity) <= 0) return toast.error('Enter a valid quantity');
    setSaving(true);
    try {
      await api.post('/inventory/adjust', { productId, action, quantity: Number(quantity), note });
      toast.success('Stock adjusted!');
      onDone();
    } catch (e) { toast.error(e.response?.data?.message || 'Adjustment failed'); }
    finally { setSaving(false); }
  };

  const selected = products.find(p => p._id === productId);

  return (
    <motion.div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480 }}
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>📦 Adjust Stock</h3>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: '#374151' }}>Product *</label>
            <select value={productId} onChange={e => setProductId(e.target.value)} id="adjust-product"
              style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: '0.85rem' }}>
              <option value="">-- Select a product --</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>)}
            </select>
          </div>

          {selected && (
            <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: '#D1FAE5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selected.images?.[0]?.url ? <img src={selected.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎁'}
              </div>
              <div>
                <strong style={{ fontSize: '0.88rem' }}>{selected.name}</strong>
                <p style={{ fontSize: '0.78rem', color: '#6B7280' }}>Current stock: <strong style={{ color: selected.stock <= selected.lowStockAlert ? '#DC2626' : '#059669' }}>{selected.stock}</strong> · Alert at: {selected.lowStockAlert}</p>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: '#374151' }}>Action *</label>
            <select value={action} onChange={e => setAction(e.target.value)} id="adjust-action"
              style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: '0.85rem' }}>
              {ACTION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              {action === 'adjustment' ? 'New Stock Quantity *' : 'Quantity *'}
            </label>
            <input type="number" min="1" value={quantity} onChange={e => setQty(e.target.value)} id="adjust-qty"
              placeholder={action === 'adjustment' ? 'Set exact stock value' : 'Number of units'}
              style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: '#374151' }}>Note / Reason</label>
            <input value={note} onChange={e => setNote(e.target.value)} id="adjust-note"
              placeholder="e.g. supplier delivery, damaged in warehouse..."
              style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} id="save-adjustment-btn"
            style={{ flex: 1, background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 700 }}>
            {saving ? 'Saving...' : 'Apply Adjustment'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StaffInventory() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs]         = useState([]);
  const [overview, setOverview] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('products');
  const [search, setSearch]     = useState('');
  const [showAdjust, setAdjust] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, l, ov, ls] = await Promise.all([
        api.get('/products?limit=200'),
        api.get('/inventory?limit=50'),
        api.get('/inventory/overview'),
        api.get('/inventory/low-stock'),
      ]);
      setProducts(p.data.products || []);
      setLogs(l.data.logs || []);
      setOverview(ov.data);
      setLowStock(ls.data.products || []);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const searchedProducts = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const ACTION_COLORS = { restock: '#059669', adjustment: '#2563EB', damage: '#DC2626', return: '#D97706', sale: '#7C3AED' };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>Inventory — Staff Panel</title></Helmet>

      <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>📦 Inventory Manager</h1>
          <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>{products.length} products · {lowStock.length} low stock</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
            <FiRefreshCw /> Refresh
          </button>
          <button onClick={() => setAdjust(true)} id="adjust-stock-btn"
            style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 700 }}>
            <FiPlus /> Adjust Stock
          </button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Stats */}
        {overview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Products', value: overview.totalProducts, color: '#8B5CF6', bg: '#F5F3FF' },
              { label: 'Healthy Stock',  value: overview.healthyStock,  color: '#059669', bg: '#F0FDF4' },
              { label: 'Low Stock',      value: overview.lowStock,      color: '#D97706', bg: '#FFFBEB' },
              { label: 'Out of Stock',   value: overview.outOfStock,    color: '#DC2626', bg: '#FEF2F2' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Low stock banner */}
        {lowStock.length > 0 && (
          <div style={{ background: '#FEF3C7', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #FCD34D' }}>
            <FiAlertTriangle style={{ color: '#D97706', flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: '#92400E', fontWeight: 600 }}>
              {lowStock.length} product{lowStock.length > 1 ? 's' : ''} need restocking: {lowStock.slice(0, 3).map(p => p.name).join(', ')}{lowStock.length > 3 ? ` +${lowStock.length - 3} more` : ''}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#F3F4F6', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {[{ key: 'products', label: '📋 Products' }, { key: 'logs', label: '📝 Adjustment Logs' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#EC4899' : '#6B7280', boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Products Table */}
        {tab === 'products' && (
          <>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} id="inventory-search"
                style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px 9px 32px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Product', 'SKU', 'Collection', 'Price', 'Stock', 'Alert At', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>Loading...</td></tr>
                  ) : searchedProducts.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No products found</td></tr>
                  ) : searchedProducts.map((p, i) => {
                    const isLow = p.stock <= p.lowStockAlert;
                    const isOut = p.stock === 0;
                    return (
                      <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                        style={{ borderBottom: '1px solid #F3F4F6', background: isOut ? '#FEF2F2' : isLow ? '#FFFBEB' : 'white' }}>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: '#F3F4F6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎁'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.86rem' }}>{p.name}</strong>
                              {(isOut || isLow) && <p style={{ fontSize: '0.7rem', color: isOut ? '#DC2626' : '#D97706', fontWeight: 600 }}>{isOut ? '⛔ Out of stock' : '⚠️ Low stock'}</p>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: '0.78rem', color: '#9CA3AF', fontFamily: 'monospace' }}>{p.sku || '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: '0.82rem', color: '#6B7280' }}>{p.collection?.name || '—'}</td>
                        <td style={{ padding: '11px 14px', fontWeight: 600, fontSize: '0.88rem' }}>Rs. {p.price?.toLocaleString()}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <strong style={{ fontSize: '1rem', color: isOut ? '#DC2626' : isLow ? '#D97706' : '#059669' }}>{p.stock}</strong>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: '0.82rem', color: '#9CA3AF' }}>{p.lowStockAlert}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ background: isOut ? '#FEE2E2' : isLow ? '#FEF3C7' : '#D1FAE5', color: isOut ? '#DC2626' : isLow ? '#D97706' : '#059669', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
                            {isOut ? 'Out' : isLow ? 'Low' : 'OK'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Logs Table */}
        {tab === 'logs' && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Product', 'Action', 'Qty Change', 'Previous', 'New Stock', 'By', 'Note', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>Loading logs...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No adjustment logs yet</td></tr>
                ) : logs.map((l, i) => {
                  const ac = ACTION_COLORS[l.action] || '#6B7280';
                  return (
                    <tr key={l._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '10px 14px' }}><strong style={{ fontSize: '0.85rem' }}>{l.product?.name || '—'}</strong></td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: ac + '20', color: ac, padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>{l.action}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: ['restock','return'].includes(l.action) ? '#059669' : '#DC2626', fontSize: '0.88rem' }}>
                        {['restock','return'].includes(l.action) ? '+' : '-'}{l.quantity}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#6B7280' }}>{l.previousStock}</td>
                      <td style={{ padding: '10px 14px' }}><strong>{l.newStock}</strong></td>
                      <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: '#9CA3AF' }}>{l.performedBy?.name || '—'}</td>
                      <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#6B7280', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.note || '—'}</td>
                      <td style={{ padding: '10px 14px', fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{new Date(l.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdjust && <AdjustModal products={products} onClose={() => setAdjust(false)} onDone={() => { setAdjust(false); load(); }} />}
      </AnimatePresence>
    </div>
  );
}
