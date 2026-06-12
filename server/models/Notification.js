const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, enum: ['order','payment','inventory','support','system','promo'], required: true },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  link:       String,
  isRead:     { type: Boolean, default: false },
  icon:       String,
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
