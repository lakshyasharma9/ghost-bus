import multer from 'multer';
import os from 'os';
import path from 'path';
import { errorResponse } from '../utils/response.js';

// ─── Store files on disk (prevents OOM on large uploads) ─────────────────────
// Files are written to OS temp dir, then streamed to S3, then auto-deleted
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const ext = path.extname(file.originalname) || '';
    cb(null, `ghostbus-${unique}${ext}`);
  },
});

/**
 * Generic multer instance — used as base
 */
const upload = multer({
  storage,
  limits: {
    // Hard cap per file: 2 GB (stems/project files)
    fileSize: 2 * 1024 * 1024 * 1024,
    // Max 10 files per request:
    //   mastered, unmastered, stems, midi, artwork, lyrics,
    //   radioEdit, extendedMix, instrumental + 1 spare
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    // Sanitize original filename — strip path traversal attempts
    file.originalname = file.originalname
      .replace(/[^a-zA-Z0-9._\- ]/g, '_')
      .substring(0, 200);
    cb(null, true);
  },
});

/**
 * Track upload fields — all 9 possible file inputs
 */
export const trackUploadFields = upload.fields([
  { name: 'mastered',      maxCount: 1 },
  { name: 'unmastered',    maxCount: 1 },
  { name: 'stems',         maxCount: 1 },
  { name: 'midi',          maxCount: 1 },
  { name: 'artwork',       maxCount: 1 },
  { name: 'lyrics',        maxCount: 1 },
  { name: 'radioEdit',     maxCount: 1 },
  { name: 'extendedMix',   maxCount: 1 },
  { name: 'instrumental',  maxCount: 1 },
]);

/**
 * Avatar upload — single image
 */
export const avatarUpload = upload.single('avatar');

/**
 * Multer error handler middleware
 * Must be used AFTER the multer middleware in the route chain
 */
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 413, 'File too large. Check size limits.');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return errorResponse(res, 400, 'Too many files uploaded.');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return errorResponse(res, 400, `Unexpected field: ${err.field}`);
    }
    return errorResponse(res, 400, `Upload error: ${err.message}`);
  }
  next(err);
}
