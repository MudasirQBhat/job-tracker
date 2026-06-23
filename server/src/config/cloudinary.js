const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

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

// MOVED UP: config must be called before CloudinaryStorage is initialized
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let storage;

if (hasCloudinaryConfig) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'job-tracker/resumes',
      resource_type: 'raw',
      allowed_formats: ['pdf'],
      public_id: (req, file) => `resume_${req.user.id}_${Date.now()}`
    }
  });
} else {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Cloudinary must be configured in production. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'
    );
  }

  const uploadDir = path.resolve(__dirname, '../../uploads/resumes');
  fs.mkdirSync(uploadDir, { recursive: true });

  storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      cb(null, `resume_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
    }
  });
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { cloudinary, upload, hasCloudinaryConfig };