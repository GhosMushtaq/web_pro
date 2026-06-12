import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const cartFromStorage = (() => {
  try {
    const cart = localStorage.getItem('gb_cart');
    return cart ? JSON.parse(cart) : [];
  } catch { return []; }
})();

const saveCart = (items) => {
  localStorage.setItem('gb_cart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: cartFromStorage,
    isOpen: false,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find(item => item.product._id === product._id);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      } else {
        state.items.push({ product, quantity });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.product._id !== action.payload);
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(i => i.product._id === productId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i.product._id !== productId);
        } else {
          item.quantity = Math.min(quantity, item.product.stock);
        }
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart([]);
    },
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
    openCart: (state) => { state.isOpen = true; },
    closeCart: (state) => { state.isOpen = false; },
  },
});

// Selectors
export const selectCartItems = state => state.cart.items;
export const selectCartCount = state => state.cart.items.reduce((acc, i) => acc + i.quantity, 0);
export const selectCartTotal = state => state.cart.items.reduce((acc, i) => {
  const price = i.product.onSale && i.product.salePrice ? i.product.salePrice : i.product.price;
  return acc + price * i.quantity;
}, 0);
export const selectCartOpen = state => state.cart.isOpen;

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
