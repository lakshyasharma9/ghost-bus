/**
 * Set CORS policy on the S3 bucket to allow:
 *   1. Audio playback (GET) from the frontend
 *   2. Direct file uploads (PUT) from the browser
 * Run once: node --env-file=.env.local scripts/set-s3-cors.js
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

const bucket = process.env.AWS_S3_BUCKET;
const regionMatch = (bucket || '').match(/ap-southeast-2|us-east-1|eu-west-1/);
const region = regionMatch ? regionMatch[0] : 'ap-southeast-2';

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

async function main() {
  console.log('Setting CORS on bucket:', bucket);
  console.log('Region:', region);

  await s3.send(new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'HEAD'],
          AllowedOrigins: [
            'https://ghostbusaudio.com',
            'https://www.ghostbusaudio.com',
            'http://localhost:5173',
          ],
          ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type', 'x-amz-server-side-encryption'],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }));

  console.log('✅ CORS policy set! Browser uploads and audio playback will work.');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
