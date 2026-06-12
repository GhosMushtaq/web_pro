const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  action:        { type: String, enum: ['restock','sale','adjustment','return','damage'], required: true },
  quantity:      { type: Number, required: true },
  previousStock: Number,
  newStock:      Number,
  note:          String,
  performedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reference:     String,
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
