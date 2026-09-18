import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists for fallback
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage for piping to Cloudinary or disk
const storage = multer.memoryStorage();

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

/**
 * Uploads a file buffer either to Cloudinary (if configured) or to local disk
 * @param {Object} file - Multer file object with buffer
 * @param {string} folder - Folder name
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const processUpload = async (file, folder = 'college_club') => {
  if (!file || !file.buffer) {
    throw new Error('No file provided for upload');
  }

  // 1. If Cloudinary is properly configured, upload to Cloudinary
  if (isCloudinaryConfigured) {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.warn('[Upload] Cloudinary upload failed, falling back to local storage:', error.message);
    }
  }

  // 2. Fallback: Store on local disk
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${uniqueSuffix}-${cleanOriginalName}`;
  const filePath = path.join(uploadDir, filename);

  await fs.promises.writeFile(filePath, file.buffer);

  return {
    url: `/uploads/${filename}`,
    publicId: filename
  };
};
