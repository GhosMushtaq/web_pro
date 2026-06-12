import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { userService } from '../../services';
import { updateUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      const data = await userService.updateProfile(fd);
      dispatch(updateUser(data.user));
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); } finally { setLoading(false); }
  };
  return (
    <div style={{minHeight:'100vh',background:'var(--cream)',padding:40}}>
      <Helmet><title>My Profile — Gifting Bliss</title></Helmet>
      <div style={{maxWidth:500,margin:'0 auto'}}>
        <h1 style={{fontFamily:'var(--font-display)',marginBottom:24}}>👤 My Profile</h1>
        <div style={{background:'white',borderRadius:'var(--radius-lg)',padding:32,border:'1px solid var(--pink-100)'}}>
          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'var(--grad-primary)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',fontWeight:700,margin:'0 auto 12px'}}>{user?.name?.[0]?.toUpperCase()}</div>
            <strong>{user?.name}</strong>
            <p style={{color:'var(--muted)',fontSize:'0.85rem'}}>{user?.email}</p>
          </div>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:20}}>
            <div>
              <label style={{display:'block',marginBottom:6,fontSize:'0.85rem',fontWeight:500}}>Full Name</label>
              <input className='input' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} id='profile-name' />
            </div>
            <div>
              <label style={{display:'block',marginBottom:6,fontSize:'0.85rem',fontWeight:500}}>Phone</label>
              <input className='input' value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} id='profile-phone' />
            </div>
            <button className='btn btn-primary' disabled={loading}>Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}
