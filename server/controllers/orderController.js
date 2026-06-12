const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const { sendOrderConfirmation } = require('../utils/sendEmail');

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;

    // Validate and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.product} not available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const price = product.onSale && product.salePrice ? product.salePrice : product.price;
      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images.find(i => i.isPrimary)?.url || product.images[0]?.url,
        price,
        quantity: item.quantity,
        total
      });
    }

    // Apply coupon
    let discount = 0;
    let couponApplied = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (subtotal >= coupon.minOrder) {
          if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            discount = coupon.type === 'percentage'
              ? Math.min(subtotal * coupon.value / 100, coupon.maxDiscount || Infinity)
              : coupon.value;
            coupon.usedCount += 1;
            await coupon.save();
            couponApplied = coupon.code;
          }
        }
      }
    }

    const shippingFee = subtotal > 3000 ? 0 : 199; // Free shipping above Rs. 3000
    const total = subtotal + shippingFee - discount;

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      discount,
      couponCode: couponApplied,
      total,
      notes,
      statusHistory: [{ status: 'pending', note: 'Order placed by customer', updatedBy: req.user._id }]
    });

    // Deduct stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      const prevStock = product.stock;
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();

      await Inventory.create({
        product: item.product,
        action: 'sale',
        quantity: item.quantity,
        previousStock: prevStock,
        newStock: product.stock,
        note: `Order ${order.orderNumber}`,
        performedBy: req.user._id,
        reference: order.orderNumber
      });

      // Low stock alert
      if (product.stock <= product.lowStockAlert) {
        const io = req.app.get('io');
        if (io) io.to('role:admin').emit('inventoryAlert', { product: product.name, stock: product.stock });
      }
    }

    // Notify admin via socket
    const io = req.app.get('io');
    if (io) io.to('role:admin').emit('orderUpdate', { type: 'new', order });

    // Create notification for admin
    await Notification.create({
      recipient: req.user._id,
      type: 'order',
      title: 'Order Placed Successfully',
      message: `Your order ${order.orderNumber} has been placed. Total: Rs. ${total.toLocaleString()}`,
      link: `/orders/${order._id}`
    });

    // Send confirmation email
    try {
      await sendOrderConfirmation(req.user.email, req.user.name, order);
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }

    res.status(201).json({ success: true, order, message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer orders
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { customer: req.user._id };
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(query)
    ]);

    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images slug')
      .populate('statusHistory.updatedBy', 'name role');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check authorization
    if (order.customer._id.toString() !== req.user._id.toString() && !['admin','finance','staff','support'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track order by order number (public)
// @route   GET /api/orders/track/:orderNumber
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .select('orderNumber orderStatus statusHistory shippingAddress estimatedDelivery deliveredAt')
      .lean();

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get all orders
// @route   GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, paymentMethod, search, dateFrom, dateTo } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Update order status
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id).populate('customer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user._id });

    if (status === 'delivered') order.deliveredAt = new Date();
    if (status === 'cancelled') { order.cancelledAt = new Date(); order.cancelReason = note; }
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    await order.save();

    // Notify customer via socket
    const io = req.app.get('io');
    if (io) io.to(order.customer._id.toString()).emit('orderUpdate', { type: 'statusChange', order });

    // Create notification
    await Notification.create({
      recipient: order.customer._id,
      type: 'order',
      title: 'Order Update',
      message: `Your order ${order.orderNumber} status: ${status}`,
      link: `/orders/${order._id}`
    });

    res.json({ success: true, order, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Assign order to staff
// @route   PUT /api/orders/:id/assign
exports.assignOrder = async (req, res) => {
  try {
    const { staffId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedTo: staffId },
      { new: true }
    );
    res.json({ success: true, order, message: 'Order assigned to staff' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Delete order completely
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, message: 'Order strictly deleted from the database' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
