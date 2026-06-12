const express = require('express');
const router = express.Router();
const {
  getCollections, getCollectionBySlug, createCollection,
  updateCollection, deleteCollection
} = require('../controllers/collectionController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCollection } = require('../middleware/upload');

const upload = uploadCollection.fields([
  { name: 'image', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

router.get('/', getCollections);
router.get('/:slug', getCollectionBySlug);
router.post('/', protect, authorize('admin'), upload, createCollection);
router.put('/:id', protect, authorize('admin'), upload, updateCollection);
router.delete('/:id', protect, authorize('admin'), deleteCollection);

module.exports = router;
