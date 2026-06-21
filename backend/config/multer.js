const multer = require('multer');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

/**
 * For user submissions, avoid uploading directly inside Multer.
 * Instead, write to a temp file on disk, and upload in the controller.
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

module.exports = { submissionDiskParser };
