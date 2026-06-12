import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../store/slices/orderSlice';

export default function MyOrders() {
  const dispatch = useDispatch();
  const { myOrders, loading } = useSelector(s => s.orders);
  useEffect(() => { dispatch(fetchMyOrders()); }, []);
  return (
    <div style={{minHeight:'100vh',background:'var(--cream)',padding:40}}>
      <Helmet><title>My Orders — Gifting Bliss</title></Helmet>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <h1 style={{fontFamily:'var(--font-display)',marginBottom:24}}>📦 My Orders</h1>
        {loading ? <div className='loader' style={{margin:'60px auto'}} /> : myOrders.length === 0 ?
          <div style={{textAlign:'center',padding:80}}><div style={{fontSize:'3rem'}}>📭</div><h3>No orders yet</h3><Link to='/shop' className='btn btn-primary' style={{marginTop:16}}>Start Shopping</Link></div> :
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {myOrders.map(o => (
              <Link key={o._id} to={'/orders/'+o._id} style={{background:'white',borderRadius:'var(--radius-lg)',padding:20,border:'1px solid var(--pink-100)',textDecoration:'none',color:'inherit',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <strong>#{o.orderNumber}</strong>
                  <p style={{fontSize:'0.85rem',color:'var(--muted)',marginTop:4}}>{o.items?.length} item(s) • {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:700,color:'var(--pink-600)',marginBottom:4}}>Rs. {o.total?.toLocaleString()}</div>
                  <span style={{fontSize:'0.75rem',background:'var(--pink-100)',color:'var(--pink-700)',padding:'3px 10px',borderRadius:20}}>{o.orderStatus?.replace(/_/g,' ')}</span>
                </div>
              </Link>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
