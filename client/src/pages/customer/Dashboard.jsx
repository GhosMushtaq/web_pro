import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { orderService } from '../../services';

export default function CustomerDashboard() {
  const { user } = useSelector(s => s.auth);
  const [orders, setOrders] = useState([]);
  useEffect(() => { orderService.getMyOrders({ limit: 5 }).then(d => setOrders(d.orders||[])).catch(()=>{}); }, []);
  return (
    <div style={{minHeight:'100vh',background:'var(--cream)',padding:40}}>
      <Helmet><title>My Dashboard — Gifting Bliss</title></Helmet>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <h1 style={{fontFamily:'var(--font-display)',marginBottom:8}}>Hello, {user?.name?.split(' ')[0]}! 👋</h1>
        <p style={{color:'var(--muted)',marginBottom:32}}>Welcome to your Gifting Bliss dashboard</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:20,marginBottom:40}}>
          {[{icon:'📦',label:'Total Orders',value:orders.length, path:'/orders'},
            {icon:'🎫',label:'My Tickets',value:'View', path:'/my-tickets'},
            {icon:'💕',label:'Wishlist',value:'View', path:'/wishlist'},
            {icon:'👤',label:'Profile',value:'Manage', path:'/profile'}
          ].map(c=>(
            <Link to={c.path} key={c.label} style={{textDecoration:'none'}}>
              <div style={{background:'white',borderRadius:'var(--radius-lg)',padding:24,border:'1px solid var(--pink-100)',textAlign:'center', transition:'transform 0.2s', height:'100%'}}>
                <div style={{fontSize:'2rem'}}>{c.icon}</div>
                <div style={{fontSize:'1.3rem',fontWeight:700,color:'var(--pink-600)',margin:'8px 0 4px'}}>{c.value}</div>
                <p style={{color:'var(--muted)',fontSize:'0.85rem',margin:0}}>{c.label}</p>
              </div>
            </Link>
          ))}
        </div>
        <div style={{background:'white',borderRadius:'var(--radius-lg)',padding:24,border:'1px solid var(--pink-100)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h3>Recent Orders</h3>
            <Link to='/orders' className='btn btn-ghost btn-sm'>View All</Link>
          </div>
          {orders.length === 0 ? <p style={{textAlign:'center',color:'var(--muted)',padding:40}}>No orders yet. <Link to='/shop'>Start shopping!</Link></p> :
            orders.map(o => (
              <div key={o._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid var(--pink-50)'}}>
                <div>
                  <strong style={{fontSize:'0.9rem'}}>#{o.orderNumber}</strong>
                  <p style={{fontSize:'0.8rem',color:'var(--muted)'}}>{o.items?.length} item(s)</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:600,color:'var(--pink-600)'}}>Rs. {o.total?.toLocaleString()}</div>
                  <span style={{fontSize:'0.75rem',background:'var(--pink-100)',color:'var(--pink-700)',padding:'2px 8px',borderRadius:20}}>{o.orderStatus}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
