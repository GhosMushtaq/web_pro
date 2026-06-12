import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({name:'',email:'',subject:'',message:''});
  const handleSubmit = e => { e.preventDefault(); toast.success('Message sent! We\'ll get back to you soon 💕'); setForm({name:'',email:'',subject:'',message:''}); };
  return (
    <div>
      <Helmet><title>Contact Us — Gifting Bliss</title></Helmet>
      <div style={{background:'var(--grad-primary)',padding:'60px 0 40px',textAlign:'center',color:'white'}}>
        <h1 style={{color:'white',marginBottom:8}}>📞 Contact Us</h1>
        <p style={{color:'rgba(255,255,255,0.85)'}}>We'd love to hear from you!</p>
      </div>
      <div className='container' style={{padding:'60px 24px',maxWidth:600}}>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:20}}>
          <div>
            <label style={{display:'block',marginBottom:6,fontSize:'0.85rem',fontWeight:500}}>Name</label>
            <input className='input' placeholder='Your name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required id='contact-name' />
          </div>
          <div>
            <label style={{display:'block',marginBottom:6,fontSize:'0.85rem',fontWeight:500}}>Email</label>
            <input className='input' type='email' placeholder='you@example.com' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required id='contact-email' />
          </div>
          <div>
            <label style={{display:'block',marginBottom:6,fontSize:'0.85rem',fontWeight:500}}>Subject</label>
            <input className='input' placeholder='How can we help?' value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} id='contact-subject' />
          </div>
          <div>
            <label style={{display:'block',marginBottom:6,fontSize:'0.85rem',fontWeight:500}}>Message</label>
            <textarea className='input' rows={5} placeholder='Your message...' value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required style={{resize:'vertical'}} id='contact-message' />
          </div>
          <button type='submit' className='btn btn-primary' id='contact-submit'>Send Message 💕</button>
        </form>
      </div>
    </div>
  );
}
