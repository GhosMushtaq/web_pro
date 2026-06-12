const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:         { type: String, required: true, unique: true, uppercase: true },
  type:         { type: String, enum: ['percentage','fixed'], required: true },
  value:        { type: Number, required: true },
  minOrder:     { type: Number, default: 0 },
  maxDiscount:  Number,
  usageLimit:   Number,
  usedCount:    { type: Number, default: 0 },
  userLimit:    { type: Number, default: 1 },
  isActive:     { type: Boolean, default: true },
  expiresAt:    Date,
  applicableTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
