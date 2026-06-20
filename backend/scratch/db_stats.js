const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Review = require('../models/Review');
const UserSubmission = require('../models/UserSubmission');

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const productCount = await Product.countDocuments();
    const reviewCount = await Review.countDocuments();
    const submissionCount = await UserSubmission.countDocuments();

    console.log(`\n--- DB Stats ---`);
    console.log(`Total Products: ${productCount}`);
    console.log(`Total Reviews: ${reviewCount}`);
    console.log(`Total Submissions: ${submissionCount}`);

    // Count product images
    const products = await Product.find({}, 'images colorVariants');
    let prodImageUrls = [];
    products.forEach(p => {
      if (p.images && p.images.length > 0) {
        p.images.forEach(img => {
          if (img.url) prodImageUrls.push(img.url);
        });
      }
      if (p.colorVariants && p.colorVariants.length > 0) {
        p.colorVariants.forEach(v => {
          if (v.images && v.images.length > 0) {
            v.images.forEach(img => {
              if (img.url) prodImageUrls.push(img.url);
            });
          }
        });
      }
    });

    console.log(`\nProduct Image URLs found: ${prodImageUrls.length}`);
    const uniqueProdUrls = [...new Set(prodImageUrls)];
    console.log(`Unique Product Image URLs: ${uniqueProdUrls.length}`);

    // Count review images
    const reviews = await Review.find({}, 'mediaUrl');
    let reviewUrls = reviews.map(r => r.mediaUrl).filter(Boolean);
    console.log(`Review Media URLs found: ${reviewUrls.length}`);

    // Count submissions
    const submissions = await UserSubmission.find({}, 'mediaUrl');
    let submissionUrls = submissions.map(s => s.mediaUrl).filter(Boolean);
    console.log(`Submission Media URLs found: ${submissionUrls.length}`);

    const allUrls = [...uniqueProdUrls, ...reviewUrls, ...submissionUrls];
    const uniqueAllUrls = [...new Set(allUrls)];
    console.log(`Total unique media URLs across all models: ${uniqueAllUrls.length}`);

    // Check how many are cloudinary
    const cloudinaryUrls = uniqueAllUrls.filter(url => url.includes('cloudinary.com'));
    console.log(`Cloudinary URLs: ${cloudinaryUrls.length}`);

    // Let's print first few to see cloud name
    if (cloudinaryUrls.length > 0) {
      console.log('Sample Cloudinary URLs:');
      console.log(cloudinaryUrls.slice(0, 5));
    }

  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
