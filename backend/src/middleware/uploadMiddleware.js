import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists directly on this device
export const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage: stores uploaded images directly on device
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
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for device storage
  fileFilter
});

/**
 * Normalizes uploaded file metadata for database persistence
 * @param {Object} file - Multer file object
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const processUpload = async (file) => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // When using diskStorage, multer has saved the file directly to uploadDir
  if (file.filename) {
    return {
      url: `/uploads/${file.filename}`,
      publicId: file.filename
    };
  }

  // Graceful fallback if buffer is provided
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

