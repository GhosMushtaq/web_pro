const Coupon = require('../models/Coupon');

// @desc    Get all coupons
// @route   GET /api/coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create coupon
// @route   POST /api/coupons
exports.createCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrder, maxDiscount, usageLimit, userLimit, isActive, expiresAt } = req.body;
    const coupon = await Coupon.create({
      code: code.toUpperCase(), type, value, minOrder, maxDiscount,
      usageLimit, userLimit, isActive, expiresAt
    });
    res.status(201).json({ success: true, coupon, message: 'Coupon created successfully' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Coupon code already exists' });
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ success: true, coupon, message: 'Coupon updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate/apply coupon (for customers at checkout)
// @route   POST /api/coupons/validate
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.status(400).json({ message: 'Coupon has expired' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon usage limit reached' });
    if (orderTotal < coupon.minOrder) return res.status(400).json({ message: `Minimum order of Rs. ${coupon.minOrder} required` });

    let discount = coupon.type === 'percentage'
      ? (orderTotal * coupon.value) / 100
      : coupon.value;

    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, orderTotal);

    res.json({ success: true, coupon, discount: Math.round(discount) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
