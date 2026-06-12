import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { collectionService } from '../../services';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { collectionService.getAll().then(d => { setCollections(d.collections||[]); setLoading(false); }).catch(() => setLoading(false)); }, []);
  return (
    <div>
      <Helmet><title>Gift Collections — Gifting Bliss</title></Helmet>
      <div style={{background:'var(--grad-primary)',padding:'60px 0 40px',textAlign:'center',color:'white'}}>
        <h1 style={{color:'white',marginBottom:8}}>🎁 All Collections</h1>
        <p style={{color:'rgba(255,255,255,0.85)'}}>Find the perfect gift from our {collections.length} themed collections</p>
      </div>
      <div className='container' style={{padding:'48px 24px'}}>
        {loading ? <div className='loader' style={{margin:'60px auto'}} /> : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16}}>
            {collections.map(c => (
              <motion.div key={c._id} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
                <Link to={'/collections/'+c.slug} style={{display:'flex',alignItems:'center',gap:12,padding:'16px 20px',background:'white',borderRadius:'var(--radius-md)',border:'1.5px solid var(--pink-100)',textDecoration:'none',color:'var(--dark)',transition:'all 0.3s'}}>
                  <span style={{fontSize:'2rem'}}>{c.emoji}</span>
                  <div><div style={{fontWeight:600,fontSize:'0.9rem'}}>{c.name}</div></div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
