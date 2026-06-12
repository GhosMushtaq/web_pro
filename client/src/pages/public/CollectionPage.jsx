import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collectionService, productService } from '../../services';
import ProductCard from '../../components/shop/ProductCard';

export default function CollectionPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    collectionService.getBySlug(slug).then(d => { setCollection(d.collection); return productService.getProducts({ collection: d.collection._id }); })
      .then(d => { setProducts(d.products||[]); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);
  if (loading) return <div className='loader' style={{margin:'100px auto'}} />;
  if (!collection) return <div style={{textAlign:'center',padding:80}}><h2>Collection not found</h2></div>;
  return (
    <div>
      <Helmet><title>{collection.name} — Gifting Bliss</title></Helmet>
      <div style={{background:'var(--grad-primary)',padding:'60px 0 40px',textAlign:'center',color:'white'}}>
        <div style={{fontSize:'3rem',marginBottom:12}}>{collection.emoji}</div>
        <h1 style={{color:'white',marginBottom:8}}>{collection.name}</h1>
        <p style={{color:'rgba(255,255,255,0.85)'}}>{collection.description}</p>
      </div>
      <div className='container' style={{padding:'48px 24px'}}>
        {products.length === 0 ? <div style={{textAlign:'center',padding:60,color:'var(--muted)'}}>No products in this collection yet.</div> : (
          <div className='grid-4'>{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </div>
    </div>
  );
}
