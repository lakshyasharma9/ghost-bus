/**
 * Generate the GhostBus watermark audio file.
 * Uses Google Translate TTS (free, no API key).
 * Downloads to: assets/ghostbus-watermark.mp3
 * 
 * Run: node scripts/generate-watermark.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local', override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR  = path.join(__dirname, '..', 'assets');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'ghostbus-watermark.mp3');

// The text to speak — professional, clear
const WATERMARK_TEXT = 'GhostBus ghost production';

// Google Translate TTS — free, reliable, natural voice
// Encodes to slow=false, lang=en, client=gtx
const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(WATERMARK_TEXT)}&tl=en&client=tw-ob`;

async function generateWatermark() {
  console.log(`Generating watermark audio: "${WATERMARK_TEXT}"`);
  console.log(`Output: ${OUTPUT_FILE}\n`);

  // Create assets directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    const res = await fetch(ttsUrl, {
      headers: {
        // Must include a user-agent or Google TTS returns 403
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('audio') && !contentType.includes('mpeg')) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }

    const buffer = await res.arrayBuffer();
    fs.writeFileSync(OUTPUT_FILE, Buffer.from(buffer));

    const sizeKB = (buffer.byteLength / 1024).toFixed(1);
    console.log(`✅ Watermark generated: ${sizeKB} KB`);
    console.log(`   File: ${OUTPUT_FILE}`);
    console.log('\nNext step: Upload this file to S3 or keep it local.');
    console.log('The FFmpeg pipeline will use it automatically.\n');
  } catch (err) {
    console.error('❌ TTS generation failed:', err.message);
    console.log('\nAlternative: Record "GhostBus ghost production" yourself');
    console.log('and save as: Backend/assets/ghostbus-watermark.mp3\n');
    process.exit(1);
  }
}

generateWatermark();
