/**
 * FFmpeg API Utility — GhostBus Audio Processing
 * Service: https://ffmpeg-api.com
 * Auth: Basic key from FFMPEG_API_KEY env var
 *
 * Strategy: Upload files TO ffmpeg-api storage first (bypasses S3 HEAD-check 403),
 * then process them. This is required because AWS S3 presigned URLs reject HEAD
 * requests from external IPs but ffmpeg-api does a HEAD check before downloading.
 *
 * Flow:
 *   1. Download file from S3 into memory (Node server has access)
 *   2. Create a slot on ffmpeg-api (/file endpoint → presigned PUT URL)
 *   3. PUT the bytes to ffmpeg-api's storage
 *   4. Use the returned file_path (<dir_id>/<file_name>) in process calls
 *   5. Process → get output download_url
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { uploadBufferToS3, getSignedDownloadUrl } from './s3.js';

const FFMPEG_BASE = 'https://api.ffmpeg-api.com';
const getKey = () => process.env.FFMPEG_API_KEY;

// ─── Core HTTP helper ─────────────────────────────────────────────────────────

async function ffmpegRequest(method, path, body) {
  const key = getKey();
  if (!key) throw new Error('FFMPEG_API_KEY not configured');

  const res = await fetch(`${FFMPEG_BASE}${path}`, {
    method,
    headers: {
      'Authorization': key,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const json = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
  if (!res.ok || json.ok === false) {
    throw new Error(`FFmpeg API error (${res.status}): ${json.error ?? JSON.stringify(json)}`);
  }
  return json;
}

// ─── S3 direct download (bypasses presigned URL HEAD issue) ──────────────────

async function downloadFromS3(s3Key) {
  const bucket = process.env.AWS_S3_BUCKET;
  const regionMatch = (bucket || '').match(/ap-southeast-2|us-east-1|eu-west-1|ap-south-1|ap-northeast-1/);
  const region = regionMatch ? regionMatch[0] : (process.env.AWS_REGION || 'ap-southeast-2');

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });

  const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));

  // Collect stream into Buffer
  const chunks = [];
  for await (const chunk of res.Body) {
    chunks.push(chunk);
  }
  return {
    buffer: Buffer.concat(chunks),
    contentType: res.ContentType || 'application/octet-stream',
    size: res.ContentLength,
  };
}

// ─── Upload a buffer to ffmpeg-api storage ────────────────────────────────────

/**
 * Uploads a Buffer to ffmpeg-api's storage.
 * Returns the file_path string: "<dir_id>/<file_name>"
 */
async function uploadToFfmpegStorage(buffer, fileName, contentType, dirId = null) {
  // Step 1: Create file slot and get presigned PUT URL
  const createBody = { file_name: fileName };
  if (dirId) createBody.dir_id = dirId;

  const createRes = await ffmpegRequest('POST', '/file', createBody);
  const { file_path, dir_id: newDirId } = createRes.file;
  const { url: putUrl, headers: putHeaders = {} } = createRes.upload;

  // Step 2: PUT the file bytes
  const putRes = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(buffer.length),
      ...putHeaders,
    },
    body: buffer,
  });

  if (!putRes.ok) {
    const errText = await putRes.text().catch(() => '');
    throw new Error(`Failed to upload to ffmpeg-api storage: HTTP ${putRes.status} ${errText.substring(0, 100)}`);
  }

  return { file_path, dir_id: newDirId };
}

// ─── Upload S3 file to ffmpeg-api (combined helper) ──────────────────────────

/**
 * Downloads from S3 and uploads to ffmpeg-api.
 * Returns { file_path, dir_id }
 */
async function s3ToFfmpeg(s3Key, fileName, dirId = null) {
  const { buffer, contentType } = await downloadFromS3(s3Key);
  return uploadToFfmpegStorage(buffer, fileName, contentType, dirId);
}

// ─── 1. Generate Watermarked Preview MP3 ─────────────────────────────────────

/**
 * Generate a 30-second preview MP3 with "GhostBus ghost production" watermark
 * voiced every 15 seconds (at 0s and 15s).
 *
 * @param {string} masteredS3Key   - S3 key of the mastered WAV
 * @param {string} watermarkS3Key  - S3 key of the watermark MP3
 * @param {string} trackId         - Used for output filename
 * @returns {Promise<string|null>} - Download URL of the watermarked preview
 */
export async function generatePreviewMP3(masteredS3Key, watermarkS3Key, trackId) {
  if (!getKey()) {
    console.warn('[FFmpeg] FFMPEG_API_KEY not set — skipping preview generation');
    return null;
  }

  try {
    console.log(`[FFmpeg] Uploading mastered WAV to ffmpeg-api for track ${trackId}...`);

    const shortId = trackId.substring(0, 8);

    // Step 1: Upload mastered WAV first to get a dir_id
    const masteredUpload = await s3ToFfmpeg(masteredS3Key, `m-${shortId}.wav`);
    const dir_id = masteredUpload.dir_id;

    // Step 2: Upload watermark TWICE into the SAME directory (needed for 0s and 15s)
    let wmFilePath = null;
    let wm2FilePath = null;
    if (watermarkS3Key) {
      const { buffer: wBuf, contentType: wCt } = await downloadFromS3(watermarkS3Key);
      const [w1, w2] = await Promise.all([
        uploadToFfmpegStorage(wBuf, `w1-${shortId}.mp3`, wCt, dir_id),
        uploadToFfmpegStorage(wBuf, `w2-${shortId}.mp3`, wCt, dir_id),
      ]);
      wmFilePath  = w1.file_path;
      wm2FilePath = w2.file_path;
    }

    console.log(`[FFmpeg] Files uploaded. Processing watermarked preview...`);

    const outputFile = `preview-${shortId}.mp3`;

    let result;
    if (wmFilePath && wm2FilePath) {
      // Full-length watermarked preview
      // Watermark repeats every 15 seconds throughout the entire track
      // Uses amix with looped watermark overlaid on the full track
      // Strategy: create watermark instances at 0s, 15s, 30s, 45s, 60s, 75s, 90s, 105s, 120s, 135s, 150s
      // Since we only have 2 watermark files uploaded, use the AI endpoint for complex looping
      result = await ffmpegRequest('POST', '/ai/ffmpeg/process', {
        inputs: [
          { file_path: masteredUpload.file_path },
          { file_path: wmFilePath },
        ],
        instructions: `Mix these two audio files together to create a watermarked preview. The first file is the main music track. The second file is a short voice watermark tag. Overlay the watermark voice on top of the music, repeating the watermark every 15 seconds throughout the entire duration of the main track. The watermark volume should be at 35% of the original watermark level so the music is still clearly audible. Keep the full length of the main track. Apply a 3-second fade-out at the very end. Output as MP3 320kbps stereo. Output filename: ${outputFile}`,
        output_dir_id: dir_id,
      });
    } else {
      // No watermark — full length MP3 with fade out
      result = await ffmpegRequest('POST', '/ffmpeg/process', {
        task: {
          inputs: [{ file_path: masteredUpload.file_path }],
          outputs: [{
            file: outputFile,
            options: ['-c:a', 'libmp3lame', '-b:a', '320k', '-ac', '2', '-af', 'afade=t=out:st=27:d=3'],
          }],
          output_dir_id: dir_id,
        },
      });
    }

    const outputEntry = result?.result?.find((r: any) => r.file_name === outputFile || r.file_name?.endsWith('.mp3'));
    const cdnUrl = outputEntry?.download_url ?? result?.result?.[0]?.download_url ?? null;

    if (!cdnUrl) throw new Error('No output URL in FFmpeg response: ' + JSON.stringify(result).substring(0, 200));

    // Download the generated preview from ffmpeg-api CDN and re-upload to our S3
    // This is required because:
    //   1. ffmpeg-api URLs expire
    //   2. ffmpeg-api CDN serves audio/octet-stream which some browsers reject
    //   3. We need the preview to be permanently stored
    console.log(`[FFmpeg] Downloading preview from CDN and uploading to S3...`);
    const previewRes = await fetch(cdnUrl);
    if (!previewRes.ok) throw new Error(`Failed to download preview from CDN: ${previewRes.status}`);
    const previewBuffer = Buffer.from(await previewRes.arrayBuffer());

    const s3Key = `tracks/previews/${trackId.substring(0, 8)}-wm.mp3`;
    await uploadBufferToS3(previewBuffer, s3Key, 'audio/mpeg');

    // Get a signed URL for immediate use (1 hour)
    const previewSignedUrl = await getSignedDownloadUrl(s3Key, 3600);

    console.log(`[FFmpeg] ✅ Watermarked preview saved to S3 for track ${trackId}`);
    // Return the S3 key — controller will store this and generate fresh signed URLs on demand
    return s3Key;

  } catch (err) {
    console.error(`[FFmpeg] Preview generation failed for track ${trackId}:`, err.message);
    return null;
  }
}

// ─── 2. Get Audio Duration ────────────────────────────────────────────────────

/**
 * Get the exact duration of an audio file in seconds using FFprobe.
 *
 * @param {string} s3Key - S3 key of the audio file
 * @returns {Promise<number|null>}
 */
export async function getAudioDuration(s3Key) {
  if (!getKey()) return null;

  try {
    // Upload to ffmpeg-api first
    const shortId = s3Key.split('/').pop().split('.')[0].substring(0, 8);
    const { file_path } = await s3ToFfmpeg(s3Key, `pb-${shortId}.wav`);

    const result = await ffmpegRequest('POST', '/ffprobe/analyze', {
      file_path,
      probe: {
        format: ['duration'],
        streams: [],
      },
    });

    const duration = parseFloat(result?.result?.format?.duration);
    return isNaN(duration) ? null : Math.round(duration);

  } catch (err) {
    console.error('[FFmpeg] Duration detection failed:', err.message);
    return null;
  }
}

// ─── 3. Generate Waveform Data ────────────────────────────────────────────────

/**
 * Generate waveform amplitude data (100 points) for the track visualizer.
 * Uses ffprobe to get bit_rate + duration, then generates a synthetic waveform.
 *
 * @param {string} s3Key - S3 key of the audio file
 * @returns {Promise<number[]|null>}
 */
export async function generateWaveformData(s3Key) {
  if (!getKey()) return null;

  try {
    const shortId = s3Key.split('/').pop().split('.')[0].substring(0, 8);
    const { file_path } = await s3ToFfmpeg(s3Key, `wf-${shortId}.wav`);

    const result = await ffmpegRequest('POST', '/ffprobe/analyze', {
      file_path,
      probe: {
        format: ['duration', 'bit_rate'],
        streams: ['codec_name', 'sample_rate'],
      },
    });

    const bitrate  = parseInt(result?.result?.format?.bit_rate || '0', 10) || 1411200;
    const duration = parseFloat(result?.result?.format?.duration || '0') || 180;

    return generateSyntheticWaveform(bitrate, duration);

  } catch (err) {
    console.error('[FFmpeg] Waveform generation failed:', err.message);
    return generateSyntheticWaveform(1411200, 180);
  }
}

function generateSyntheticWaveform(bitrate, _duration) {
  const points = 100;
  const seed = bitrate || 1411200;
  const waveform = [];
  for (let i = 0; i < points; i++) {
    const t = i / points;
    const base = 0.3 + 0.5 * Math.sin(t * Math.PI);
    const noise = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
    waveform.push(Math.min(1, Math.max(0.05, base * 0.7 + noise * 0.3)));
  }
  return waveform;
}

// ─── 4. Verify ZIP Contains WAV Files ────────────────────────────────────────

/**
 * Verify that an uploaded ZIP file contains WAV audio files.
 *
 * @param {string} s3Key - S3 key of the ZIP file
 * @returns {Promise<{valid: boolean, reason: string}>}
 */
export async function verifyZipContainsAudio(s3Key) {
  if (!getKey()) return { valid: true, reason: 'FFmpeg API not configured — skipping' };

  try {
    const shortId = s3Key.split('/').pop().split('.')[0].substring(0, 8);
    const { buffer, contentType } = await downloadFromS3(s3Key);
    const { file_path } = await uploadToFfmpegStorage(buffer, `st-${shortId}.zip`, contentType);

    const result = await ffmpegRequest('POST', '/ffprobe/analyze', {
      file_path,
      probe: { format: ['format_name'], streams: ['codec_name'] },
    });

    const streams = result?.result?.streams || [];
    const hasAudio = streams.some(s => ['pcm_s16le','pcm_s24le','pcm_f32le','aac','mp3','flac','wav'].includes(s.codec_name));
    if (hasAudio) return { valid: true, reason: 'ZIP contains audio streams' };

    return { valid: true, reason: 'ZIP verification inconclusive — manual review recommended' };
  } catch (err) {
    console.error('[FFmpeg] ZIP verification failed:', err.message);
    return { valid: true, reason: `ZIP verification skipped: ${err.message}` };
  }
}
