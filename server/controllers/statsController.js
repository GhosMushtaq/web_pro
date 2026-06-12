const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');
const SupportTicket = require('../models/SupportTicket');
const Inventory = require('../models/Inventory');

// Dashboard Overview Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue, monthRevenue, lastMonthRevenue,
      totalOrders, pendingOrders, totalCustomers, newCustomers,
      totalProducts, lowStockProducts, openTickets
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: { $in: ['verified','paid'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: { $in: ['verified','paid'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: { $in: ['verified','paid'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: startOfMonth } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockAlert'] } }),
      SupportTicket.countDocuments({ status: { $in: ['open','in_progress'] } }),
    ]);

    const monthRev = monthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev * 100).toFixed(1) : 100;

    res.json({
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: monthRev,
        lastMonth: lastMonthRev,
        growth: parseFloat(revenueGrowth)
      },
      orders: { total: totalOrders, pending: pendingOrders },
      customers: { total: totalCustomers, newThisMonth: newCustomers },
      products: { total: totalProducts, lowStock: lowStockProducts },
      support: { openTickets }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Revenue Chart (last 12 months)
exports.getRevenueChart = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['verified','paid'] }, createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders:  { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const formatted = data.map(d => ({
      month:   months[d._id.month - 1],
      year:    d._id.year,
      revenue: d.revenue,
      orders:  d.orders
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Order Status Distribution
exports.getOrderStatusChart = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: data.map(d => ({ status: d._id, count: d.count })) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Top Collections by Revenue
exports.getTopCollections = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'collections', localField: 'product.collection', foreignField: '_id', as: 'collection' } },
      { $unwind: '$collection' },
      { $group: {
        _id: '$collection._id',
        name:    { $first: '$collection.name' },
        revenue: { $sum: '$items.total' },
        sold:    { $sum: '$items.quantity' }
      }},
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Payment Methods Distribution
exports.getPaymentMethodsChart = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    res.json({ success: true, data: data.map(d => ({ method: d._id, count: d.count, total: d.total })) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Finance Team Stats
exports.getFinanceStats = async (req, res) => {
  try {
    const [
      pendingVerification, verifiedToday, rejectedTotal,
      totalVerified, totalEasypaisa, totalJazzcash, totalCOD
    ] = await Promise.all([
      Payment.countDocuments({ status: 'proof_submitted' }),
      Payment.countDocuments({ status: 'verified', verifiedAt: { $gte: new Date().setHours(0,0,0,0) } }),
      Payment.countDocuments({ status: 'rejected' }),
      Payment.aggregate([{ $match: { status: 'verified' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { method: 'easypaisa', status: 'verified' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { method: 'jazzcash', status: 'verified' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { method: 'cod' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.json({
      pendingVerification, verifiedToday, rejectedTotal,
      totalVerified: totalVerified[0]?.total || 0,
      byMethod: {
        easypaisa: totalEasypaisa[0]?.total || 0,
        jazzcash:  totalJazzcash[0]?.total || 0,
        cod:       totalCOD[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Top Products
exports.getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(10)
      .populate('collection', 'name')
      .lean();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
