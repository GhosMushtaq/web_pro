import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { statsService } from '../../services';
import { FiMenu } from 'react-icons/fi';


export default function FinanceOverview() {
  const [stats, setStats] = useState(null);
  const [sidebar, setSidebar] = useState(false);
  useEffect(()=>{ statsService.getFinance().then(setStats).catch(()=>{}); },[]);
  return (
    <div style={{minHeight:'100vh',background:'#F9FAFB'}}>
      <Helmet><title>Finance Overview — Gifting Bliss</title></Helmet>
      <div style={{background:'white',padding:'16px 24px',borderBottom:'1px solid #E5E7EB',display:'flex',alignItems:'center',gap:16}}>
        <h1 style={{fontSize:'1.1rem',fontWeight:600,fontFamily:'var(--font-body)'}}>💰 Finance Overview</h1>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <Link to='/finance/payments' className='btn btn-primary btn-sm'>Verify Payments</Link>
          <Link to='/finance/reports' className='btn btn-secondary btn-sm'>Reports</Link>
        </div>
      </div>
      <div style={{padding:24}}>
        {stats ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {[
              {label:'Pending Verification',value:stats.pendingVerification,color:'#D97706',bg:'#FEF3C7'},
              {label:'Verified Today',value:stats.verifiedToday,color:'#059669',bg:'#D1FAE5'},
              {label:'Total Verified',value:'Rs. '+(stats.totalVerified?.toLocaleString()||0),color:'var(--pink-600)',bg:'var(--pink-50)'},
              {label:'EasyPaisa',value:'Rs. '+(stats.byMethod?.easypaisa?.toLocaleString()||0),color:'#059669',bg:'#D1FAE5'},
              {label:'JazzCash',value:'Rs. '+(stats.byMethod?.jazzcash?.toLocaleString()||0),color:'#D97706',bg:'#FEF3C7'},
              {label:'Rejected',value:stats.rejectedTotal,color:'#DC2626',bg:'#FEE2E2'},
            ].map(c=>(
              <div key={c.label} style={{background:'white',borderRadius:'var(--radius-lg)',padding:20,border:'1px solid #E5E7EB'}}>
                <p style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.5px'}}>{c.label}</p>
                <div style={{fontSize:'1.5rem',fontWeight:700,color:c.color}}>{c.value}</div>
              </div>
            ))}
          </div>
        ) : <div className='loader' style={{margin:'60px auto'}} />}
      </div>
    </div>
  );
}
