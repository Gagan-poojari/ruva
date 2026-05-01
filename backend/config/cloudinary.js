const cloudinaryModule = require('cloudinary');
const cloudinaryStorageModule = require('multer-storage-cloudinary');
const CloudinaryStorage =
  cloudinaryStorageModule.CloudinaryStorage || cloudinaryStorageModule;
const multer = require('multer');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const cloudinary = cloudinaryModule.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideoByMime = file.mimetype && file.mimetype.startsWith('video/');
    const isVideoByName = /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(file.originalname || '');
    const isVideo = isVideoByMime || isVideoByName;
    return {
      folder: 'saree-shop',
      resource_type: isVideo ? 'video' : 'image',
      // Only apply image transformations if it's an image
      transformation: isVideo ? [] : [{ width: 1200, crop: 'limit' }],
      // Remove format restrictions to avoid "Invalid image file"
      allowed_formats: undefined,
    };
  },
});

const parser = multer({ 
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
});

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
  limits: { 
    fileSize: 40 * 1024 * 1024, // 40MB
    fieldSize: 40 * 1024 * 1024 // 40MB
  },
});

module.exports = { cloudinary, parser, submissionDiskParser };