const Collection = require('../models/Collection');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all collections
// @route   GET /api/collections
exports.getCollections = async (req, res) => {
  try {
    const { active, featured } = req.query;
    const query = {};
    if (active === 'true') query.isActive = true;
    if (featured === 'true') query.isFeatured = true;

    const collections = await Collection.find(query).sort({ sortOrder: 1, name: 1 }).lean();
    res.json({ success: true, collections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single collection by slug
// @route   GET /api/collections/:slug
exports.getCollectionBySlug = async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug, isActive: true });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });
    res.json({ success: true, collection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create collection
// @route   POST /api/collections
exports.createCollection = async (req, res) => {
  try {
    const { name, description, emoji, isActive, isFeatured, sortOrder } = req.body;

    const image = req.files?.image?.[0] ? {
      url: req.files.image[0].path,
      cloudinary_id: req.files.image[0].filename
    } : undefined;

    const banner = req.files?.banner?.[0] ? {
      url: req.files.banner[0].path,
      cloudinary_id: req.files.banner[0].filename
    } : undefined;

    const collection = await Collection.create({
      name, description, emoji, isActive, isFeatured, sortOrder,
      ...(image && { image }),
      ...(banner && { banner })
    });

    res.status(201).json({ success: true, collection, message: 'Collection created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update collection
// @route   PUT /api/collections/:id
exports.updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    const updates = { ...req.body };

    if (req.files?.image?.[0]) {
      if (collection.image?.cloudinary_id) {
        await cloudinary.uploader.destroy(collection.image.cloudinary_id);
      }
      updates.image = { url: req.files.image[0].path, cloudinary_id: req.files.image[0].filename };
    }

    if (req.files?.banner?.[0]) {
      if (collection.banner?.cloudinary_id) {
        await cloudinary.uploader.destroy(collection.banner.cloudinary_id);
      }
      updates.banner = { url: req.files.banner[0].path, cloudinary_id: req.files.banner[0].filename };
    }

    const updated = await Collection.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, collection: updated, message: 'Collection updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete collection
// @route   DELETE /api/collections/:id
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    const productCount = await Product.countDocuments({ collection: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ message: `Cannot delete — ${productCount} products belong to this collection` });
    }

    if (collection.image?.cloudinary_id) await cloudinary.uploader.destroy(collection.image.cloudinary_id);
    if (collection.banner?.cloudinary_id) await cloudinary.uploader.destroy(collection.banner.cloudinary_id);

    await collection.deleteOne();
    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product count for collection
exports.updateProductCount = async (collectionId) => {
  const count = await Product.countDocuments({ collection: collectionId, isActive: true });
  await Collection.findByIdAndUpdate(collectionId, { productCount: count });
};
