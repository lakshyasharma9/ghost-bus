/**
 * One-time script: regenerate watermarked previews for all approved tracks
 * that don't have an ffmpegPreviewUrl yet.
 *
 * Run on server:
 *   node --env-file=.env.local scripts/regenerate-previews.js
 */

import prisma from '../config/database.js';
import { generatePreviewMP3, getAudioDuration, generateWaveformData } from '../utils/ffmpeg.js';

const WATERMARK_KEY = process.env.GHOSTBUS_WATERMARK_S3_KEY || 'assets/ghostbus-watermark.mp3';

async function main() {
  console.log('🎵 GhostBus Preview Regeneration Script');
  console.log('=========================================');

  // Get all approved tracks without a preview URL
  const tracks = await prisma.track.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, title: true, audioUrl: true, waveformData: true },
    orderBy: { createdAt: 'asc' },
  });

  const needsPreview = tracks.filter(t => !t.waveformData?.ffmpegPreviewUrl);
  console.log(`Found ${tracks.length} approved tracks, ${needsPreview.length} need preview generation.\n`);

  let success = 0;
  let failed = 0;

  for (const track of needsPreview) {
    console.log(`\n[${needsPreview.indexOf(track) + 1}/${needsPreview.length}] Processing: "${track.title}" (${track.id})`);

    try {
      // Generate watermarked preview
      console.log('  → Generating watermarked preview...');
      const previewUrl = await generatePreviewMP3(track.audioUrl, WATERMARK_KEY, track.id);

      if (!previewUrl) {
        console.log('  ✗ Preview generation returned null');
        failed++;
        continue;
      }

      // Get duration if missing
      let durationUpdate = {};
      if (!track.waveformData?.duration) {
        console.log('  → Getting audio duration...');
        const dur = await getAudioDuration(track.audioUrl);
        if (dur) durationUpdate.duration = dur;
      }

      // Generate waveform if missing
      let waveformUpdate = {};
      if (!track.waveformData?.waveformPoints) {
        console.log('  → Generating waveform...');
        const wf = await generateWaveformData(track.audioUrl);
        if (wf) waveformUpdate.waveformPoints = wf;
      }

      // Save to DB
      const existing = track.waveformData || {};
      await prisma.track.update({
        where: { id: track.id },
        data: {
          waveformData: {
            ...existing,
            ffmpegPreviewUrl: previewUrl,
            ffmpegProcessedAt: new Date().toISOString(),
            ...waveformUpdate,
          },
          ...(durationUpdate.duration ? { duration: durationUpdate.duration } : {}),
        },
      });

      console.log(`  ✅ Done! Preview URL saved.`);
      success++;

      // Small delay between tracks to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));

    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      failed++;
    }
  }

  console.log('\n=========================================');
  console.log(`✅ Success: ${success} tracks`);
  console.log(`✗ Failed:  ${failed} tracks`);
  console.log('=========================================\n');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
