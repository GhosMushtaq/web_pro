const express = require('express');
const router = express.Router();
const { getFinanceOverview, refundOrder } = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/overview', protect, authorize('finance', 'admin'), getFinanceOverview);
router.post('/refund', protect, authorize('finance', 'admin'), refundOrder);

module.exports = router;
