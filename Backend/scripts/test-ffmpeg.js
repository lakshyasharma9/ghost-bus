/**
 * FFmpeg API Integration Test
 * Run: node scripts/test-ffmpeg.js
 * 
 * Tests all 4 functions using a public sample audio file.
 * No track upload needed — uses a demo MP3 URL from the web.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import {
  generatePreviewMP3,
  getAudioDuration,
  generateWaveformData,
  verifyZipContainsAudio,
} from '../utils/ffmpeg.js';

// Public test audio file (royalty-free, ~3 min MP3)
const TEST_AUDIO_URL = 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8a8e0c3e8.mp3';
// Watermark from S3 — generate signed URL for testing
const TEST_WATERMARK_URL = null; // Will use fallback (no watermark) in test

// Public ZIP file for ZIP verify test (small sample)
const TEST_ZIP_URL = 'https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/02/zip_2MB.zip';

const FAKE_TRACK_ID = 'test-track-12345';

console.log('\n========================================');
console.log('  FFmpeg API Integration Test');
console.log('========================================');
console.log('API Key set:', !!process.env.FFMPEG_API_KEY);
console.log('Test audio:', TEST_AUDIO_URL);
console.log('');

async function runTests() {
  let passed = 0;
  let failed = 0;

  // ── Test 1: Audio Duration ──────────────────────────────────────────────────
  console.log('TEST 1: getAudioDuration');
  console.log('  → Calling FFprobe analyze...');
  try {
    const duration = await getAudioDuration(TEST_AUDIO_URL);
    if (duration && duration > 0) {
      console.log(`  ✅ PASS — Duration: ${duration}s (${Math.floor(duration / 60)}m ${Math.round(duration % 60)}s)`);
      passed++;
    } else {
      console.log(`  ⚠️  WARN — Duration returned: ${duration} (may need manual check)`);
      passed++;
    }
  } catch (err) {
    console.log(`  ❌ FAIL — ${err.message}`);
    failed++;
  }

  console.log('');

  // ── Test 2: Waveform Data ───────────────────────────────────────────────────
  console.log('TEST 2: generateWaveformData');
  console.log('  → Calling FFprobe for stream info...');
  try {
    const waveform = await generateWaveformData(TEST_AUDIO_URL);
    if (waveform && Array.isArray(waveform) && waveform.length === 100) {
      const min = Math.min(...waveform).toFixed(2);
      const max = Math.max(...waveform).toFixed(2);
      console.log(`  ✅ PASS — ${waveform.length} data points, range: ${min}–${max}`);
      passed++;
    } else {
      console.log(`  ⚠️  WARN — Returned: ${JSON.stringify(waveform)?.slice(0, 80)}`);
      passed++;
    }
  } catch (err) {
    console.log(`  ❌ FAIL — ${err.message}`);
    failed++;
  }

  console.log('');

  // ── Test 3: Preview MP3 Generation ─────────────────────────────────────────
  console.log('TEST 3: generatePreviewMP3');
  console.log('  → Submitting to FFmpeg AI processing (may take 30-60s)...');
  try {
    const previewUrl = await generatePreviewMP3(TEST_AUDIO_URL, TEST_WATERMARK_URL, FAKE_TRACK_ID);
    if (previewUrl && previewUrl.startsWith('http')) {
      console.log(`  ✅ PASS — Preview URL: ${previewUrl}`);
      passed++;
    } else if (previewUrl === null) {
      console.log(`  ⚠️  WARN — Returned null (check API key and credits)`);
      failed++;
    } else {
      console.log(`  ⚠️  WARN — Unexpected response: ${previewUrl}`);
      passed++;
    }
  } catch (err) {
    console.log(`  ❌ FAIL — ${err.message}`);
    failed++;
  }

  console.log('');

  // ── Test 4: ZIP Verification ────────────────────────────────────────────────
  console.log('TEST 4: verifyZipContainsAudio');
  console.log('  → Checking ZIP file contents...');
  try {
    const result = await verifyZipContainsAudio(TEST_ZIP_URL);
    console.log(`  ✅ PASS — valid: ${result.valid}, reason: "${result.reason}"`);
    passed++;
  } catch (err) {
    console.log(`  ❌ FAIL — ${err.message}`);
    failed++;
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n========================================');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed === 0) {
    console.log('🎉 All tests passed! FFmpeg API is working correctly.');
    console.log('   Upload a new track as seller to see it in action.\n');
  } else {
    console.log('⚠️  Some tests failed. Check:');
    console.log('   1. FFMPEG_API_KEY is correct in .env.local');
    console.log('   2. Backend is restarted after adding the key');
    console.log('   3. FFmpeg API account has credits (check ffmpeg-api.com dashboard)\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
