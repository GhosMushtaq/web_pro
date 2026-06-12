const express = require('express');
const router  = express.Router();
const {
  getSettings, updateSettings,
  getProfile, updateProfile, changePassword,
  getPaymentInfo
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

const adminOnly = [protect, authorize('admin')];

// ⬇ public — customers need this for checkout
router.get('/payment-info',      getPaymentInfo);

router.get('/',                  ...adminOnly, getSettings);
router.put('/:section',          ...adminOnly, updateSettings);
router.get('/profile',           protect,      getProfile);
router.put('/profile',           protect,      updateProfile);
router.put('/password',          protect,      changePassword);

module.exports = router;
