const cloudinary = require('cloudinary');
const cloudinaryStorageModule = require('multer-storage-cloudinary');
const CloudinaryStorage =
  cloudinaryStorageModule.CloudinaryStorage || cloudinaryStorageModule;
const multer = require('multer');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'saree-shop',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, crop: 'limit' }],
  },
});

const parser = multer({ storage: storage });
/**
 * For user submissions, avoid uploading to Cloudinary inside Multer.
 * Cloudinary backpressure can stall the client upload at low %.
 * Instead, write to a temp file and upload in the controller.
 */
const submissionDiskParser = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '');
      const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
      cb(null, `ruva_submission_${id}${ext}`);
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

module.exports = { cloudinary, parser, submissionDiskParser };
