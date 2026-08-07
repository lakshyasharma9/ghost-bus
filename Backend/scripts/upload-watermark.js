/**
 * Upload ghostbus-watermark.mp3 to S3 as a public-read asset.
 * Run: node scripts/upload-watermark.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config({ path: '.env.local', override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_PATH  = path.join(__dirname, '..', 'assets', 'ghostbus-watermark.mp3');
const S3_KEY     = 'assets/ghostbus-watermark.mp3';

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION || 'ap-southeast-2';

const s3 = new S3Client({
  region,
  endpoint: `https://s3.${region}.amazonaws.com`,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function upload() {
  if (!fs.existsSync(FILE_PATH)) {
    console.error('❌ Watermark file not found. Run: node scripts/generate-watermark.js first');
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(FILE_PATH);
  console.log(`Uploading to s3://${bucket}/${S3_KEY} ...`);

  await s3.send(new PutObjectCommand({
    Bucket:      bucket,
    Key:         S3_KEY,
    Body:        fileBuffer,
    ContentType: 'audio/mpeg',
    // Server-side encryption
    ServerSideEncryption: 'AES256',
  }));

  // Generate a long-lived signed URL (max 7 days per AWS SigV4 limit)
  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: S3_KEY }), {
    expiresIn: 604_800, // 7 days
  });

  console.log(`\n✅ Uploaded successfully!`);
  console.log(`\nAdd this to .env.local:`);
  console.log(`GHOSTBUS_WATERMARK_S3_KEY=${S3_KEY}`);
  console.log(`\nThe backend will auto-generate fresh signed URLs when needed.`);
  console.log(`Signed URL (7 days): ${url.split('?')[0]}`);
}

upload().catch(err => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
