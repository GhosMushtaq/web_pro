const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber:  { type: String, unique: true },
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:       String,
    image:      String,
    price:      Number,
    quantity:   { type: Number, required: true, min: 1 },
    total:      Number
  }],
  shippingAddress: {
    name:     String,
    phone:    String,
    street:   String,
    city:     String,
    province: String,
    postal:   String
  },
  subtotal:     { type: Number, required: true },
  shippingFee:  { type: Number, default: 0 },
  discount:     { type: Number, default: 0 },
  couponCode:   String,
  total:        { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'easypaisa', 'jazzcash'], required: true },
  paymentStatus: { type: String, enum: ['pending','proof_uploaded','proof_submitted','verified','rejected','paid','refunded'], default: 'pending' },
  paymentProof: {
    url:           String,
    cloudinary_id: String,
    transactionId: String,
    uploadedAt:    Date
  },
  orderStatus:  {
    type: String,
    enum: ['pending','admin_approved','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned'],
    default: 'pending'
  },
  statusHistory: [{
    status:    String,
    note:      String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  notes:        String,
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  estimatedDelivery: Date,
  deliveredAt:  Date,
  cancelledAt:  Date,
  cancelReason: String,
}, { timestamps: true });

orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `GB-${String(count + 1).padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
