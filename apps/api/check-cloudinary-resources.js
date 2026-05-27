const { v2: cloudinary } = require('cloudinary');
const dotenv = require('dotenv');
dotenv.config();

// Configure Cloudinary from the environment variable CLOUDINARY_URL
cloudinary.config({
  cloud_name: 'dpwkmt5kr',
  api_key: '588574244871288',
  api_secret: 'iIBcQz592b1VO0rCkiDndG8FoLM'
});

async function main() {
  try {
    console.log("Listing recent Cloudinary resources...");
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 30
    });
    console.log("Found resources:");
    result.resources.forEach(r => {
      console.log(`- ${r.public_id} (${r.secure_url})`);
    });
  } catch (err) {
    console.error("Cloudinary error:", err.message);
  }
}

main();
