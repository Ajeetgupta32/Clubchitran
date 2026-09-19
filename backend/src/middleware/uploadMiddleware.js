import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists directly on this device as fallback
export const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Check if Cloudinary is configured via environment variables
export const isCloudinaryActive = () => {
  return !!(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
};

// Initialize Cloudinary when credentials exist
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Multer disk storage: stores uploaded images locally on device
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${cleanOriginalName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPG, PNG, WEBP) are allowed!'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter
});

/**
 * Normalizes uploaded file metadata for database persistence.
 * If Cloudinary credentials are provided, uploads to Cloudinary cloud CDN
 * (permanent storage that persists across Render restarts, free-tier spin downs, and Vercel refreshes).
 * If Cloudinary is not configured or offline, falls back to local disk storage (/uploads/...).
 *
 * @param {Object} file - Multer file object
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const processUpload = async (file) => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // 1. Try Cloudinary upload if configured
  if (isCloudinaryActive()) {
    try {
      const uploadOptions = {
        folder: 'chitran_club/uploads',
        resource_type: 'auto'
      };

      let result;
      if (file.path) {
        result = await cloudinary.uploader.upload(file.path, uploadOptions);
        // Clean up temporary local file if uploaded to cloud
        try {
          if (fs.existsSync(file.path)) {
            await fs.promises.unlink(file.path);
          }
        } catch (e) {
          // Ignore temp cleanup error
        }
      } else if (file.buffer) {
        result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, res) => {
            if (error) return reject(error);
            resolve(res);
          });
          uploadStream.end(file.buffer);
        });
      }

      if (result && result.secure_url) {
        return {
          url: result.secure_url,
          publicId: result.public_id
        };
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload warning (falling back to local disk):', cloudErr.message);
    }
  }

  // 2. Fallback: Local disk storage
  if (file.filename) {
    return {
      url: `/uploads/${file.filename}`,
      publicId: file.filename
    };
  }

  if (file.buffer) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${uniqueSuffix}-${cleanOriginalName}`;
    const filePath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    return {
      url: `/uploads/${filename}`,
      publicId: filename
    };
  }

  throw new Error('Could not process upload file');
};

/**
 * Deletes an uploaded file from either Cloudinary or local disk
 */
export const deleteUploadedFile = async (url, publicId) => {
  if (!url) return;

  try {
    // If it's a Cloudinary URL or publicId
    if (publicId && isCloudinaryActive() && (url.includes('cloudinary.com') || !url.startsWith('/uploads/'))) {
      await cloudinary.uploader.destroy(publicId);
      return;
    }

    // If it's a local file
    if (url.startsWith('/uploads/')) {
      const filename = path.basename(url);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  } catch (err) {
    console.warn('Failed to delete uploaded file:', err.message);
  }
};

