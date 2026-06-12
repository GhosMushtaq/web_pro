const express = require('express');
const router = express.Router();
const {
  getProducts, getProductBySlug, getProductById, createProduct,
  updateProduct, deleteProduct, deleteProductImage, getFeaturedProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/id/:id', protect, authorize('admin', 'staff'), getProductById);
router.post('/', protect, authorize('admin'), uploadProduct.array('images', 10), createProduct);
router.put('/:id', protect, authorize('admin'), uploadProduct.array('images', 10), updateProduct);
router.delete('/:id/image/:cloudinary_id', protect, authorize('admin'), deleteProductImage);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
