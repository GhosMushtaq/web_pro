import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchProductBySlug } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { motion } from 'framer-motion';
import { FiStar, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ProductPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, loading } = useSelector(s => s.products);
  const { isAuthenticated } = useSelector(s => s.auth);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  
  useEffect(() => { dispatch(fetchProductBySlug(slug)); }, [slug]);
  
  useEffect(() => {
    if (product?._id) {
      api.get('/reviews/product/' + product._id)
        .then(res => setReviews(res.data.reviews || []))
        .catch(() => {});
    }
  }, [product?._id]);

  if (loading) return <div className='loader' style={{margin:'100px auto'}} />;
  if (!product) return <div style={{textAlign:'center',padding:80}}><h2>Product not found</h2></div>;
  const image = product.images?.find(i=>i.isPrimary)?.url || product.images?.[0]?.url;
  const price = product.onSale && product.salePrice ? product.salePrice : product.price;
  return (
    <div className='container' style={{padding:'60px 24px'}}>
      <Helmet><title>{product.name} — Gifting Bliss</title></Helmet>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'start'}}>
        <div style={{borderRadius:'var(--radius-lg)',overflow:'hidden',background:'var(--pink-50)',aspectRatio:'1'}}>
          {image?<img src={image} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'5rem'}}>🎁</div>}
        </div>
        <div>
          {product.collection&&<span style={{color:'var(--pink-500)',fontSize:'0.8rem',fontWeight:500,textTransform:'uppercase'}}>{product.collection.name}</span>}
          <h1 style={{fontFamily:'var(--font-display)',fontSize:'2rem',margin:'8px 0 16px'}}>{product.name}</h1>
          <div style={{fontSize:'1.6rem',fontWeight:700,color:'var(--pink-600)',marginBottom:16}}>Rs. {price.toLocaleString()}</div>
          <p style={{color:'var(--muted)',lineHeight:1.7,marginBottom:24}}>{product.description}</p>
          <div style={{display:'flex',gap:12}}>
            <button className='btn btn-primary btn-lg' onClick={()=>{dispatch(addToCart({product,quantity:1}));toast.success('Added to cart! 🎁')}} disabled={product.stock===0}>
              {product.stock===0?'Out of Stock':'Add to Cart 🛍️'}
            </button>
          </div>
            <p style={{marginTop:12,fontSize:'0.85rem',color:'var(--muted)'}}>Stock: {product.stock} left</p>
          </div>
        </div>

      {/* Reviews Section */}
      <div style={{ marginTop: 60, borderTop: '1px solid var(--pink-100)', paddingTop: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            Customer Reviews 
            {product.ratings?.count > 0 && <span style={{ fontSize: '1.2rem', color: '#FBBF24' }}>★ {product.ratings.average}</span>}
          </h2>
          {isAuthenticated ? (
            <button className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }} onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? 'Cancel' : '✏️ Write a Review'}
            </button>
          ) : (
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Log in to leave a review.</span>
          )}
        </div>

        {showReviewForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #E5E7EB', marginBottom: 30, overflow: 'hidden' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: '#111827' }}>Submit Your Review</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <FiStar key={s} size={28} style={{ cursor: 'pointer', transition: 'transform 0.1s' }} 
                  fill={s <= reviewForm.rating ? '#FBBF24' : 'none'} 
                  color={s <= reviewForm.rating ? '#FBBF24' : '#D1D5DB'} 
                  onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                  whileHover={{ scale: 1.1 }}
                />
              ))}
            </div>
            <input placeholder="Review Title" value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} 
              style={{ width: '100%', marginBottom: 12, padding: '12px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <textarea placeholder="Tell us what you loved about this product..." rows={4} value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} 
              style={{ width: '100%', marginBottom: 16, padding: '12px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <button className="btn btn-primary" onClick={async () => {
              if (!reviewForm.title || !reviewForm.comment) return toast.error('Please fill all fields');
              try {
                await api.post('/reviews', { productId: product._id, ...reviewForm });
                toast.success('Review submitted! It will appear once approved.');
                setShowReviewForm(false);
                setReviewForm({ rating: 5, title: '', comment: '' });
              } catch (e) { toast.error(e.response?.data?.message || 'Failed to submit review'); }
            }}>Submit Review</button>
          </motion.div>
        )}
        
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic', padding: 20, background: '#F9FAFB', borderRadius: 12, textAlign: 'center' }}>
            No reviews yet. Buy this product to be the first to review!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {reviews.map((r, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={r._id}
                style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pink-50)', color: 'var(--pink-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {r.customer?.avatar?.url ? <img src={r.customer.avatar.url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <FiUser />}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', display: 'block', color: '#111827' }}>{r.customer?.name || 'Verified Buyer'}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => <FiStar key={s} size={14} fill={s <= r.rating ? '#FBBF24' : 'none'} color={s <= r.rating ? '#FBBF24' : '#D1D5DB'} />)}
                  </div>
                </div>
                {r.title && <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#111827' }}>{r.title}</h4>}
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, flex: 1 }}>"{r.comment}"</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
