const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');

router.post('/', protect, authorize('admin', 'staff'), uploadProduct.single('image'), uploadImage);
router.delete('/', protect, authorize('admin', 'staff'), deleteImage);

module.exports = router;
