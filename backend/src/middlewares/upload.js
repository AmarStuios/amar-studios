import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uuid()}${ext}`);
  },
});

const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];

function fileFilter(_req, file, cb) {
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Type de fichier non autorisé. Utilisez JPG, PNG, WEBP ou GIF.'));
}

const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxMb * 1024 * 1024 },
});

export default upload;
