const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  slug:        { type: String, unique: true },
  description: String,
  emoji:       String,
  image: {
    url:           String,
    cloudinary_id: String
  },
  banner: {
    url:           String,
    cloudinary_id: String
  },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  sortOrder:   { type: Number, default: 0 },
  productCount: { type: Number, default: 0 },
}, { timestamps: true });

collectionSchema.pre('save', function() {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
});

module.exports = mongoose.model('Collection', collectionSchema);
