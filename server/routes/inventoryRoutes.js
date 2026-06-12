const express = require('express');
const router = express.Router();
const {
  getInventoryLogs, getLowStockProducts, adjustStock, getStockOverview
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'staff'), getInventoryLogs);
router.get('/low-stock', protect, authorize('admin', 'staff'), getLowStockProducts);
router.get('/overview', protect, authorize('admin', 'staff'), getStockOverview);
router.post('/adjust', protect, authorize('admin', 'staff'), adjustStock);

module.exports = router;
