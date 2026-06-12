const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrderById, trackOrder,
  getAllOrders, updateOrderStatus, assignOrder, deleteOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/track/:orderNumber', trackOrder);
router.get('/', protect, authorize('admin', 'finance', 'staff', 'support'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateOrderStatus);
router.put('/:id/assign', protect, authorize('admin'), assignOrder);
router.delete('/:id', protect, authorize('admin'), deleteOrder);

module.exports = router;
