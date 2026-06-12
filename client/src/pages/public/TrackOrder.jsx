import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { orderService } from '../../services';
import toast from 'react-hot-toast';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleTrack = async e => {
    e.preventDefault();
    if (!orderNumber) return;
    setLoading(true);
    try {
      const data = await orderService.track(orderNumber);
      setOrder(data.order);
    } catch { toast.error('Order not found'); } finally { setLoading(false); }
  };
  return (
    <div>
      <Helmet><title>Track Order — Gifting Bliss</title></Helmet>
      <div style={{background:'var(--grad-primary)',padding:'60px 0 40px',textAlign:'center',color:'white'}}>
        <h1 style={{color:'white',marginBottom:8}}>📦 Track Your Order</h1>
        <p style={{color:'rgba(255,255,255,0.85)'}}>Enter your order number to see real-time updates</p>
      </div>
      <div className='container' style={{padding:'60px 24px',maxWidth:500}}>
        <form onSubmit={handleTrack} style={{display:'flex',gap:12}}>
          <input className='input' placeholder='Order number (e.g. GB-00001)' value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} id='track-order-input' />
          <button className='btn btn-primary' type='submit' disabled={loading} id='track-order-btn'>{loading?'Searching...':'Track'}</button>
        </form>
        {order && (
          <div style={{marginTop:32,background:'white',borderRadius:'var(--radius-lg)',padding:24,border:'1px solid var(--pink-100)'}}>
            <h3 style={{marginBottom:16}}>Order #{order.orderNumber}</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {order.statusHistory.map((h,i)=>(
                <div key={i} style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:'var(--pink-500)',flexShrink:0}} />
                  <div>
                    <strong style={{fontSize:'0.9rem'}}>{h.status.replace(/_/g,' ').toUpperCase()}</strong>
                    {h.note && <p style={{fontSize:'0.8rem',color:'var(--muted)'}}>{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
