import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart, closeCart, selectCartItems, selectCartTotal, selectCartOpen } from '../../store/slices/cartSlice';
import './CartDrawer.css';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const isOpen = useSelector(selectCartOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
          />

          {/* Drawer */}
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="cart-header">
              <div className="cart-header-left">
                <FiShoppingBag className="cart-header-icon" />
                <h3>Shopping Cart</h3>
                {items.length > 0 && <span className="cart-count">{items.length}</span>}
              </div>
              <button className="cart-close" onClick={() => dispatch(closeCart())}>
                <FiX />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛍️</div>
                <h4>Your cart is empty</h4>
                <p>Add some beautiful gifts to your cart!</p>
                <Link to="/shop" className="btn btn-primary" onClick={() => dispatch(closeCart())}>
                  Shop Now
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  <AnimatePresence>
                    {items.map(({ product, quantity }) => {
                      const price = product.onSale && product.salePrice ? product.salePrice : product.price;
                      const image = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url;

                      return (
                        <motion.div
                          key={product._id}
                          className="cart-item"
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="cart-item-img">
                            {image ? <img src={image} alt={product.name} /> : <div className="img-placeholder">🎁</div>}
                          </div>
                          <div className="cart-item-info">
                            <h5>{product.name}</h5>
                            <p className="price-tag">Rs. {price.toLocaleString()}</p>
                            <div className="qty-control">
                              <button
                                onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: quantity - 1 }))}
                                disabled={quantity <= 1}
                              ><FiMinus /></button>
                              <span>{quantity}</span>
                              <button
                                onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: quantity + 1 }))}
                                disabled={quantity >= product.stock}
                              ><FiPlus /></button>
                            </div>
                          </div>
                          <div className="cart-item-actions">
                            <p className="item-total">Rs. {(price * quantity).toLocaleString()}</p>
                            <button className="remove-btn" onClick={() => dispatch(removeFromCart(product._id))}>
                              <FiTrash2 />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="cart-footer">
                  <div className="cart-subtotal">
                    <span>Subtotal</span>
                    <span className="subtotal-amount">Rs. {total.toLocaleString()}</span>
                  </div>
                  <p className="shipping-note">
                    {total >= 3000 ? '🎉 Free shipping!' : `Add Rs. ${(3000 - total).toLocaleString()} more for free shipping`}
                  </p>
                  <Link to="/checkout" className="btn btn-primary btn-lg checkout-btn" onClick={() => dispatch(closeCart())}>
                    Proceed to Checkout
                  </Link>
                  <button className="clear-cart" onClick={() => dispatch(clearCart())}>Clear cart</button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
