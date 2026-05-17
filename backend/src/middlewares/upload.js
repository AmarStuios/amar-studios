import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

export const USE_CLOUDINARY = !!process.env.CLOUDINARY_CLOUD_NAME;

let storage;

if (USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'amar-studios',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 1200, height: 1500, crop: 'limit', quality: 'auto' }],
    },
  });
  console.log('[upload] Using Cloudinary storage');
} else {
  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${uuid()}${ext}`);
    },
  });
  console.log('[upload] Using local disk storage');
}

const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];

function fileFilter(_req, file, cb) {
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Type de fichier non autorise. Utilisez JPG, PNG, WEBP ou GIF.'));
}

const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxMb * 1024 * 1024 },
});

export default upload;
export { cloudinary };
