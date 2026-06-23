const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  slug:          { type: String, unique: true },
  description:   { type: String, required: true },
  shortDesc:     String,
  price:         { type: Number, required: true, min: 0 },
  salePrice:     { type: Number, min: 0 },
  onSale:        { type: Boolean, default: false },
  images: [{
    url:           { type: String, required: true },
    cloudinary_id: { type: String, required: true },
    isPrimary:     { type: Boolean, default: false }
  }],
  collection:    { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true },
  tags:          [String],
  sku:           { type: String, unique: true },
  stock:         { type: Number, required: true, default: 0 },
  lowStockAlert: { type: Number, default: 5 },
  weight:        Number,
  dimensions:    { length: Number, width: Number, height: Number },
  isActive:      { type: Boolean, default: true },
  isFeatured:    { type: Boolean, default: false },
  isNew:         { type: Boolean, default: true },
  isBestseller:  { type: Boolean, default: false },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0 }
  },
  reviews:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  soldCount:     { type: Number, default: 0 },
  viewCount:     { type: Number, default: 0 },
  metaTitle:     String,
  metaDesc:      String,
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
