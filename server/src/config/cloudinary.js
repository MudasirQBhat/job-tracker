const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const cloudinaryPlaceholders = new Set([
  '',
  'your_cloudinary_cloud_name',
  'your_cloudinary_api_key',
  'your_cloudinary_api_secret'
]);

const hasCloudinaryConfig = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET
].every((value) => value && !cloudinaryPlaceholders.has(value));

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { cloudinary, upload, hasCloudinaryConfig };