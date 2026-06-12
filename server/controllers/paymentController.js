const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// Customer uploads payment proof
exports.uploadPaymentProof = async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['easypaisa', 'jazzcash'].includes(order.paymentMethod)) {
      return res.status(400).json({ message: 'COD orders do not require proof' });
    }

    order.paymentProof = {
      url: req.file.path,
      cloudinary_id: req.file.filename,
      transactionId,
      uploadedAt: new Date()
    };
    order.paymentStatus = 'proof_uploaded';
    order.statusHistory.push({
      status: 'proof_uploaded',
      note: `Payment proof uploaded. Transaction ID: ${transactionId}`,
      updatedBy: req.user._id
    });

    await order.save();

    await Payment.create({
      order: orderId, customer: req.user._id,
      method: order.paymentMethod, amount: order.total,
      status: 'proof_submitted', transactionId,
      proof: { url: req.file.path, cloudinary_id: req.file.filename }
    });

    // Notify finance team via socket
    const io = req.app.get('io');
    if (io) {
      io.to('role:finance').emit('paymentUpdate', { type: 'proof', orderId, amount: order.total });
      io.to('role:admin').emit('paymentUpdate', { type: 'proof', orderId, amount: order.total });
    }

    res.json({ success: true, message: 'Payment proof uploaded. Finance team will verify shortly.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Finance team verifies payment
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, action, rejectionReason } = req.body;
    const order = await Order.findById(orderId).populate('customer');
    const payment = await Payment.findOne({ order: orderId });

    if (!order || !payment) return res.status(404).json({ message: 'Order or payment not found' });

    if (action === 'verify') {
      order.paymentStatus = 'verified';
      order.orderStatus = 'admin_approved';
      payment.status = 'verified';
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();

      order.statusHistory.push({
        status: 'payment_verified',
        note: 'Payment verified by finance team. Order auto-approved.',
        updatedBy: req.user._id
      });
    } else {
      order.paymentStatus = 'rejected';
      payment.status = 'rejected';
      payment.rejectionReason = rejectionReason;

      order.statusHistory.push({
        status: 'payment_rejected',
        note: `Payment rejected: ${rejectionReason}`,
        updatedBy: req.user._id
      });
    }

    await order.save();
    await payment.save();

    // Notify customer
    const io = req.app.get('io');
    if (io) {
      io.to(order.customer._id.toString()).emit('paymentUpdate', {
        status: action === 'verify' ? 'verified' : 'rejected',
        orderId
      });
    }

    await Notification.create({
      recipient: order.customer._id,
      type: 'payment',
      title: action === 'verify' ? 'Payment Verified ✅' : 'Payment Rejected ❌',
      message: action === 'verify'
        ? `Payment for order ${order.orderNumber} has been verified. Your order is now being processed.`
        : `Payment for order ${order.orderNumber} was rejected. Reason: ${rejectionReason}`,
      link: `/orders/${order._id}`
    });

    res.json({ success: true, message: `Payment ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin manually approves COD
exports.approveCOD = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentMethod !== 'cod') {
      return res.status(400).json({ message: 'This is not a COD order' });
    }

    order.paymentStatus = 'paid';
    order.orderStatus = 'admin_approved';
    order.statusHistory.push({
      status: 'admin_approved',
      note: 'COD order approved by admin',
      updatedBy: req.user._id
    });

    await order.save();
    res.json({ success: true, message: 'COD order approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending payments (Finance)
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'proof_submitted' })
      .populate('customer', 'name email phone')
      .populate({ path: 'order', select: 'orderNumber total paymentMethod paymentProof items' })
      .sort({ createdAt: 1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all payments (Finance)
exports.getAllPayments = async (req, res) => {
  try {
    const { status, method, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (method) query.method = method;

    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('customer', 'name email')
        .populate('order', 'orderNumber total')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(query)
    ]);

    res.json({ success: true, payments, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
