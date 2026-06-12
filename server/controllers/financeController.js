const Order = require('../models/Order');
const Payment = require('../models/Payment');

// Finance overview — monthly breakdown
exports.getFinanceOverview = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyData = await Order.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['verified', 'paid'] },
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          discount: { $sum: '$discount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const formatted = months.map((m, i) => {
      const found = monthlyData.find(d => d._id.month === i + 1);
      return { month: m, revenue: found?.revenue || 0, orders: found?.orders || 0, discount: found?.discount || 0 };
    });

    res.json({ success: true, data: formatted, year });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refund order
exports.refundOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const order = await Order.findById(orderId);
    const payment = await Payment.findOne({ order: orderId });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = 'refunded';
    order.orderStatus = 'returned';
    order.statusHistory.push({
      status: 'refunded',
      note: `Refund processed. Reason: ${reason}`,
      updatedBy: req.user._id
    });
    await order.save();

    if (payment) {
      payment.status = 'refunded';
      await payment.save();
    }

    res.json({ success: true, message: 'Refund processed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
