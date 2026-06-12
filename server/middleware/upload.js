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
  uploadProduct:    multer({ storage: createStorage('products'), fileFilter, limits }),
  uploadAvatar:     multer({ storage: createStorage('avatars'), fileFilter, limits }),
  uploadProof:      multer({ storage: createStorage('payment-proofs'), fileFilter, limits }),
  uploadCollection: multer({ storage: createStorage('collections'), fileFilter, limits }),
  uploadReview:     multer({ storage: createStorage('reviews'), fileFilter, limits }),
  uploadSupport:    multer({ storage: createStorage('support'), fileFilter, limits }),
};
