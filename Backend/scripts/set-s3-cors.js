/**
 * Set CORS policy on the S3 bucket to allow audio playback from the frontend.
 * Run once: node scripts/set-s3-cors.js
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

const region = 'ap-southeast-2';
const s3 = new S3Client({
  region,
  endpoint: `https://s3.${region}.amazonaws.com`,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function main() {
  const bucket = process.env.AWS_S3_BUCKET;
  console.log('Setting CORS on bucket:', bucket);

  await s3.send(new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'HEAD'],
          AllowedOrigins: ['http://localhost:5173', 'http://localhost:3000', 'https://ghostbus.io', '*'],
          ExposeHeaders: ['Content-Length', 'Content-Type'],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }));

  console.log('✅ CORS policy set! Audio playback from frontend will now work.');
}

main().catch(e => console.error('Error:', e.message));
