# 🎁 GIFTING BLISS — COMPLETE PROJECT BLUEPRINT
### MERN Stack | E-Commerce + Full Management System | Pink Theme

---

## ⚠️ ANTIGRAVITY INSTRUCTIONS — READ FIRST
> **IMPORTANT**: Do NOT start coding until you have read this ENTIRE document. Build EVERYTHING in the exact order listed. Do NOT skip any section. Do NOT simplify anything. Follow every detail exactly.

---

## 📁 PROJECT STRUCTURE

```
gifting-bliss/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   │   ├── favicon.svg              # Pink gift box SVG favicon
│   │   └── logo.png
│   ├── src/
│   │   ├── animations/              # Framer Motion configs
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/              # Navbar, Footer, Loader, Modal
│   │   │   ├── shop/                # ProductCard, Cart, Checkout
│   │   │   ├── admin/               # All admin panels
│   │   │   ├── charts/              # All chart components
│   │   │   └── ui/                  # Buttons, Inputs, Badges
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/
│   │   │   ├── public/              # Home, Shop, Product, About, Contact
│   │   │   ├── auth/                # Login, Register, ForgotPassword
│   │   │   ├── customer/            # Dashboard, Orders, Profile, Wishlist
│   │   │   └── admin/               # All admin pages
│   │   ├── services/                # API call functions (axios)
│   │   ├── store/                   # Redux Toolkit slices
│   │   ├── utils/                   # Helpers, formatters, validators
│   │   ├── App.jsx
│   │   └── main.jsx
├── server/                          # Node.js + Express Backend
│   ├── config/
│   │   ├── db.js                    # MongoDB Atlas connection
│   │   └── cloudinary.js            # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── inventoryController.js
│   │   ├── userController.js
│   │   ├── staffController.js
│   │   ├── financeController.js
│   │   ├── supportController.js
│   │   ├── collectionController.js
│   │   ├── statsController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── roleCheck.js             # Role-based access
│   │   ├── rateLimiter.js           # API rate limiting
│   │   ├── errorHandler.js
│   │   └── upload.js                # Multer + Cloudinary upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Collection.js
│   │   ├── Payment.js
│   │   ├── Inventory.js
│   │   ├── Staff.js
│   │   ├── SupportTicket.js
│   │   ├── Review.js
│   │   ├── Coupon.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── userRoutes.js
│   │   ├── staffRoutes.js
│   │   ├── financeRoutes.js
│   │   ├── supportRoutes.js
│   │   ├── collectionRoutes.js
│   │   ├── statsRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   ├── sendEmail.js             # Nodemailer
│   │   ├── generateToken.js         # JWT
│   │   └── validators.js
│   ├── socket/
│   │   └── socketHandler.js         # Socket.io for real-time
│   ├── .env
│   ├── server.js
│   └── package.json
└── package.json                     # Root (for concurrent dev)
```

---

## 🎨 DESIGN SYSTEM — IMPLEMENT EXACTLY

```css
/* CSS Variables — Use These EVERYWHERE */
:root {
  /* Primary Pink Palette */
  --pink-50:  #FFF0F5;
  --pink-100: #FFD6E7;
  --pink-200: #FFB3D1;
  --pink-300: #FF85B3;
  --pink-400: #FF5C9A;
  --pink-500: #FF2D7A;   /* PRIMARY */
  --pink-600: #E0006A;
  --pink-700: #B8005A;
  --pink-800: #8F0047;
  --pink-900: #660033;

  /* Accent & Neutrals */
  --gold:     #F4C542;
  --rose:     #FFB4C8;
  --lavender: #E8D5FF;
  --cream:    #FFF8FC;
  --dark:     #1A0010;
  --text:     #3D001F;
  --muted:    #9B6B7E;
  --white:    #FFFFFF;

  /* Gradients */
  --grad-primary: linear-gradient(135deg, #FF2D7A 0%, #FF85B3 50%, #FFB4C8 100%);
  --grad-dark:    linear-gradient(135deg, #1A0010 0%, #3D001F 100%);
  --grad-gold:    linear-gradient(135deg, #F4C542 0%, #FFD700 100%);
  --grad-glass:   linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);

  /* Glassmorphism */
  --glass-bg:     rgba(255, 255, 255, 0.15);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 8px 32px rgba(255, 45, 122, 0.15);

  /* Shadows */
  --shadow-sm:  0 2px 8px rgba(255, 45, 122, 0.1);
  --shadow-md:  0 8px 24px rgba(255, 45, 122, 0.2);
  --shadow-lg:  0 16px 48px rgba(255, 45, 122, 0.3);
  --shadow-xl:  0 32px 80px rgba(255, 45, 122, 0.4);

  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-accent:  'Dancing Script', cursive;

  /* Spacing & Radius */
  --radius-sm:  8px;
  --radius-md:  16px;
  --radius-lg:  24px;
  --radius-xl:  32px;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast:   0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   0.6s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Google Fonts to Import:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=Dancing+Script:wght@600;700&display=swap" rel="stylesheet">
```

---

## 📦 DEPENDENCIES — INSTALL EXACTLY

### Client (React + Vite):
```bash
npm create vite@latest client -- --template react
cd client
npm install \
  axios \
  react-router-dom \
  @reduxjs/toolkit \
  react-redux \
  framer-motion \
  recharts \
  react-hot-toast \
  react-icons \
  react-image-gallery \
  react-slick \
  slick-carousel \
  react-dropzone \
  react-confetti \
  react-intersection-observer \
  react-countup \
  socket.io-client \
  @headlessui/react \
  react-helmet-async \
  date-fns \
  react-beautiful-dnd \
  react-select \
  react-otp-input \
  swiper
```

### Server (Node + Express):
```bash
mkdir server && cd server && npm init -y
npm install \
  express \
  mongoose \
  dotenv \
  cors \
  helmet \
  express-rate-limit \
  bcryptjs \
  jsonwebtoken \
  multer \
  multer-storage-cloudinary \
  cloudinary \
  nodemailer \
  socket.io \
  express-validator \
  morgan \
  compression \
  express-mongo-sanitize \
  xss-clean \
  hpp \
  cookie-parser \
  stripe
npm install --save-dev nodemon
```

---

## 🗄️ DATABASE MODELS — IMPLEMENT ALL

### 1. User Model (`server/models/User.js`):
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  phone:         { type: String },
  password:      { type: String, required: true, minlength: 8, select: false },
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
```

### 2. Product Model (`server/models/Product.js`):
```javascript
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
```

### 3. Collection Model (`server/models/Collection.js`):
```javascript
const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  slug:        { type: String, unique: true },
  description: String,
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

module.exports = mongoose.model('Collection', collectionSchema);
```

### 4. Order Model (`server/models/Order.js`):
```javascript
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
  paymentStatus: { type: String, enum: ['pending','proof_uploaded','verified','rejected','paid','refunded'], default: 'pending' },
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

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `GB-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
```

### 5. Payment Model (`server/models/Payment.js`):
```javascript
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
```

### 6. Inventory Model (`server/models/Inventory.js`):
```javascript
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
```

### 7. Support Ticket Model (`server/models/SupportTicket.js`):
```javascript
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail:   String,
  subject:      { type: String, required: true },
  category:     { type: String, enum: ['order','payment','product','shipping','returns','general'], default: 'general' },
  priority:     { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
  status:       { type: String, enum: ['open','assigned','in_progress','waiting','resolved','closed'], default: 'open' },
  messages: [{
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderRole: String,
    message:   String,
    attachments: [{ url: String, cloudinary_id: String }],
    sentAt:    { type: Date, default: Date.now }
  }],
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt:   Date,
  rating:       { type: Number, min: 1, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', ticketSchema);
```

### 8. Notification Model (`server/models/Notification.js`):
```javascript
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
```

### 9. Coupon Model:
```javascript
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:         { type: String, required: true, unique: true, uppercase: true },
  type:         { type: String, enum: ['percentage','fixed'], required: true },
  value:        { type: Number, required: true },
  minOrder:     { type: Number, default: 0 },
  maxDiscount:  Number,
  usageLimit:   Number,
  usedCount:    { type: Number, default: 0 },
  userLimit:    { type: Number, default: 1 },
  isActive:     { type: Boolean, default: true },
  expiresAt:    Date,
  applicableTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
```

### 10. Review Model:
```javascript
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  title:     String,
  comment:   String,
  images:    [{ url: String, cloudinary_id: String }],
  isApproved: { type: Boolean, default: false },
  isVerifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
```

---

## ☁️ CLOUDINARY + IMAGE UPLOAD SYSTEM

### `server/config/cloudinary.js`:
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

### `server/middleware/upload.js`:
```javascript
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const createStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:         `gifting-bliss/${folder}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' }],
    public_id:      `${Date.now()}-${file.originalname.split('.')[0]}`,
  }),
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB

module.exports = {
  uploadProduct:  multer({ storage: createStorage('products'), fileFilter, limits }),
  uploadAvatar:   multer({ storage: createStorage('avatars'), fileFilter, limits }),
  uploadProof:    multer({ storage: createStorage('payment-proofs'), fileFilter, limits }),
  uploadCollection: multer({ storage: createStorage('collections'), fileFilter, limits }),
  uploadReview:   multer({ storage: createStorage('reviews'), fileFilter, limits }),
  uploadSupport:  multer({ storage: createStorage('support'), fileFilter, limits }),
};
```

### `server/controllers/uploadController.js`:
```javascript
const cloudinary = require('../config/cloudinary');

// Upload image and return cloudinary URL + public_id
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({
      success: true,
      url:          req.file.path,
      cloudinary_id: req.file.filename,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Delete image from Cloudinary
exports.deleteImage = async (req, res) => {
  try {
    const { cloudinary_id } = req.body;
    await cloudinary.uploader.destroy(cloudinary_id);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};
```

---

## 🔐 AUTHENTICATION SYSTEM

### `server/middleware/auth.js`:
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: 'User not found or deactivated' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Role '${req.user.role}' is not authorized` });
  }
  next();
};
```

### `server/utils/generateToken.js`:
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

module.exports = generateToken;
```

---

## 💳 PAYMENT SYSTEM (COD + EasyPaisa + JazzCash)

### Payment Flow:

```
COD Flow:
Customer places order → Status: "pending" → Admin reviews → Admin approves → 
Status: "admin_approved" → Processing begins

EasyPaisa/JazzCash Flow:
Customer places order → Customer sends money manually → 
Customer uploads proof + Transaction ID → Status: "proof_uploaded" →
Finance team verifies → Finance marks verified → Status: "verified" → 
Admin sees auto-approved order → Processing begins

If Finance rejects:
Finance rejects with reason → Status: "rejected" → Customer notified
```

### `server/controllers/paymentController.js`:
```javascript
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// Customer uploads payment proof
exports.uploadPaymentProof = async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['easypaisa', 'jazzcash'].includes(order.paymentMethod)) {
      return res.status(400).json({ message: 'COD orders do not require proof' });
    }

    order.paymentProof = {
      url:           req.file.path,
      cloudinary_id: req.file.filename,
      transactionId,
      uploadedAt:    new Date()
    };
    order.paymentStatus = 'proof_uploaded';
    order.statusHistory.push({
      status:    'proof_uploaded',
      note:      `Payment proof uploaded. Transaction ID: ${transactionId}`,
      updatedBy: req.user._id
    });

    await order.save();

    // Create payment record
    await Payment.create({
      order: orderId, customer: req.user._id,
      method: order.paymentMethod, amount: order.total,
      status: 'proof_submitted', transactionId,
      proof: { url: req.file.path, cloudinary_id: req.file.filename }
    });

    // Notify finance team
    // [Emit socket event to finance dashboard]

    res.json({ success: true, message: 'Payment proof uploaded. Finance team will verify shortly.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Finance team verifies payment
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, action, rejectionReason } = req.body; // action: 'verify' | 'reject'
    const order = await Order.findById(orderId).populate('customer');
    const payment = await Payment.findOne({ order: orderId });

    if (!order || !payment) return res.status(404).json({ message: 'Order or payment not found' });

    if (action === 'verify') {
      order.paymentStatus = 'verified';
      order.orderStatus = 'admin_approved'; // Auto-approve after finance verification
      payment.status = 'verified';
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();

      order.statusHistory.push({
        status: 'payment_verified',
        note: 'Payment verified by finance team. Order auto-approved.',
        updatedBy: req.user._id
      });
    } else {
      order.paymentStatus = 'rejected';
      payment.status = 'rejected';
      payment.rejectionReason = rejectionReason;

      order.statusHistory.push({
        status: 'payment_rejected',
        note: `Payment rejected: ${rejectionReason}`,
        updatedBy: req.user._id
      });
    }

    await order.save();
    await payment.save();

    // Notify customer via socket + notification
    res.json({ success: true, message: `Payment ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin manually approves COD
exports.approveCOD = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentMethod !== 'cod') {
      return res.status(400).json({ message: 'This is not a COD order' });
    }

    order.paymentStatus = 'paid';
    order.orderStatus = 'admin_approved';
    order.statusHistory.push({
      status: 'admin_approved',
      note: 'COD order approved by admin',
      updatedBy: req.user._id
    });

    await order.save();
    res.json({ success: true, message: 'COD order approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 📊 STATS & CHARTS SYSTEM (Real-Time, Accurate)

### `server/controllers/statsController.js`:
```javascript
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');
const SupportTicket = require('../models/SupportTicket');
const Inventory = require('../models/Inventory');

// Dashboard Overview Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue, monthRevenue, lastMonthRevenue,
      totalOrders, pendingOrders, totalCustomers, newCustomers,
      totalProducts, lowStockProducts, openTickets
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: { $in: ['verified','paid'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: { $in: ['verified','paid'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: { $in: ['verified','paid'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: startOfMonth } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockAlert'] } }),
      SupportTicket.countDocuments({ status: { $in: ['open','in_progress'] } }),
    ]);

    const monthRev = monthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev * 100).toFixed(1) : 100;

    res.json({
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: monthRev,
        lastMonth: lastMonthRev,
        growth: parseFloat(revenueGrowth)
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomers
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      },
      support: { openTickets }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Revenue Chart (last 12 months)
exports.getRevenueChart = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['verified','paid'] }, createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders:  { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const formatted = data.map(d => ({
      month:   months[d._id.month - 1],
      year:    d._id.year,
      revenue: d.revenue,
      orders:  d.orders
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Order Status Distribution
exports.getOrderStatusChart = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: data.map(d => ({ status: d._id, count: d.count })) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Top Collections by Revenue
exports.getTopCollections = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'collections', localField: 'product.collection', foreignField: '_id', as: 'collection' } },
      { $unwind: '$collection' },
      { $group: {
        _id: '$collection._id',
        name:    { $first: '$collection.name' },
        revenue: { $sum: '$items.total' },
        sold:    { $sum: '$items.quantity' }
      }},
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Payment Methods Distribution
exports.getPaymentMethodsChart = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    res.json({ success: true, data: data.map(d => ({ method: d._id, count: d.count, total: d.total })) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Finance Team Stats
exports.getFinanceStats = async (req, res) => {
  try {
    const [
      pendingVerification, verifiedToday, rejectedTotal,
      totalVerified, totalEasypaisa, totalJazzcash, totalCOD
    ] = await Promise.all([
      Payment.countDocuments({ status: 'proof_submitted' }),
      Payment.countDocuments({ status: 'verified', verifiedAt: { $gte: new Date().setHours(0,0,0,0) } }),
      Payment.countDocuments({ status: 'rejected' }),
      Payment.aggregate([{ $match: { status: 'verified' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { method: 'easypaisa', status: 'verified' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { method: 'jazzcash', status: 'verified' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { method: 'cod' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.json({
      pendingVerification,
      verifiedToday,
      rejectedTotal,
      totalVerified:   totalVerified[0]?.total || 0,
      byMethod: {
        easypaisa: totalEasypaisa[0]?.total || 0,
        jazzcash:  totalJazzcash[0]?.total || 0,
        cod:       totalCOD[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 🔌 SOCKET.IO — REAL-TIME SYSTEM

### `server/socket/socketHandler.js`:
```javascript
module.exports = (io) => {
  // Online users tracking
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room based on role
    socket.on('join', ({ userId, role }) => {
      socket.join(userId);
      socket.join(`role:${role}`);
      onlineUsers.set(userId, socket.id);

      // Emit online count to admins
      io.to('role:admin').emit('onlineCount', onlineUsers.size);
    });

    // New order notification → notify admin + finance
    socket.on('newOrder', (order) => {
      io.to('role:admin').emit('orderUpdate', { type: 'new', order });
      if (['easypaisa','jazzcash'].includes(order.paymentMethod)) {
        io.to('role:finance').emit('orderUpdate', { type: 'new', order });
      }
    });

    // Payment proof uploaded → notify finance
    socket.on('proofUploaded', (data) => {
      io.to('role:finance').emit('paymentUpdate', { type: 'proof', ...data });
      io.to('role:admin').emit('paymentUpdate', { type: 'proof', ...data });
    });

    // Payment verified/rejected → notify customer
    socket.on('paymentVerified', ({ customerId, orderId, status }) => {
      io.to(customerId).emit('paymentUpdate', { status, orderId });
    });

    // Order status update → notify customer
    socket.on('orderStatusUpdate', ({ customerId, order }) => {
      io.to(customerId).emit('orderUpdate', { type: 'statusChange', order });
    });

    // New support ticket → notify support team
    socket.on('newTicket', (ticket) => {
      io.to('role:support').emit('ticketUpdate', { type: 'new', ticket });
    });

    // Low stock alert → notify admin + inventory
    socket.on('lowStock', (product) => {
      io.to('role:admin').emit('inventoryAlert', product);
      io.to('role:staff').emit('inventoryAlert', product);
    });

    socket.on('disconnect', () => {
      onlineUsers.forEach((sockId, userId) => {
        if (sockId === socket.id) onlineUsers.delete(userId);
      });
      io.to('role:admin').emit('onlineCount', onlineUsers.size);
    });
  });
};
```

---

## 🌐 SERVER ENTRY POINT

### `server/server.js`:
```javascript
const express  = require('express');
const mongoose = require('mongoose');
const http     = require('http');
const { Server } = require('socket.io');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss      = require('xss-clean');
const hpp      = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan   = require('morgan');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
});

// Attach io to app for use in controllers
app.set('io', io);

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

// Rate Limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use('/api',      rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Routes
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/products',    require('./routes/productRoutes'));
app.use('/api/collections', require('./routes/collectionRoutes'));
app.use('/api/orders',      require('./routes/orderRoutes'));
app.use('/api/payments',    require('./routes/paymentRoutes'));
app.use('/api/inventory',   require('./routes/inventoryRoutes'));
app.use('/api/users',       require('./routes/userRoutes'));
app.use('/api/staff',       require('./routes/staffRoutes'));
app.use('/api/finance',     require('./routes/financeRoutes'));
app.use('/api/support',     require('./routes/supportRoutes'));
app.use('/api/stats',       require('./routes/statsRoutes'));
app.use('/api/upload',      require('./routes/uploadRoutes'));

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error Handler
app.use(require('./middleware/errorHandler'));

// Socket Handler
require('./socket/socketHandler')(io);

// Database Connection + Start Server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });
```

---

## 📋 ENVIRONMENT VARIABLES

### `server/.env`:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/gifting-bliss?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key_min_32_chars_change_this
JWT_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Gifting Bliss <noreply@giftingbliss.com>

ADMIN_EMAIL=admin@giftingbliss.com
ADMIN_PASSWORD=Admin@GiftingBliss123
```

### `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=Gifting Bliss
```

---

## 🛍️ 35+ COLLECTIONS LIST (Seed These)

```javascript
const collections = [
  // Occasion-Based
  { name: 'Birthday Bliss',       emoji: '🎂', description: 'Perfect birthday gifts for everyone' },
  { name: 'Wedding Wonders',      emoji: '💍', description: 'Celebrate the special union' },
  { name: 'Anniversary Love',     emoji: '❤️',  description: 'Mark milestones with elegance' },
  { name: 'Baby Shower Joy',      emoji: '🍼', description: 'Adorable gifts for new arrivals' },
  { name: 'Graduation Glory',     emoji: '🎓', description: 'Celebrate achievements' },
  { name: 'Eid Mubarak',          emoji: '🌙', description: 'Festive Eid gift collections' },
  { name: 'Valentine\'s Day',     emoji: '💝', description: 'Express your love beautifully' },
  { name: 'Mother\'s Day Magic',  emoji: '🌸', description: 'Honor the special women in your life' },
  { name: 'Father\'s Day Finds',  emoji: '👔', description: 'Gifts dads actually love' },
  { name: 'New Year Wishes',      emoji: '🎆', description: 'Ring in the new year with gifts' },

  // Recipient-Based
  { name: 'For Her',              emoji: '👩', description: 'Thoughtful gifts for women' },
  { name: 'For Him',              emoji: '👨', description: 'Gifts crafted for men' },
  { name: 'For Kids',             emoji: '🧸', description: 'Delightful gifts for children' },
  { name: 'For Grandparents',     emoji: '👴', description: 'Show love to elders' },
  { name: 'For Besties',          emoji: '👯', description: 'Celebrate friendship' },
  { name: 'For Boss/Colleague',   emoji: '💼', description: 'Professional gifting done right' },
  { name: 'For Teachers',         emoji: '📚', description: 'Appreciate the educators' },
  { name: 'For Newlyweds',        emoji: '🏠', description: 'Help them build their new home' },

  // Product Type-Based
  { name: 'Luxury Gift Boxes',    emoji: '🎁', description: 'Premium curated gift boxes' },
  { name: 'Personalized Gifts',   emoji: '✍️',  description: 'Custom name & photo gifts' },
  { name: 'Flower & Chocolate',   emoji: '🌹', description: 'Classic romantic combos' },
  { name: 'Candles & Diffusers',  emoji: '🕯️',  description: 'Aromatherapy & ambiance' },
  { name: 'Jewelry & Accessories',emoji: '💎', description: 'Sparkle and shine' },
  { name: 'Spa & Wellness',       emoji: '🛁', description: 'Relaxation & self-care gifts' },
  { name: 'Snack & Gourmet',      emoji: '🍫', description: 'Delicious food gift baskets' },
  { name: 'Plants & Succulents',  emoji: '🌿', description: 'Living gifts that last' },
  { name: 'Books & Stationery',   emoji: '📖', description: 'For the readers & writers' },
  { name: 'Tech & Gadgets',       emoji: '📱', description: 'Modern gifts for tech lovers' },
  { name: 'Home Décor',           emoji: '🏡', description: 'Beautiful home accessories' },
  { name: 'Art & Prints',         emoji: '🎨', description: 'Framed art & wall decor' },

  // Special
  { name: 'Under Rs. 500',        emoji: '💰', description: 'Budget-friendly thoughtful gifts' },
  { name: 'Premium Collection',   emoji: '⭐', description: 'Our finest luxury offerings' },
  { name: 'Handmade & Artisan',   emoji: '🤲', description: 'Crafted with love locally' },
  { name: 'Digital Gift Cards',   emoji: '💳', description: 'Let them choose their joy' },
  { name: 'Corporate Gifting',    emoji: '🏢', description: 'Bulk & branded gift solutions' },
  { name: 'Eco-Friendly Gifts',   emoji: '🌱', description: 'Sustainable gifting choices' },
];
```

---

## 🖥️ FRONTEND PAGES — BUILD ALL IN ORDER

### PUBLIC PAGES:
1. **Home** — Hero (animated particles + floating gifts), Featured Collections (masonry grid), New Arrivals, Bestsellers, Stats counter, Testimonials, Newsletter
2. **Shop** — Filter sidebar (collection, price, rating), Product grid (35+ collections), Sort, Pagination, Search
3. **Product Detail** — Image gallery (zoom), Description, Reviews, Related products, Add to cart
4. **Collections** — All 35+ collections with beautiful cards
5. **About Us** — Brand story, Team, Mission
6. **Contact** — Contact form, WhatsApp link
7. **Track Order** — Order tracking by order number

### AUTH PAGES:
8. **Login** — Email/phone + password, Remember me
9. **Register** — Name, Email, Phone, Password
10. **Forgot Password** — Email OTP verification
11. **Reset Password**

### CUSTOMER DASHBOARD:
12. **My Dashboard** — Order summary, Recent orders, Quick links
13. **My Orders** — Order list, Status tracking with timeline, Upload payment proof
14. **Order Detail** — Full order info, Upload proof, Track status
15. **My Profile** — Edit info, Change password, Manage addresses
16. **Wishlist** — Saved products
17. **My Reviews** — Reviews given

### ADMIN DASHBOARD (role: admin):
18. **Admin Overview** — All KPI cards + charts
19. **Order Management** — All orders, Filter, COD approval, Status update
20. **Product Management** — Add/Edit/Delete products with Cloudinary image upload
21. **Collection Management** — Add/Edit/Delete 35+ collections
22. **User Management** — All users, Role change, Activate/Deactivate
23. **Staff Management** — Staff accounts, Permissions
24. **Coupon Management** — Create/Edit coupons
25. **Review Management** — Approve/Reject reviews
26. **Reports** — Downloadable reports
27. **Settings** — Site settings, Shipping fees, Email templates

### FINANCE DASHBOARD (role: finance):
28. **Finance Overview** — Revenue charts, Payment method breakdown
29. **Payment Verification** — Pending proofs queue, Verify/Reject with reason
30. **Order Management** — View & manage orders (limited)
31. **Financial Reports** — Monthly/Yearly revenue charts

### STAFF DASHBOARD (role: staff):
32. **Staff Overview** — Assigned orders
33. **Order Processing** — Pack, Ship, Out for delivery updates
34. **Inventory View** — Stock levels

### INVENTORY DASHBOARD (role: staff/admin):
35. **Inventory Overview** — Stock chart, Low stock alerts
36. **Inventory Log** — All stock movements
37. **Restock Management** — Add stock, Adjustment

### CUSTOMER SUPPORT DASHBOARD (role: support):
38. **Support Overview** — Open tickets, Priority breakdown
39. **Ticket Management** — View, Assign, Reply to tickets
40. **Live Chat Interface** — Real-time customer chat

---

## 🎯 REDUX STORE STRUCTURE

### `client/src/store/index.js`:
```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer       from './slices/authSlice';
import cartReducer       from './slices/cartSlice';
import productReducer    from './slices/productSlice';
import orderReducer      from './slices/orderSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer         from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    cart:         cartReducer,
    products:     productReducer,
    orders:       orderReducer,
    notifications: notificationReducer,
    ui:           uiReducer,
  },
});
```

---

## 🎬 ANIMATION SYSTEM (Heavy UI)

### Required Animations:
```javascript
// Install: npm install framer-motion

// 1. Page Transition (every page)
const pageVariants = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit:     { opacity: 0, y: -20 }
};

// 2. Staggered Card Grid (products, collections)
const containerVariants = {
  animate: { transition: { staggerChildren: 0.08 } }
};
const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'backOut' } }
};

// 3. Floating Gift Animation (Hero)
// Use CSS keyframe animation — floating up/down indefinitely

// 4. Counter Animation (Stats section)
// Use react-countup library

// 5. Pink Particle System (Hero background)
// Use canvas or CSS animation with pink dots floating

// 6. Glassmorphism Cards (all cards)
// backdrop-filter: blur(12px)

// 7. Hover Effects (Product cards)
// Scale 1.03, shadow increase, image zoom, add to cart slide up

// 8. Loading Skeleton (all data fetching)
// Pink shimmer skeleton screens

// 9. Toast Notifications
// react-hot-toast with pink theme

// 10. Modal Animations
// Framer Motion AnimatePresence

// 11. Chart Entrance Animations
// Recharts animation prop enabled

// 12. Navbar Scroll Effect
// Blur background + shadow on scroll

// 13. Confetti on Order Success
// react-confetti package

// 14. Ripple Effect on Buttons
// CSS ripple animation

// 15. Loading Spinner
// Custom pink circular spinner with GB branding
```

---

## 🔒 SECURITY CHECKLIST

- ✅ JWT tokens with 30d expiry, stored in httpOnly cookies
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Rate limiting on auth routes (20 req/15min)
- ✅ MongoDB injection prevention (express-mongo-sanitize)
- ✅ XSS protection (xss-clean)
- ✅ HTTP Parameter Pollution protection (hpp)
- ✅ Security headers (helmet)
- ✅ CORS configured for specific origin only
- ✅ File upload validation (type + size limits)
- ✅ Role-based access control (RBAC) on all routes
- ✅ Input validation with express-validator
- ✅ Account lockout after 5 failed login attempts
- ✅ OTP for email verification
- ✅ Admin actions logged in statusHistory

---

## 🚀 FAVICON & BRANDING

### SVG Favicon (`client/public/favicon.svg`):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF2D7A"/>
      <stop offset="100%" style="stop-color:#FF85B3"/>
    </linearGradient>
  </defs>
  <!-- Gift Box Body -->
  <rect x="15" y="45" width="70" height="45" rx="6" fill="url(#grad)"/>
  <!-- Gift Box Lid -->
  <rect x="10" y="35" width="80" height="18" rx="5" fill="#E0006A"/>
  <!-- Ribbon Vertical -->
  <rect x="44" y="35" width="12" height="55" rx="3" fill="#F4C542"/>
  <!-- Ribbon Horizontal -->
  <rect x="10" y="44" width="80" height="12" rx="3" fill="#F4C542"/>
  <!-- Bow Left -->
  <ellipse cx="35" cy="33" rx="16" ry="9" fill="#FFB4C8" transform="rotate(-30 35 33)"/>
  <!-- Bow Right -->
  <ellipse cx="65" cy="33" rx="16" ry="9" fill="#FFB4C8" transform="rotate(30 65 33)"/>
  <!-- Bow Center -->
  <circle cx="50" cy="35" r="7" fill="#FF2D7A"/>
</svg>
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile First */
/* xs: 0px+ */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
/* xl: 1280px+ */
/* 2xl: 1536px+ */

/* Use Tailwind CSS classes throughout */
/* Install: npm install -D tailwindcss postcss autoprefixer */
/* npx tailwindcss init -p */
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

1. **Image Lazy Loading** — `loading="lazy"` on all images
2. **Code Splitting** — React.lazy() + Suspense on all routes
3. **Memoization** — useMemo + useCallback on expensive components
4. **Virtual Scrolling** — For large product lists
5. **Debounced Search** — 300ms debounce on search input
6. **Optimistic Updates** — Cart operations update UI before API response
7. **Service Worker** — Cache static assets
8. **Compression** — Gzip enabled on Express
9. **MongoDB Indexes** — On slug, email, orderNumber, createdAt
10. **Redis Cache** — Optional: cache stats queries

### MongoDB Indexes to Create:
```javascript
// In your seed/migration script
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ collection: 1 });
db.products.createIndex({ isActive: 1, isFeatured: 1 });
db.products.createIndex({ createdAt: -1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ customer: 1, createdAt: -1 });
db.orders.createIndex({ orderStatus: 1, paymentStatus: 1 });
db.users.createIndex({ email: 1 }, { unique: true });
```

---

## 🏃 BUILD ORDER — FOLLOW EXACTLY

**Step 1:** Create project structure as shown above  
**Step 2:** Install ALL dependencies (server + client)  
**Step 3:** Set up `.env` files with your credentials  
**Step 4:** Build all 10 MongoDB models  
**Step 5:** Configure Cloudinary + upload middleware  
**Step 6:** Build auth system (JWT + bcrypt)  
**Step 7:** Build all controllers (start with auth, then products)  
**Step 8:** Build all routes with proper middleware  
**Step 9:** Set up Socket.io real-time system  
**Step 10:** Set up server.js with all middleware  
**Step 11:** Set up React project with Vite  
**Step 12:** Configure TailwindCSS + CSS variables  
**Step 13:** Set up Redux Toolkit store  
**Step 14:** Build all common components (Navbar, Footer, etc.)  
**Step 15:** Build public pages (Home, Shop, Product)  
**Step 16:** Build auth pages  
**Step 17:** Build customer dashboard  
**Step 18:** Build admin dashboard + all charts  
**Step 19:** Build finance dashboard  
**Step 20:** Build staff + inventory dashboards  
**Step 21:** Build support dashboard  
**Step 22:** Seed 35+ collections + sample products  
**Step 23:** Test all flows end-to-end  
**Step 24:** Add animations + loading states  
**Step 25:** Performance optimization + final review  

---

## 📝 CONCURRENT DEV SCRIPT

### Root `package.json`:
```json
{
  "name": "gifting-bliss",
  "scripts": {
    "dev": "concurrently \"cd server && npm run dev\" \"cd client && npm run dev\"",
    "build": "cd client && npm run build",
    "start": "cd server && npm start"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

### Server `package.json` scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node scripts/seed.js"
  }
}
```

---

*Document prepared for Gifting Bliss — MERN Stack E-Commerce + Management System*  
*Pink Theme | Cloudinary Images | MongoDB Atlas | Real-Time Socket.io*  
*Version 1.0 — Complete Blueprint*
