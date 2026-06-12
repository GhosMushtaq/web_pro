const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getRevenueChart, getOrderStatusChart,
  getTopCollections, getPaymentMethodsChart, getFinanceStats, getTopProducts
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

const adminOrFinance = authorize('admin', 'finance');

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/revenue-chart', protect, adminOrFinance, getRevenueChart);
router.get('/order-status', protect, adminOrFinance, getOrderStatusChart);
router.get('/top-collections', protect, adminOrFinance, getTopCollections);
router.get('/payment-methods', protect, adminOrFinance, getPaymentMethodsChart);
router.get('/finance', protect, adminOrFinance, getFinanceStats);
router.get('/top-products', protect, adminOrFinance, getTopProducts);

module.exports = router;
