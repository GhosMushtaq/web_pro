const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  // Basic Info
  companyName:   { type: String, required: true, trim: true },
  contactPerson: { type: String, trim: true },
  email:         { type: String, trim: true, lowercase: true },
  phone:         { type: String, trim: true },
  address:       { type: String, trim: true },
  category:      { type: String, default: 'General', trim: true },
  taxId:         { type: String, trim: true },
  status:        { type: String, enum: ['active', 'inactive', 'blacklisted'], default: 'active' },
  rating:        { type: Number, min: 1, max: 5, default: 3 },
  creditLimit:   { type: Number, default: 0 },
  paymentTerms:  { type: String, default: 'Advance', trim: true },
  notes:         { type: String, trim: true },
  tags:          [{ type: String }],

  // Bank Details
  bankName:      { type: String, trim: true },
  accountTitle:  { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  iban:          { type: String, trim: true },

  // Payment History
  paymentHistory: [{
    amount:    { type: Number, required: true },
    date:      { type: Date, default: Date.now },
    method:    { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online'], default: 'Bank Transfer' },
    reference: { type: String },
    status:    { type: String, enum: ['paid', 'pending', 'failed'], default: 'paid' },
    note:      { type: String }
  }],

  // Purchase Order History
  orderHistory: [{
    orderRef:         { type: String },
    items: [{
      productName: String,
      qty:         Number,
      unitCost:    Number
    }],
    totalAmount:      { type: Number, default: 0 },
    orderedAt:        { type: Date, default: Date.now },
    expectedDelivery: { type: Date },
    deliveredAt:      { type: Date },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'received', 'cancelled'],
      default: 'pending'
    },
    note: { type: String }
  }],

  // Deals & Contracts
  dealHistory: [{
    title:     { type: String, required: true },
    startDate: { type: Date },
    endDate:   { type: Date },
    value:     { type: Number, default: 0 },
    terms:     { type: String },
    status:    { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    note:      { type: String }
  }],

  // Deadlines
  deadlines: [{
    title:   { type: String, required: true },
    dueDate: { type: Date, required: true },
    type:    { type: String, default: 'general' },
    status:  { type: String, enum: ['pending', 'done', 'missed'], default: 'pending' },
    note:    { type: String }
  }],

  // Activity Log
  activityLog: [{
    date:  { type: Date, default: Date.now },
    type:  { type: String, enum: ['note', 'warning', 'deal', 'payment', 'order', 'general'], default: 'general' },
    note:  { type: String },
    by:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
