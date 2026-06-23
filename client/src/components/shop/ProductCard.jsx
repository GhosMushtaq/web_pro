import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar, FiEye } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { userService } from '../../services';
import toast from 'react-hot-toast';
import './ProductCard.css';

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'backOut' } }
};

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { wishlist } = useSelector(s => s.auth.user || {});
  const [inWishlist, setInWishlist] = useState(wishlist?.includes(product._id));
  const [loading, setLoading] = useState(false);

  const price = product.onSale && product.salePrice ? product.salePrice : product.price;
  const image = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url;
  const discountPercent = product.onSale && product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return toast.error('Out of stock');
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success('Added to cart! 🎁');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return toast.error('Please login to use wishlist');
    try {
      setLoading(true);
      await userService.toggleWishlist(product._id);
      setInWishlist(!inWishlist);
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist 💕');
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (avg) => {
    return [...Array(5)].map((_, i) => (
      <FiStar key={i} className={i < Math.round(avg) ? 'star-filled' : 'star-empty'} />
    ));
  };

  return (
    <motion.div className="product-card" variants={cardVariants}>
      <Link to={`/product/${product.slug}`} className="product-card-link">
        {/* Image */}
        <div className="product-img-wrapper">
          {image
            ? <img src={image} alt={product.name} loading="lazy" />
            : <div className="product-img-placeholder">🎁</div>
          }

          {/* Badges */}
          <div className="product-badges">
            {product.isNew && <span className="badge-new">NEW</span>}
            {product.isBestseller && <span className="badge-bestseller">⭐ BESTSELLER</span>}
            {discountPercent && <span className="badge-sale">-{discountPercent}%</span>}
            {product.stock === 0 && <span className="badge-oos">Out of Stock</span>}
          </div>

          {/* Hover Actions */}
          <div className="product-hover-actions">
            <button
              className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
              onClick={handleWishlist}
              disabled={loading}
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart />
            </button>
            <Link to={`/product/${product.slug}`} className="quick-view-btn" title="Quick view">
              <FiEye />
            </Link>
          </div>

          {/* Add to Cart overlay */}
          <div className="add-to-cart-overlay">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <FiShoppingBag />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="product-info">
          {product.collection && (
            <span className="product-collection">{product.collection.name}</span>
          )}
          <h3 className="product-name">{product.name}</h3>

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className="product-rating">
              <div className="stars">{renderStars(product.ratings.average)}</div>
              <span className="rating-count">({product.ratings.count})</span>
            </div>
          )}

          {/* Price */}
          <div className="product-price">
            <span className="price-current">Rs. {price.toLocaleString()}</span>
            {product.onSale && product.salePrice && (
              <span className="price-was">Rs. {product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
