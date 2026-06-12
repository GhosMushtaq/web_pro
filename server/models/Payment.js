const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order:          { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method:         { type: String, enum: ['cod','easypaisa','jazzcash'], required: true },
  amount:         { type: Number, required: true },
  status:         { type: String, enum: ['pending','proof_submitted','verified','rejected','refunded'], default: 'pending' },
  transactionId:  String,
  proof: {
    url:           String,
    cloudinary_id: String
  },
  verifiedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt:     Date,
  rejectionReason: String,
  notes:          String,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
