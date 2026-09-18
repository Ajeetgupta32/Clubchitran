import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Parse individual keys or CLOUDINARY_URL if provided
let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
let apiKey = process.env.CLOUDINARY_API_KEY;
let apiSecret = process.env.CLOUDINARY_API_SECRET;

if ((!cloudName || !apiKey || !apiSecret) && process.env.CLOUDINARY_URL) {
  try {
    // format: cloudinary://api_key:api_secret@cloud_name
    const parsed = new URL(process.env.CLOUDINARY_URL);
    apiKey = parsed.username;
    apiSecret = parsed.password;
    cloudName = parsed.hostname;
  } catch (e) {
    console.warn('[Cloudinary] Could not parse CLOUDINARY_URL:', e.message);
  }
}

const isCloudinaryConfigured = Boolean(
  cloudName && apiKey && apiSecret && cloudName !== 'your_cloud_name'
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log('[Cloudinary] Configured successfully with cloud:', cloudName);
} else {
  console.log('[Cloudinary] API keys not detected or incomplete. Using local disk upload fallback for images.');
}

export { cloudinary, isCloudinaryConfigured };
