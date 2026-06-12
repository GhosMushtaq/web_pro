const express = require('express');
const router = express.Router();
const {
  uploadPaymentProof, verifyPayment, approveCOD,
  getPendingPayments, getAllPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProof } = require('../middleware/upload');

router.post('/upload-proof', protect, uploadProof.single('proof'), uploadPaymentProof);
router.put('/verify',  protect, authorize('finance', 'admin'), verifyPayment);
router.put('/approve-cod/:orderId', protect, authorize('admin'), approveCOD);
router.get('/pending', protect, authorize('finance', 'admin'), getPendingPayments);
router.get('/', protect, authorize('finance', 'admin'), getAllPayments);

module.exports = router;
