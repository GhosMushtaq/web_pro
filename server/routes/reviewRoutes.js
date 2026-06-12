const express = require('express');
const router  = express.Router();
const {
  getAllReviews, approveReview, deleteReview,
  createReview, getProductReviews, getFeaturedReviews, toggleFeatureReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/featured', getFeaturedReviews);
router.get('/product/:productId', getProductReviews);

// Customer
router.post('/', protect, createReview);

// Admin / Support
router.get('/', protect, authorize('admin', 'support'), getAllReviews);
router.put('/:id/approve', protect, authorize('admin', 'support'), approveReview);
router.put('/:id/feature', protect, authorize('admin', 'support'), toggleFeatureReview);
router.delete('/:id', protect, authorize('admin', 'support'), deleteReview);

module.exports = router;
