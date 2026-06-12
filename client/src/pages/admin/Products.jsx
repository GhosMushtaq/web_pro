import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import { AdminSidebar } from './Overview';
import { productService, collectionService } from '../../services';
import toast from 'react-hot-toast';
import { FiMenu, FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import './AdminDashboard.css';

const EMPTY_FORM = { name:'',description:'',price:'',salePrice:'',stock:'',collection:'',category:'',tags:'',isFeatured:false,isBestseller:false,onSale:false,lowStockAlert:5 };

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s=>s.products);
  const [sidebar, setSidebar] = useState(false);
  const [collections, setCollections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    dispatch(fetchProducts({ limit: 50 }));
    collectionService.getAll().then(d=>setCollections(d.collections||[])).catch(()=>{});
  },[]);

  const openCreate = ()=>{ setEditing(null); setForm(EMPTY_FORM); setImages([]); setShowModal(true); };
  const openEdit = p=>{ setEditing(p); setForm({ name:p.name,description:p.description||'',price:p.price,salePrice:p.salePrice||'',stock:p.stock,collection:p.collection?._id||'',category:p.category||'',tags:p.tags?.join(',')||'',isFeatured:p.isFeatured,isBestseller:p.isBestseller,onSale:p.onSale,lowStockAlert:p.lowStockAlert }); setImages([]); setShowModal(true); };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      images.forEach(f=>fd.append('images',f));
      if(editing) await productService.updateProduct(editing._id,fd);
      else await productService.createProduct(fd);
      toast.success(editing?'Product updated!':'Product created!');
      setShowModal(false);
      dispatch(fetchProducts({ limit: 50 }));
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if(!confirm('Delete this product?')) return;
    try { await productService.deleteProduct(id); toast.success('Deleted'); dispatch(fetchProducts({ limit: 50 })); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className='admin-layout'>
      <Helmet><title>Products — Admin Dashboard</title></Helmet>
      <AdminSidebar open={sidebar} onClose={()=>setSidebar(false)} />
      <div className='admin-content'>
        <div className='admin-topbar'>
          <button className='admin-menu-btn' onClick={()=>setSidebar(true)} id='admin-products-menu'><FiMenu /></button>
          <div><h1 className='admin-page-title'>🛍️ Products</h1><p className='admin-page-subtitle'>{items.length} products</p></div>
          <div className='admin-topbar-actions'>
            <button className='btn btn-primary btn-sm' onClick={openCreate} id='add-product-btn'><FiPlus /> Add Product</button>
          </div>
        </div>
        <div className='admin-body'>
          <div className='admin-data-table'>
            <table>
              <thead><tr><th>Product</th><th>Collection</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{textAlign:'center',padding:40}}>Loading...</td></tr> :
                  items.map(p=>(
                    <tr key={p._id}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          {p.images?.[0]?.url ? <img src={p.images[0].url} style={{width:40,height:40,borderRadius:8,objectFit:'cover'}} /> : <div style={{width:40,height:40,borderRadius:8,background:'var(--pink-50)',display:'flex',alignItems:'center',justifyContent:'center'}}>🎁</div>}
                          <div><strong style={{fontSize:'0.9rem'}}>{p.name}</strong><p style={{fontSize:'0.75rem',color:'var(--muted)'}}>{p.sku}</p></div>
                        </div>
                      </td>
                      <td style={{fontSize:'0.85rem'}}>{p.collection?.name||'-'}</td>
                      <td>
                        <strong>Rs. {(p.onSale&&p.salePrice?p.salePrice:p.price)?.toLocaleString()}</strong>
                        {p.onSale&&p.salePrice&&<p style={{fontSize:'0.75rem',textDecoration:'line-through',color:'var(--muted)'}}>Rs. {p.price?.toLocaleString()}</p>}
                      </td>
                      <td>
                        <span style={{color:p.stock===0?'#DC2626':p.stock<=p.lowStockAlert?'#D97706':'#059669',fontWeight:600}}>{p.stock}</span>
                        {p.stock<=p.lowStockAlert&&p.stock>0&&<div style={{fontSize:'0.7rem',color:'#D97706'}}>Low Stock</div>}
                      </td>
                      <td>
                        {p.isFeatured&&<span className='badge badge-pink' style={{marginRight:4}}>Featured</span>}
                        {p.isBestseller&&<span className='badge badge-gold'>Bestseller</span>}
                      </td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className='btn btn-secondary btn-sm' onClick={()=>openEdit(p)} style={{padding:'6px 10px'}}><FiEdit /></button>
                          <button className='btn btn-sm' style={{background:'#FEE2E2',color:'#DC2626',padding:'6px 10px',borderRadius:'var(--radius-sm)'}} onClick={()=>handleDelete(p._id)}><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className='admin-modal-overlay' initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className='admin-modal' initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} style={{maxWidth:700}}>
              <div className='admin-modal-header'>
                <h3>{editing?'Edit Product':'Add New Product'}</h3>
                <button className='admin-modal-close' onClick={()=>setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className='admin-form-grid'>
                  <div className='admin-form-group full-width'>
                    <label>Product Name *</label>
                    <input className='input' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required id='prod-name' />
                  </div>
                  <div className='admin-form-group'>
                    <label>Price (Rs.) *</label>
                    <input className='input' type='number' value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required id='prod-price' />
                  </div>
                  <div className='admin-form-group'>
                    <label>Sale Price (Rs.)</label>
                    <input className='input' type='number' value={form.salePrice} onChange={e=>setForm({...form,salePrice:e.target.value})} id='prod-sale-price' />
                  </div>
                  <div className='admin-form-group'>
                    <label>Stock *</label>
                    <input className='input' type='number' value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} required id='prod-stock' />
                  </div>
                  <div className='admin-form-group'>
                    <label>Collection</label>
                    <select className='input' value={form.collection} onChange={e=>setForm({...form,collection:e.target.value})} id='prod-collection'>
                      <option value=''>Select collection</option>
                      {collections.map(c=><option key={c._id} value={c._id}>{c.emoji} {c.name}</option>)}
                    </select>
                  </div>
                  <div className='admin-form-group full-width'>
                    <label>Description</label>
                    <textarea className='input' rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} id='prod-description' style={{resize:'vertical'}} />
                  </div>
                  <div className='admin-form-group'>
                    <label>Tags (comma separated)</label>
                    <input className='input' value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} id='prod-tags' />
                  </div>
                  <div className='admin-form-group'>
                    <label>Low Stock Alert At</label>
                    <input className='input' type='number' value={form.lowStockAlert} onChange={e=>setForm({...form,lowStockAlert:e.target.value})} id='prod-low-stock' />
                  </div>
                  <div className='admin-form-group full-width'>
                    <label>Images</label>
                    <input type='file' accept='image/*' multiple onChange={e=>setImages(Array.from(e.target.files))} id='prod-images' />
                    {editing?.images?.length>0&&<p style={{fontSize:'0.78rem',color:'var(--muted)',marginTop:4}}>{editing.images.length} existing image(s)</p>}
                  </div>
                  <div className='admin-form-group full-width' style={{display:'flex',gap:20}}>
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type='checkbox' checked={form.onSale} onChange={e=>setForm({...form,onSale:e.target.checked})} id='prod-onsale' /> On Sale</label>
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type='checkbox' checked={form.isFeatured} onChange={e=>setForm({...form,isFeatured:e.target.checked})} id='prod-featured' /> Featured</label>
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type='checkbox' checked={form.isBestseller} onChange={e=>setForm({...form,isBestseller:e.target.checked})} id='prod-bestseller' /> Bestseller</label>
                  </div>
                </div>
                <div className='admin-form-actions'>
                  <button type='button' className='btn btn-secondary' onClick={()=>setShowModal(false)}>Cancel</button>
                  <button type='submit' className='btn btn-primary' disabled={saving} id='prod-save-btn'>{saving?'Saving...':editing?'Update Product':'Create Product'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
