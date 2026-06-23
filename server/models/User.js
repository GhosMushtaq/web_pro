const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  phone:         { type: String },
  password:      { type: String, required: true, minlength: 6, select: false },
  role:          { type: String, enum: ['customer','admin','staff','finance','support'], default: 'customer' },
  avatar:        { url: String, cloudinary_id: String },
  address: [{
    label:    String,
    street:   String,
    city:     String,
    province: String,
    postal:   String,
    isDefault: { type: Boolean, default: false }
  }],
  wishlist:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isVerified:    { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
  otp:           String,
  otpExpiry:     Date,
  resetToken:    String,
  resetExpiry:   Date,
  lastLogin:     Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil:     Date,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
