const express = require('express');
const router = express.Router();
const {
  getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

// Customer route (validate at checkout)
router.post('/validate', protect, validateCoupon);

// Admin routes
router.get('/', protect, authorize('admin'), getCoupons);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
