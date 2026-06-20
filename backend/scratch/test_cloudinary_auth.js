const { cloudinary } = require('../config/cloudinary');

async function test() {
  try {
    console.log('Testing Cloudinary Admin API with current credentials...');
    const result = await cloudinary.api.resources({ max_results: 5 });
    console.log('Success! Connection works.');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error calling Cloudinary API:', error.message);
    if (error.error) {
      console.error('Details:', error.error);
    }
  }
}

test();
