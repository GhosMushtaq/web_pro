import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder } from '../../store/slices/orderSlice';
import { clearCart, selectCartItems, selectCartTotal } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiShoppingBag, FiTruck, FiCreditCard, FiTag, FiCopy } from 'react-icons/fi';
import api from '../../services/api';

const PAYMENTS = [
  { value: 'cod',       label: 'Cash on Delivery',  icon: '💵', desc: 'Pay when you receive' },
  { value: 'easypaisa', label: 'Easypaisa',          icon: '🟣', desc: 'Mobile wallet transfer' },
  { value: 'jazzcash',  label: 'JazzCash',           icon: '🔴', desc: 'Mobile wallet transfer' },
];

const PROVINCES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad (ICT)', 'Gilgit-Baltistan', 'AJK'];

export default function Checkout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const items     = useSelector(selectCartItems);
  const total     = useSelector(selectCartTotal);
  const user      = useSelector(s => s.auth?.user);

  const [form, setForm] = useState({
    name:          user?.name || '',
    phone:         user?.phone || '',
    street:        '',
    city:          '',
    province:      'Punjab',
    paymentMethod: 'cod',
    couponCode:    '',
    notes:         '',
  });
  const [loading,       setLoading]       = useState(false);
  const [paymentInfo,   setPaymentInfo]   = useState({ easypaisaNumber: '', jazzcashNumber: '' });
  const [couponInput,   setCouponInput]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(null);  // { code, discount }

  // Fetch admin payment account numbers (public endpoint)
  useEffect(() => {
    api.get('/settings/payment-info')
      .then(r => setPaymentInfo(r.data.payment || {}))
      .catch(() => {}); // silently ignore
  }, []);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return toast.error('Please enter a coupon code');
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', {
        code:       couponInput.trim().toUpperCase(),
        orderTotal: total,
      });
      const { coupon, discount } = res.data;
      setCouponApplied({ code: coupon.code, discount });
      set('couponCode', coupon.code);
      toast.success(`🎉 Coupon applied! You save Rs. ${discount.toLocaleString()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponInput('');
    set('couponCode', '');
    toast('Coupon removed', { icon: '🗑️' });
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const shippingFee = total >= 3000 ? 0 : 199;
  const discount    = couponApplied?.discount || 0;
  const finalTotal  = total + shippingFee - discount;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.street.trim()) return toast.error('Please enter your street address');
    if (!form.city.trim())   return toast.error('Please enter your city');
    if (!form.phone.trim())  return toast.error('Please enter your phone number');

    setLoading(true);
    try {
      const orderData = {
        items: items.map(i => ({
          product:  i.product._id || i.product,
          quantity: i.quantity,
          price:    i.product.onSale && i.product.salePrice ? i.product.salePrice : i.product.price,
        })),
        shippingAddress: {
          name:     form.name,
          phone:    form.phone,
          street:   form.street,
          city:     form.city,
          province: form.province,
        },
        paymentMethod: form.paymentMethod,
        notes:         form.notes || undefined,
        couponCode:    form.couponCode?.trim().toUpperCase() || undefined,
      };

      const result = await dispatch(placeOrder(orderData));

      if (result.type === 'orders/place/fulfilled') {
        dispatch(clearCart());
        toast.success('🎁 Order placed successfully!');
        navigate('/order-success', { state: { order: result.payload.order } });
      } else {
        const msg = result.payload || result.error?.message || 'Failed to place order';
        toast.error(msg);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
        <div style={{ fontSize: '4rem' }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--dark)' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--muted)' }}>Add items to your cart before checking out.</p>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>Browse Products</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDF7F9', paddingTop: 32, paddingBottom: 60 }}>
      <Helmet><title>Checkout — Gifting Bliss</title></Helmet>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px' }}>
        {/* Back */}
        <button onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', marginBottom: 24, fontSize: '0.88rem', fontWeight: 600 }}>
          <FiArrowLeft /> Back to Cart
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--dark)', marginBottom: 24 }}>
          🛍️ Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
            {/* Left: Forms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Shipping */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #FCE7F3', boxShadow: '0 2px 10px rgba(236,72,153,0.06)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#1F2937' }}>
                  <FiTruck style={{ color: '#EC4899' }} /> Delivery Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name *</label>
                    <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required id="checkout-name" placeholder="Your full name" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Phone Number *</label>
                    <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} required id="checkout-phone" placeholder="03XX-XXXXXXX" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Street Address *</label>
                    <input className="input" value={form.street} onChange={e => set('street', e.target.value)} required id="checkout-address" placeholder="House #, Street, Area" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>City *</label>
                    <input className="input" value={form.city} onChange={e => set('city', e.target.value)} required id="checkout-city" placeholder="Lahore, Karachi..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Province</label>
                    <select className="input" value={form.province} onChange={e => set('province', e.target.value)} id="checkout-province">
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Order Notes (Optional)</label>
                    <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
                      id="checkout-notes" placeholder="Special instructions, gift message..." style={{ resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #FCE7F3', boxShadow: '0 2px 10px rgba(236,72,153,0.06)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#1F2937' }}>
                  <FiCreditCard style={{ color: '#EC4899' }} /> Payment Method
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PAYMENTS.map(m => (
                    <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: `2px solid ${form.paymentMethod === m.value ? '#EC4899' : '#F3F4F6'}`, background: form.paymentMethod === m.value ? '#FDF2F8' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="radio" name="payment" value={m.value} checked={form.paymentMethod === m.value} onChange={e => set('paymentMethod', e.target.value)} style={{ display: 'none' }} />
                      <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1F2937' }}>{m.label}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{m.desc}</span>
                      </div>
                      {form.paymentMethod === m.value && (
                        <span style={{ marginLeft: 'auto', color: '#EC4899', fontWeight: 700, fontSize: '1rem' }}>✓</span>
                      )}
                    </label>
                  ))}
                </div>

                {/* Non-COD payment instructions */}
                {form.paymentMethod !== 'cod' && (() => {
                  const isEasy = form.paymentMethod === 'easypaisa';
                  const label  = isEasy ? 'Easypaisa' : 'JazzCash';
                  const icon   = isEasy ? '🟣' : '🔴';
                  const number = isEasy ? paymentInfo.easypaisaNumber : paymentInfo.jazzcashNumber;

                  return (
                    <div style={{ marginTop: 16, borderRadius: 14, overflow: 'hidden', border: '1.5px solid #BFDBFE' }}>
                      {/* Header */}
                      <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                        <div>
                          <p style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{label} Payment Details</p>
                          <p style={{ color: '#BFDBFE', fontSize: '0.75rem', margin: 0 }}>Send payment before we start packing</p>
                        </div>
                      </div>

                      {/* Account number */}
                      <div style={{ background: '#EFF6FF', padding: '14px 16px' }}>
                        <p style={{ fontSize: '0.78rem', color: '#1E40AF', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Send Rs. {finalTotal.toLocaleString()} to:</p>
                        {number ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 10, padding: '10px 14px', border: '1.5px solid #93C5FD' }}>
                            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{label} Number</p>
                              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1D4ED8', letterSpacing: 1.5, margin: 0 }}>{number}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => { navigator.clipboard.writeText(number); toast.success(`${label} number copied!`); }}
                              style={{ background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600 }}
                            >
                              <FiCopy size={13} /> Copy
                            </button>
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.85rem', color: '#6B7280', fontStyle: 'italic' }}>Payment number will appear here. Please contact us if it's missing.</p>
                        )}

                        {/* Steps */}
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {[
                            `1️⃣  Open your ${label} app`,
                            `2️⃣  Send Rs. ${finalTotal.toLocaleString()} to the number above`,
                            '3️⃣  Take a screenshot of the transaction',
                            '4️⃣  Place your order ➜ go to My Orders ➜ upload the screenshot',
                            '5️⃣  We verify your payment and start packing your order 📦',
                          ].map((s, i) => (
                            <p key={i} style={{ fontSize: '0.8rem', color: '#1E40AF', margin: 0, display: 'flex', alignItems: 'flex-start', gap: 4 }}>{s}</p>
                          ))}
                        </div>

                        <div style={{ marginTop: 12, background: '#FEF3C7', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem', color: '#92400E', fontWeight: 500 }}>
                          ⚠️ Your order will only be processed <strong>after payment verification</strong>. Do not discard your transaction screenshot.
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Coupon */}
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #FCE7F3', boxShadow: '0 2px 10px rgba(236,72,153,0.06)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#1F2937' }}>
                  <FiTag style={{ color: '#EC4899' }} /> Coupon Code
                </h3>

                {couponApplied ? (
                  /* ── Applied state ── */
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F0FDF4', borderRadius: 12, padding: '12px 16px', border: '1.5px solid #A7F3D0' }}>
                    <span style={{ fontSize: '1.4rem' }}>🎉</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 800, color: '#065F46', margin: 0, fontFamily: 'monospace', letterSpacing: 1, fontSize: '1rem' }}>{couponApplied.code}</p>
                      <p style={{ fontSize: '0.8rem', color: '#059669', margin: 0 }}>You save <strong>Rs. {couponApplied.discount.toLocaleString()}</strong></p>
                    </div>
                    <button type="button" onClick={removeCoupon}
                      style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  /* ── Input state ── */
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input className="input" value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                      id="checkout-coupon" placeholder="Enter coupon code"
                      style={{ flex: 1, fontFamily: 'monospace', letterSpacing: 1, fontWeight: 600 }} />
                    <button type="button" onClick={applyCoupon} disabled={couponLoading}
                      id="apply-coupon-btn"
                      style={{ padding: '0 18px', background: couponLoading ? '#D1D5DB' : 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem', cursor: couponLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}

                {!couponApplied && (
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 8 }}>Press Apply or Enter to validate your coupon</p>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div style={{ position: 'sticky', top: 90 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #FCE7F3', boxShadow: '0 4px 20px rgba(236,72,153,0.1)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#1F2937' }}>
                  <FiShoppingBag style={{ color: '#EC4899' }} /> Order Summary
                </h3>

                {/* Items */}
                <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
                  {items.map(({ product, quantity }) => {
                    const price = product.onSale && product.salePrice ? product.salePrice : product.price;
                    return (
                      <div key={product._id || product} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #FDF2F8', alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: '#FDF2F8', flexShrink: 0 }}>
                          {product.images?.[0]?.url
                            ? <img src={product.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎁</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.83rem', fontWeight: 600, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                          <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>× {quantity}</p>
                        </div>
                        <strong style={{ fontSize: '0.85rem', color: '#1F2937', flexShrink: 0 }}>Rs. {(price * quantity).toLocaleString()}</strong>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#6B7280', marginBottom: 8 }}>
                    <span>Subtotal</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#6B7280', marginBottom: 8 }}>
                    <span>Delivery Fee</span>
                    <span style={{ color: shippingFee === 0 ? '#059669' : '#374151' }}>
                      {shippingFee === 0 ? '🎉 Free' : `Rs. ${shippingFee}`}
                    </span>
                  </div>
                  {shippingFee === 0 && <p style={{ fontSize: '0.75rem', color: '#059669', marginBottom: 8 }}>Free delivery on orders above Rs. 3,000!</p>}
                  {/* Coupon discount row — only when applied */}
                  {couponApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#059669', marginBottom: 8, fontWeight: 700 }}>
                      <span>🎉 Coupon ({couponApplied.code})</span>
                      <span>− Rs. {couponApplied.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem', color: '#111827', borderTop: '2px solid #FCE7F3', paddingTop: 12, marginTop: 4 }}>
                    <span>Total</span>
                    <span style={{ color: '#EC4899' }}>Rs. {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Place Order */}
                <button type="submit" disabled={loading} id="place-order-btn"
                  style={{ width: '100%', marginTop: 20, padding: '14px', background: loading ? '#D1D5DB' : 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 0.2s', letterSpacing: 0.3 }}>
                  {loading
                    ? <><div style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Placing Order...</>
                    : '🎁 Place Order'}
                </button>

                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
                  🔒 By placing your order you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
