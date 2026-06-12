const express = require('express');
const router  = express.Router();
const {
  getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier,
  addPayment,
  addOrder, updateOrder,
  addDeal, updateDeal,
  addDeadline, updateDeadline,
  addActivity,
  getStats
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

// All routes: admin only
router.get('/',    protect, authorize('admin'), getSuppliers);
router.get('/stats', protect, authorize('admin'), getStats);
router.get('/:id', protect, authorize('admin'), getSupplier);
router.post('/',   protect, authorize('admin'), createSupplier);
router.put('/:id', protect, authorize('admin'), updateSupplier);
router.delete('/:id', protect, authorize('admin'), deleteSupplier);

// Sub-resources
router.post('/:id/payments',           protect, authorize('admin'), addPayment);
router.post('/:id/orders',             protect, authorize('admin'), addOrder);
router.put('/:id/orders/:oid',         protect, authorize('admin'), updateOrder);
router.post('/:id/deals',              protect, authorize('admin'), addDeal);
router.put('/:id/deals/:did',          protect, authorize('admin'), updateDeal);
router.post('/:id/deadlines',          protect, authorize('admin'), addDeadline);
router.put('/:id/deadlines/:deid',     protect, authorize('admin'), updateDeadline);
router.post('/:id/activity',           protect, authorize('admin'), addActivity);

module.exports = router;
