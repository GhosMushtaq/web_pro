import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;
  return (
    <div style={{minHeight:'100vh',background:'var(--cream)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <Helmet><title>Order Placed! — Gifting Bliss</title></Helmet>
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} style={{background:'white',borderRadius:'var(--radius-xl)',padding:'60px 40px',textAlign:'center',maxWidth:500,width:'100%',border:'1px solid var(--pink-100)',boxShadow:'var(--shadow-lg)'}}>
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2,type:'spring',stiffness:300}} style={{fontSize:'5rem',marginBottom:16}}>🎉</motion.div>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:'2rem',marginBottom:8}}>Order Placed!</h1>
        <p style={{color:'var(--muted)',marginBottom:8}}>Thank you for shopping with Gifting Bliss! 💕</p>
        {order && <p style={{fontWeight:600,color:'var(--pink-600)',marginBottom:24}}>Order #{order.orderNumber}</p>}
        {order?.paymentMethod === 'cod' ? (
          <p style={{fontSize:'0.9rem',color:'var(--muted)',marginBottom:32}}>
            You selected Cash on Delivery. Please have the exact amount ready upon delivery. 💵
          </p>
        ) : (
          <div style={{background:'#EFF6FF',border:'1.5px solid #93C5FD',borderRadius:12,padding:'16px 20px',marginBottom:32,textAlign:'left'}}>
            <p style={{fontWeight:700,color:'#1D4ED8',marginBottom:10,fontSize:'0.95rem'}}>
              {order?.paymentMethod === 'easypaisa' ? '🟣' : '🔴'} Next Step: Complete Your Payment
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {[
                `1️⃣  Open your ${order?.paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} app`,
                `2️⃣  Send the order total to the number shown at checkout`,
                '3️⃣  Take a screenshot of the transaction',
                '4️⃣  Go to My Orders → tap your order → Upload Payment Proof',
                '5️⃣  We verify your payment and start packing your gift 📦',
              ].map((s, i) => (
                <p key={i} style={{fontSize:'0.83rem',color:'#1E40AF',margin:0}}>{s}</p>
              ))}
            </div>
            <div style={{marginTop:12,background:'#FEF3C7',borderRadius:8,padding:'8px 12px',fontSize:'0.78rem',color:'#92400E',fontWeight:500}}>
              ⚠️ Your order will only be processed <strong>after payment verification</strong>. Do not close this page without noting your order number.
            </div>
          </div>
        )}
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <Link to='/orders' className='btn btn-primary'>View My Orders</Link>
          <Link to='/shop' className='btn btn-secondary'>Continue Shopping</Link>
        </div>
      </motion.div>
    </div>
  );
}
