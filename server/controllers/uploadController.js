const cloudinary = require('../config/cloudinary');

// Upload image and return cloudinary URL + public_id
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({
      success: true,
      url: req.file.path,
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
    if (!cloudinary_id) return res.status(400).json({ message: 'Cloudinary ID required' });
    await cloudinary.uploader.destroy(cloudinary_id);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};
