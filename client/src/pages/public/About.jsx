import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div>
      <Helmet><title>About Us — Gifting Bliss</title></Helmet>
      <div style={{background:'var(--grad-primary)',padding:'80px 0 60px',textAlign:'center',color:'white'}}>
        <h1 style={{color:'white',marginBottom:12}}>About Gifting Bliss 💕</h1>
        <p style={{color:'rgba(255,255,255,0.9)',maxWidth:600,margin:'0 auto'}}>We believe every gift is a story waiting to be told. Founded with love in Lahore, Pakistan.</p>
      </div>
      <div className='container' style={{padding:'80px 24px',maxWidth:800}}>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <h2 style={{marginBottom:16}}>Our Story</h2>
          <p style={{color:'var(--muted)',lineHeight:1.8,marginBottom:40}}>Gifting Bliss was born from a simple idea — that every special moment deserves a gift that truly speaks from the heart. We started as a small team of gift enthusiasts in Lahore and have grown into Pakistan's premier online gift destination with over 50,000 happy orders delivered.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,marginTop:40}}>
            {[{icon:'🎯',title:'Our Mission',text:'To make gift-giving magical, personal, and effortless for everyone across Pakistan.'},{icon:'💝',title:'Our Values',text:'Love, quality, and care are at the heart of everything we do.'},{icon:'🌟',title:'Our Vision',text:'To become the go-to gift destination for every occasion, everywhere in Pakistan.'}].map(item=>(
              <div key={item.title} style={{textAlign:'center',padding:28,background:'var(--pink-50)',borderRadius:'var(--radius-lg)'}}>
                <div style={{fontSize:'2.5rem',marginBottom:12}}>{item.icon}</div>
                <h3 style={{marginBottom:8,fontFamily:'var(--font-body)',fontSize:'1rem'}}>{item.title}</h3>
                <p style={{color:'var(--muted)',fontSize:'0.85rem',lineHeight:1.6}}>{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
