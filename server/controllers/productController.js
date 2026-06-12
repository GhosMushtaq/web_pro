const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products (with filters)
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      collection, minPrice, maxPrice, search, sort,
      rating, page = 1, limit = 12, featured, newArrivals, bestseller
    } = req.query;

    const query = { isActive: true };

    if (collection) query.collection = collection;
    if (featured === 'true') query.isFeatured = true;
    if (newArrivals === 'true') query.isNew = true;
    if (bestseller === 'true') query.isBestseller = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (rating) query['ratings.average'] = { $gte: Number(rating) };

    const sortOptions = {
      'newest': { createdAt: -1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      'popular': { soldCount: -1 },
      'rating': { 'ratings.average': -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('collection', 'name slug')
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('collection', 'name slug')
      .populate({ path: 'reviews', populate: { path: 'customer', select: 'name avatar' }, match: { isApproved: true } });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Increment view count
    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID (Admin)
// @route   GET /api/products/id/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('collection', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { name, description, shortDesc, price, salePrice, onSale, collection,
      tags, sku, stock, lowStockAlert, weight, dimensions, isActive, isFeatured, isNew, isBestseller, metaTitle, metaDesc } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map((f, i) => ({
      url: f.path,
      cloudinary_id: f.filename,
      isPrimary: i === 0
    })) : [];

    const product = await Product.create({
      name, description, shortDesc, price, salePrice, onSale, collection,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      sku, stock, lowStockAlert, weight, dimensions, isActive, isFeatured, isNew, isBestseller,
      images, metaTitle, metaDesc
    });

    // Log inventory creation
    await Inventory.create({
      product: product._id,
      action: 'restock',
      quantity: stock,
      previousStock: 0,
      newStock: stock,
      note: 'Initial stock on product creation',
      performedBy: req.user._id
    });

    res.status(201).json({ success: true, product, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const updates = { ...req.body };
    if (req.body.tags && typeof req.body.tags === 'string') {
      updates.tags = req.body.tags.split(',').map(t => t.trim());
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f, i) => ({
        url: f.path,
        cloudinary_id: f.filename,
        isPrimary: i === 0 && product.images.length === 0
      }));
      updates.images = [...product.images, ...newImages];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, product: updated, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/image/:cloudinary_id
exports.deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const cloudinaryId = decodeURIComponent(req.params.cloudinary_id);
    await cloudinary.uploader.destroy(cloudinaryId);

    product.images = product.images.filter(img => img.cloudinary_id !== cloudinaryId);
    // Set new primary if needed
    if (product.images.length > 0 && !product.images.some(i => i.isPrimary)) {
      product.images[0].isPrimary = true;
    }
    await product.save();

    res.json({ success: true, message: 'Image deleted', images: product.images });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete images from Cloudinary
    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.cloudinary_id);
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured + new arrivals + bestsellers
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res) => {
  try {
    const [featured, newArrivals, bestsellers] = await Promise.all([
      Product.find({ isActive: true, isFeatured: true }).limit(8).populate('collection', 'name').lean(),
      Product.find({ isActive: true, isNew: true }).sort({ createdAt: -1 }).limit(8).populate('collection', 'name').lean(),
      Product.find({ isActive: true, isBestseller: true }).sort({ soldCount: -1 }).limit(8).populate('collection', 'name').lean(),
    ]);
    res.json({ success: true, featured, newArrivals, bestsellers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
