const Review  = require('../models/Review');
const Product = require('../models/Product');

// @desc  Get all reviews (admin) with filters
// @route GET /api/reviews
exports.getAllReviews = async (req, res) => {
  try {
    const { status, rating, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status === 'approved')   query.isApproved = true;
    if (status === 'pending')    query.isApproved = false;
    if (rating)                  query.rating = Number(rating);

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('product', 'name images slug')
        .populate('customer', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(query)
    ]);

    res.json({ success: true, reviews, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Approve / reject a review
// @route PUT /api/reviews/:id/approve
exports.approveReview = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate('product', 'name').populate('customer', 'name');

    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Recalculate product rating
    const productReviews = await Review.find({ product: review.product._id, isApproved: true });
    const avgRating = productReviews.length
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
      : 0;
    await Product.findByIdAndUpdate(review.product._id, {
      'ratings.average': Math.round(avgRating * 10) / 10,
      'ratings.count': productReviews.length
    });

    res.json({ success: true, review, message: isApproved ? 'Review approved' : 'Review rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a review
// @route DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Recalculate product rating
    const productReviews = await Review.find({ product: review.product, isApproved: true });
    const avgRating = productReviews.length
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
      : 0;
    await Product.findByIdAndUpdate(review.product, {
      'ratings.average': Math.round(avgRating * 10) / 10,
      'ratings.count': productReviews.length
    });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Customer submits a review
// @route POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    const existing = await Review.findOne({ product: productId, customer: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

    const review = await Review.create({
      product: productId,
      customer: req.user._id,
      rating, title, comment,
      isVerifiedPurchase: false
    });

    res.status(201).json({ success: true, review, message: 'Review submitted and pending approval' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get reviews for a product (public)
// @route GET /api/reviews/product/:productId
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Toggle feature a review on home page
// @route PUT /api/reviews/:id/feature
exports.toggleFeatureReview = async (req, res) => {
  try {
    const { isFeatured } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isFeatured },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ success: true, review, message: isFeatured ? 'Review featured on homepage' : 'Review removed from homepage' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get featured reviews for homepage
// @route GET /api/reviews/featured
exports.getFeaturedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true, isFeatured: true })
      .populate('customer', 'name avatar')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .limit(6);
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
