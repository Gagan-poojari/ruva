const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const https = require('https');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Review = require('../models/Review');
const UserSubmission = require('../models/UserSubmission');

const BACKUP_DIR = path.join(__dirname, 'backup_uploads');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode} for ${url}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // delete the file async if error
      reject(err);
    });
  });
}

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const products = await Product.find({}, 'images colorVariants');
    const reviews = await Review.find({}, 'mediaUrl');
    const submissions = await UserSubmission.find({}, 'mediaUrl');

    let allUrls = [];

    products.forEach(p => {
      if (p.images) {
        p.images.forEach(img => {
          if (img.url && img.url.includes('cloudinary.com')) allUrls.push(img.url);
        });
      }
      if (p.colorVariants) {
        p.colorVariants.forEach(v => {
          if (v.images) {
            v.images.forEach(img => {
              if (img.url && img.url.includes('cloudinary.com')) allUrls.push(img.url);
            });
          }
        });
      }
    });

    reviews.forEach(r => {
      if (r.mediaUrl && r.mediaUrl.includes('cloudinary.com')) allUrls.push(r.mediaUrl);
    });

    submissions.forEach(s => {
      if (s.mediaUrl && s.mediaUrl.includes('cloudinary.com')) allUrls.push(s.mediaUrl);
    });

    const uniqueUrls = [...new Set(allUrls)];
    console.log(`Found ${uniqueUrls.length} unique Cloudinary URLs to backup.`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < uniqueUrls.length; i++) {
      const url = uniqueUrls[i];
      // Create a filename from the url
      // Example: https://res.cloudinary.com/dm1aupgoy/image/upload/v1778300312/saree-shop/calccpcoixgbfv46drpe.jpg
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const destPath = path.join(BACKUP_DIR, filename);

      try {
        console.log(`[${i + 1}/${uniqueUrls.length}] Downloading ${filename}...`);
        await downloadFile(url, destPath);
        successCount++;
      } catch (err) {
        console.error(`Failed to download ${url}:`, err.message);
        failCount++;
      }
    }

    console.log(`\nBackup summary:`);
    console.log(`Successfully backed up: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Files saved to: ${BACKUP_DIR}`);

  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
