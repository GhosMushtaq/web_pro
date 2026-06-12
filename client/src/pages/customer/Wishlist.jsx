import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { productService } from '../../services';
import ProductCard from '../../components/shop/ProductCard';

export default function Wishlist() {
  const { user } = useSelector(s => s.auth);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    if (user?.wishlist?.length) {
      Promise.all(user.wishlist.map(id => productService.getById(id).then(d=>d.product).catch(()=>null)))
        .then(ps => setProducts(ps.filter(Boolean)));
    }
  }, [user?.wishlist]);
  return (
    <div style={{minHeight:'100vh',background:'var(--cream)',padding:40}}>
      <Helmet><title>My Wishlist — Gifting Bliss</title></Helmet>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <h1 style={{fontFamily:'var(--font-display)',marginBottom:24}}>💕 My Wishlist</h1>
        {products.length === 0 ?
          <div style={{textAlign:'center',padding:80,color:'var(--muted)'}}><div style={{fontSize:'3rem'}}>💔</div><h3>Your wishlist is empty</h3></div> :
          <div className='grid-4'>{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
        }
      </div>
    </div>
  );
}
