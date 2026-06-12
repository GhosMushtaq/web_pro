const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  title:     String,
  comment:   String,
  images:    [{ url: String, cloudinary_id: String }],
  isApproved: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isVerifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
