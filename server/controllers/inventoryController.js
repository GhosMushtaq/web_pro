const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// @desc    Get inventory logs
// @route   GET /api/inventory
exports.getInventoryLogs = async (req, res) => {
  try {
    const { product, action, page = 1, limit = 20 } = req.query;
    const query = {};
    if (product) query.product = product;
    if (action) query.action = action;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      Inventory.find(query)
        .populate('product', 'name sku images')
        .populate('performedBy', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Inventory.countDocuments(query)
    ]);

    res.json({ success: true, logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get low stock products
// @route   GET /api/inventory/low-stock
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockAlert'] }
    }).populate('collection', 'name').sort({ stock: 1 });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Adjust stock
// @route   POST /api/inventory/adjust
exports.adjustStock = async (req, res) => {
  try {
    const { productId, action, quantity, note } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const previousStock = product.stock;
    let newStock = previousStock;

    if (action === 'restock') newStock += Number(quantity);
    else if (action === 'adjustment') newStock = Number(quantity);
    else if (action === 'damage') newStock -= Number(quantity);
    else if (action === 'return') newStock += Number(quantity);

    if (newStock < 0) return res.status(400).json({ message: 'Stock cannot go below 0' });

    product.stock = newStock;
    await product.save();

    await Inventory.create({
      product: productId,
      action,
      quantity: Math.abs(newStock - previousStock),
      previousStock,
      newStock,
      note,
      performedBy: req.user._id
    });

    // Low stock alert
    if (newStock <= product.lowStockAlert) {
      const io = req.app.get('io');
      if (io) io.to('role:admin').emit('inventoryAlert', { product: product.name, stock: newStock });
    }

    res.json({ success: true, product, message: 'Stock adjusted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stock overview
// @route   GET /api/inventory/overview
exports.getStockOverview = async (req, res) => {
  try {
    const [totalProducts, outOfStock, lowStock, healthyStock] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, stock: 0 }),
      Product.countDocuments({ isActive: true, stock: { $gt: 0 }, $expr: { $lte: ['$stock', '$lowStockAlert'] } }),
      Product.countDocuments({ isActive: true, $expr: { $gt: ['$stock', '$lowStockAlert'] } }),
    ]);

    res.json({ success: true, totalProducts, outOfStock, lowStock, healthyStock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
