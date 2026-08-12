import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import path from 'path';

// ─── S3 Client ────────────────────────────────────────────────────────────────
// Lazy-initialized S3 client — ensures env vars are loaded before use
let _s3Client = null;
function getS3() {
  if (!_s3Client) {
    // Detect region from bucket name if possible (bucket contains region in name)
    const bucket = process.env.AWS_S3_BUCKET || '';
    let region = process.env.AWS_REGION || 'ap-southeast-2';
    
    // Fix: bucket name contains actual region — extract it to avoid PermanentRedirect
    const regionMatch = bucket.match(/ap-southeast-2|us-east-1|eu-west-1|ap-south-1|ap-northeast-1/);
    if (regionMatch) region = regionMatch[0];

    _s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log(`[S3] Initialized: region=${region}, bucket=${bucket}`);
  }
  return _s3Client;
}

// Read bucket lazily — env may not be loaded at ESM import time
function getBucket() {
  return process.env.AWS_S3_BUCKET;
}

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_AUDIO_TYPES = ['audio/wav', 'audio/x-wav', 'audio/wave'];
const ALLOWED_MP3_TYPES = ['audio/mpeg', 'audio/mp3'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_ARCHIVE_TYPES = ['application/zip', 'application/x-zip-compressed'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

// Max sizes
const MAX_AUDIO_SIZE  = 500 * 1024 * 1024; // 500 MB
const MAX_MP3_SIZE    =  50 * 1024 * 1024; //  50 MB (for preview versions)
const MAX_IMAGE_SIZE  =  10 * 1024 * 1024; //  10 MB
const MAX_ARCHIVE_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB
const MAX_PDF_SIZE    =  20 * 1024 * 1024; //  20 MB

/**
 * Validate file before upload
 */
export function validateFile(file, type) {
  if (!file) throw new Error('No file provided');

  if (type === 'audio') {
    if (!ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid audio format. Only WAV files are accepted.');
    }
    if (file.size > MAX_AUDIO_SIZE) {
      throw new Error('Audio file too large. Maximum size is 500 MB.');
    }
  }

  if (type === 'mp3') {
    if (!ALLOWED_MP3_TYPES.includes(file.mimetype) && !ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid format. Only MP3 or WAV files are accepted for preview versions.');
    }
    if (file.size > MAX_MP3_SIZE) {
      throw new Error('Preview file too large. Maximum size is 50 MB.');
    }
  }

  if (type === 'image') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid image format. Only JPEG, PNG, WebP are accepted.');
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error('Image too large. Maximum size is 10 MB.');
    }
  }

  if (type === 'archive') {
    if (!ALLOWED_ARCHIVE_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid archive format. Only ZIP files are accepted.');
    }
    if (file.size > MAX_ARCHIVE_SIZE) {
      throw new Error('Archive too large. Maximum size is 2 GB.');
    }
  }

  if (type === 'pdf') {
    if (!ALLOWED_PDF_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid file format. Only PDF files are accepted for lyrics.');
    }
    if (file.size > MAX_PDF_SIZE) {
      throw new Error('PDF too large. Maximum size is 20 MB.');
    }
  }
}

/**
 * Build a safe S3 key — no path traversal, no special chars
 */
function buildKey(folder, sellerId, originalName) {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const uuid = randomUUID();
  // e.g. tracks/audio/seller_abc123/uuid.wav
  return `${folder}/${sellerId}/${uuid}${ext}`;
}

/**
 * Upload a raw Buffer to S3 (not a multer file — for programmatic uploads)
 * Returns the S3 key
 */
export async function uploadBufferToS3(buffer, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ContentLength: buffer.length,
    ServerSideEncryption: 'AES256',
  });
  await getS3().send(command);
  return key;
}

/**
 * Upload a file buffer to S3
 * Returns the S3 key (NOT a public URL — we use signed URLs for access)
 */
export async function uploadToS3(file, folder, sellerId) {
  const key = buildKey(folder, sellerId, file.originalname);

  // Support both memoryStorage (buffer) and diskStorage (path)
  let body;
  let size = file.size;
  if (file.buffer) {
    body = file.buffer;
  } else if (file.path) {
    const { createReadStream, statSync } = await import('fs');
    body = createReadStream(file.path);
    size = file.size || statSync(file.path).size;
  } else {
    throw new Error('File has no buffer or path');
  }

  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: body,
    ContentType: file.mimetype,
    ContentLength: size,
    // Server-side encryption
    ServerSideEncryption: 'AES256',
    // Metadata for auditing
    Metadata: {
      uploadedBy: sellerId,
      originalName: Buffer.from(file.originalname).toString('base64'),
      uploadedAt: new Date().toISOString(),
    },
  });

  await getS3().send(command);

  // Clean up temp file if stored on disk
  if (file.path) {
    const { unlink } = await import('fs/promises');
    unlink(file.path).catch(() => {});
  }

  return key;
}

/**
 * Delete a file from S3 by key
 */
export async function deleteFromS3(key) {
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });

  await getS3().send(command);
}

/**
 * Generate a time-limited signed URL for secure access
 * Default: 1 hour for previews, 15 min for downloads
 */
export async function getSignedDownloadUrl(key, expiresInSeconds = 3600) {
  if (!key) return null;

  // Use a fresh client without checksum for presigned URLs
  // AWS SDK v3.700+ adds x-amz-checksum-mode by default which breaks external access
  const { S3Client: S3C, GetObjectCommand: GOC } = await import('@aws-sdk/client-s3');
  const { getSignedUrl: gsu } = await import('@aws-sdk/s3-request-presigner');
  
  const bucket = process.env.AWS_S3_BUCKET || '';
  const regionMatch = bucket.match(/ap-southeast-2|us-east-1|eu-west-1|ap-south-1|ap-northeast-1/);
  const region = regionMatch ? regionMatch[0] : (process.env.AWS_REGION || 'ap-southeast-2');

  const client = new S3C({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });

  const command = new GOC({ Bucket: bucket, Key: key });
  return gsu(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a short-lived signed URL for audio preview (30 min)
 */
export async function getPreviewUrl(key) {
  return getSignedDownloadUrl(key, 1800);
}

/**
 * Generate a short-lived signed URL for purchased file download (15 min)
 */
export async function getPurchaseDownloadUrl(key) {
  return getSignedDownloadUrl(key, 900);
}
