const mongoose = require('mongoose');

// Single-document settings store — we always upsert the document with key: 'main'
const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  store: {
    name:           { type: String, default: 'Gifting Bliss' },
    tagline:        { type: String, default: 'Perfect Gifts for Every Occasion' },
    email:          { type: String, default: 'hello@giftingbliss.com' },
    phone:          { type: String, default: '+92 300 0000000' },
    address:        { type: String, default: 'Karachi, Pakistan' },
    currency:       { type: String, default: 'PKR' },
    currencySymbol: { type: String, default: 'Rs.' },
    timezone:       { type: String, default: 'Asia/Karachi' },
    language:       { type: String, default: 'en' },
  },
  delivery: {
    freeDeliveryThreshold: { type: Number, default: 2000 },
    standardFee:           { type: Number, default: 200 },
    expressMultiplier:     { type: Number, default: 1.5 },
    codAvailable:          { type: Boolean, default: true },
    codFee:                { type: Number, default: 100 },
    estimatedDays:         { type: String, default: '3–5' },
    expressEstimatedDays:  { type: String, default: '1–2' },
  },
  notifications: {
    orderConfirmation: { type: Boolean, default: true },
    shipmentUpdate:    { type: Boolean, default: true },
    paymentReceipt:    { type: Boolean, default: true },
    lowStockAlert:     { type: Boolean, default: true },
    lowStockThreshold: { type: Number,  default: 5 },
    adminEmail:        { type: String,  default: 'admin@giftingbliss.com' },
  },
  social: {
    instagram: { type: String, default: '' },
    facebook:  { type: String, default: '' },
    whatsapp:  { type: String, default: '' },
    tiktok:    { type: String, default: '' },
  },
  payment: {
    easypaisaNumber: { type: String, default: '' },
    jazzcashNumber:  { type: String, default: '' },
    bankName:        { type: String, default: '' },
    bankAccount:     { type: String, default: '' },
    bankTitle:       { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
