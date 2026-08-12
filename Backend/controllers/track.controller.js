import prisma from '../config/database.js';
import {
  uploadToS3,
  deleteFromS3,
  validateFile,
  getPreviewUrl,
  getSignedDownloadUrl,
  getPurchaseDownloadUrl,
  getPresignedUploadUrl,
} from '../utils/s3.js';
import { errorResponse, successResponse } from '../utils/response.js';
import { submitTrackForMRT, getMRTResult, parseMRTVerdict } from '../utils/acrcloud.js';
import {
  generatePreviewMP3,
  getAudioDuration,
  generateWaveformData,
  verifyZipContainsAudio,
} from '../utils/ffmpeg.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely parse integer — returns null if invalid
 */
function safeInt(val) {
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

/**
 * Safely parse float — returns null if invalid
 */
function safeFloat(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

/**
 * Parse tags from string or array
 */
function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((t) => String(t).trim()).filter(Boolean).slice(0, 10);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((t) => String(t).trim()).filter(Boolean).slice(0, 10);
  } catch (_) {}
  return String(raw).split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10);
}

/**
 * Strip S3 key from a full URL (for backward compat if URL was stored)
 */
function extractKey(urlOrKey) {
  if (!urlOrKey) return null;
  // If it's already a key (no http), return as-is
  if (!urlOrKey.startsWith('http')) return urlOrKey;
  // Extract key from S3 URL
  try {
    const url = new URL(urlOrKey);
    return url.pathname.replace(/^\//, '');
  } catch (_) {
    return urlOrKey;
  }
}

// ─── Upload Track ─────────────────────────────────────────────────────────────

const PLATFORM_FEE_PCT = 0.28; // 28% platform fee
const SELLER_PAYOUT_PCT = 0.72; // 72% seller payout
const MIN_PRICE = 149;
const MAX_PRICE = 2000;

// Vocal types that require a lyrics PDF
const VOCAL_TYPES_REQUIRING_LYRICS = ['exclusive', 'ai'];
const VALID_VOCAL_TYPES = ['none', 'exclusive', 'ai'];

/**
 * POST /api/v1/tracks
 * Seller uploads a new track (multipart/form-data)
 * Required fields: mastered, unmastered, stems, artwork (files) + metadata (body)
 */
export async function uploadTrack(req, res) {
  const sellerId = req.user.id;
  const uploadedKeys = []; // track for cleanup on failure

  try {
    const files = req.files || {};

    // ── Validate required files ──
    const requiredFiles = ['mastered', 'unmastered', 'stems', 'artwork'];
    for (const field of requiredFiles) {
      if (!files[field]?.[0]) {
        return errorResponse(res, 400, `Missing required file: ${field}`);
      }
    }

    const masteredFile   = files.mastered[0];
    const unmasteredFile = files.unmastered[0];
    const stemsFile      = files.stems[0];
    const midiFile       = files.midi?.[0] || null;
    const artworkFile    = files.artwork[0];
    const lyricsFile     = files.lyrics?.[0] || null;
    // Optional preview versions (MP3, max 50MB each)
    const radioEditFile    = files.radioEdit?.[0] || null;
    const extendedMixFile  = files.extendedMix?.[0] || null;
    const instrumentalFile = files.instrumental?.[0] || null;

    // ── Validate file types & sizes ──
    validateFile(masteredFile,   'audio');
    validateFile(unmasteredFile, 'audio');
    validateFile(stemsFile,      'archive');
    if (midiFile)   validateFile(midiFile,   'archive');
    validateFile(artworkFile,    'image');
    if (lyricsFile) validateFile(lyricsFile, 'pdf');
    // Validate optional MP3 preview versions
    if (radioEditFile)    validateFile(radioEditFile,    'mp3');
    if (extendedMixFile)  validateFile(extendedMixFile,  'mp3');
    if (instrumentalFile) validateFile(instrumentalFile, 'mp3');

    // ── Validate metadata ──
    const {
      title, genre, bpm, key, description,
      price, isExclusive, transparency, tags, vocalType,
    } = req.body;

    if (!title?.trim())       return errorResponse(res, 400, 'Track title is required');
    if (!genre?.trim())       return errorResponse(res, 400, 'Genre is required');
    if (!bpm)                 return errorResponse(res, 400, 'BPM is required');
    if (!key?.trim())         return errorResponse(res, 400, 'Musical key is required');
    if (!price)               return errorResponse(res, 400, 'Price is required');
    if (!transparency)        return errorResponse(res, 400, 'Transparency declaration is required');

    const bpmInt     = safeInt(bpm);
    const priceFloat = safeFloat(price);

    if (!bpmInt || bpmInt < 60 || bpmInt > 220) {
      return errorResponse(res, 400, 'BPM must be between 60 and 220');
    }
    if (!priceFloat || priceFloat < MIN_PRICE || priceFloat > MAX_PRICE) {
      return errorResponse(res, 400, `Price must be between €${MIN_PRICE} and €${MAX_PRICE}`);
    }
    if (!['original', 'loops'].includes(transparency)) {
      return errorResponse(res, 400, 'Invalid transparency value');
    }

    // ── Validate vocalType ──
    const resolvedVocalType = vocalType && VALID_VOCAL_TYPES.includes(vocalType) ? vocalType : 'none';

    // ── Lyrics PDF required for exclusive/ai vocal types ──
    if (VOCAL_TYPES_REQUIRING_LYRICS.includes(resolvedVocalType) && !lyricsFile) {
      return errorResponse(res, 400, `A Lyrics PDF is required for "${resolvedVocalType}" vocal type`);
    }

    // ── Calculate fees ──
    const platformFee   = Math.round(priceFloat * PLATFORM_FEE_PCT * 100) / 100;
    const sellerPayout  = Math.round(priceFloat * SELLER_PAYOUT_PCT * 100) / 100;

    // ── Upload all files to S3 in parallel ──
    const [masteredKey, unmasteredKey, stemsKey, artworkKey, midiKey, lyricsKey] = await Promise.all([
      uploadToS3(masteredFile,   'tracks/audio/mastered',   sellerId).then((k) => { uploadedKeys.push(k); return k; }),
      uploadToS3(unmasteredFile, 'tracks/audio/unmastered', sellerId).then((k) => { uploadedKeys.push(k); return k; }),
      uploadToS3(stemsFile,      'tracks/stems',            sellerId).then((k) => { uploadedKeys.push(k); return k; }),
      uploadToS3(artworkFile,    'tracks/artwork',          sellerId).then((k) => { uploadedKeys.push(k); return k; }),
      midiFile
        ? uploadToS3(midiFile,   'tracks/midi',    sellerId).then((k) => { uploadedKeys.push(k); return k; })
        : Promise.resolve(null),
      lyricsFile
        ? uploadToS3(lyricsFile, 'tracks/lyrics',  sellerId).then((k) => { uploadedKeys.push(k); return k; })
        : Promise.resolve(null),
    ]);

    // ── Upload optional preview versions (MP3) ──
    const [radioEditKey, extendedMixKey, instrumentalKey] = await Promise.all([
      radioEditFile
        ? uploadToS3(radioEditFile, 'tracks/previews/radio-edit', sellerId).then((k) => { uploadedKeys.push(k); return k; })
        : Promise.resolve(null),
      extendedMixFile
        ? uploadToS3(extendedMixFile, 'tracks/previews/extended-mix', sellerId).then((k) => { uploadedKeys.push(k); return k; })
        : Promise.resolve(null),
      instrumentalFile
        ? uploadToS3(instrumentalFile, 'tracks/previews/instrumental', sellerId).then((k) => { uploadedKeys.push(k); return k; })
        : Promise.resolve(null),
    ]);

    // ── Save to database — status SCANNING (MRT check first, then PENDING for admin) ──
    const track = await prisma.track.create({
      data: {
        sellerId,
        title:       title.trim(),
        description: description?.trim() || null,
        genre:       genre.trim(),
        bpm:         bpmInt,
        key:         key.trim(),
        price:       priceFloat,
        audioUrl:    masteredKey,
        coverUrl:    artworkKey,
        tags:        parseTags(tags),
        isExclusive: isExclusive === 'false' ? false : true,
        status:      'PENDING',         // Will stay PENDING — MRT runs async in background
        waveformData: {
          unmasteredKey,
          stemsKey,
          midiKey,
          lyricsKey,
          radioEditKey,
          extendedMixKey,
          instrumentalKey,
          vocalType:      resolvedVocalType,
          transparency,
          platformFee,
          sellerPayout,
          platformFeePct: PLATFORM_FEE_PCT,
          sellerPayoutPct: SELLER_PAYOUT_PCT,
          // MRT fields — populated once scan completes
          mrtStatus:   'scanning',   // scanning | clean | flagged | rejected | error | skipped
          mrtFileId:   null,         // ACRCloud file ID
          mrtVerdict:  null,         // Full parsed verdict object
          mrtScannedAt: null,
          fileSizes: {
            mastered:    masteredFile.size,
            unmastered:  unmasteredFile.size,
            stems:       stemsFile.size,
            midi:        midiFile?.size    || null,
            artwork:     artworkFile.size,
            lyrics:      lyricsFile?.size  || null,
            radioEdit:      radioEditFile?.size    || null,
            extendedMix:    extendedMixFile?.size  || null,
            instrumental:   instrumentalFile?.size || null,
          },
        },
        fileSize: BigInt(masteredFile.size),
      },
      select: {
        id: true, title: true, genre: true, bpm: true,
        key: true, price: true, status: true, tags: true,
        isExclusive: true, createdAt: true,
      },
    });

    // ── Trigger ACRCloud MRT scan asynchronously (fire-and-forget) ──
    // We don't await this — response goes back to the seller immediately.
    // The scan result is polled/received via background job and updates waveformData.
    triggerMRTScan(track.id, masteredKey).catch((err) => {
      console.error(`[MRT] Failed to trigger scan for track ${track.id}:`, err.message);
    });

    // ── Trigger FFmpeg processing pipeline asynchronously (fire-and-forget) ──
    // Runs in background: preview MP3 + duration detection + waveform + ZIP verify
    triggerFFmpegPipeline(track.id, masteredKey, stemsKey).catch((err) => {
      console.error(`[FFmpeg] Pipeline failed for track ${track.id}:`, err.message);
    });

    return successResponse(res, 201, 'Track submitted for review', {
      track: {
        ...track,
        price: Number(track.price),
        platformFee,
        sellerPayout,
        vocalType: resolvedVocalType,
        mrtStatus: 'scanning',
      },
    });
  } catch (error) {
    // ── Cleanup: delete any S3 files that were uploaded before the error ──
    if (uploadedKeys.length > 0) {
      await Promise.allSettled(uploadedKeys.map(deleteFromS3));
    }

    console.error('Upload track error:', error);

    if (error.message?.includes('Invalid') || error.message?.includes('too large') || error.message?.includes('required')) {
      return errorResponse(res, 400, error.message);
    }
    // Return full error detail for debugging (remove in production)
    return errorResponse(res, 500, `Upload failed: ${error.message || error.code || 'Unknown error'}`);
  }
}

// ─── Get All Tracks (Marketplace) ────────────────────────────────────────────

/**
 * GET /api/v1/tracks
 * Public marketplace listing — only APPROVED tracks
 * Query params: genre, minBpm, maxBpm, minPrice, maxPrice, search, page, limit, sortBy
 */
export async function getTracks(req, res) {
  try {
    const {
      genre,
      minBpm,
      maxBpm,
      minPrice,
      maxPrice,
      search,
      page     = '1',
      limit    = '20',
      sortBy   = 'createdAt',
    } = req.query;

    const pageNum  = Math.max(1, safeInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, safeInt(limit) || 20)); // cap at 50
    const skip     = (pageNum - 1) * limitNum;

    // ── Build where clause ──
    const where = {
      status: 'APPROVED', // Only show approved tracks publicly
    };

    if (genre)    where.genre = genre;
    if (minBpm)   where.bpm   = { ...where.bpm,   gte: safeInt(minBpm) };
    if (maxBpm)   where.bpm   = { ...where.bpm,   lte: safeInt(maxBpm) };
    if (minPrice) where.price = { ...where.price, gte: safeFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: safeFloat(maxPrice) };

    if (search?.trim()) {
      where.OR = [
        { title:       { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { genre:       { contains: search.trim(), mode: 'insensitive' } },
        { tags:        { has: search.trim().toLowerCase() } },
      ];
    }

    // ── Valid sort fields (whitelist to prevent injection) ──
    const SORT_FIELDS = { createdAt: 'createdAt', price: 'price', playsCount: 'playsCount', likesCount: 'likesCount' };
    const orderBy = { [SORT_FIELDS[sortBy] || 'createdAt']: 'desc' };

    // ── Run query + count in parallel ──
    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id:         true,
          title:      true,
          description: true,
          genre:      true,
          bpm:        true,
          key:        true,
          price:      true,
          audioUrl:   true,
          coverUrl:   true,
          duration:   true,
          tags:       true,
          isExclusive: true,
          playsCount: true,
          likesCount: true,
          createdAt:  true,
          seller: {
            select: {
              id:       true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.track.count({ where }),
    ]);

    // ── Generate signed cover URLs ──
    const tracksWithUrls = await Promise.all(
      tracks.map(async (track) => {
        const { _count, audioUrl, ...rest } = track;
        return {
          ...rest,
          coverUrl: track.coverUrl ? await getPreviewUrl(track.coverUrl) : null,
          previewUrl: audioUrl ? await getPreviewUrl(audioUrl) : null,
          price: Number(track.price),
          sold: _count.orderItems > 0,
        };
      })
    );

    return successResponse(res, 200, 'Tracks fetched', {
      tracks: tracksWithUrls,
      pagination: {
        page:       pageNum,
        limit:      limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext:    pageNum < Math.ceil(total / limitNum),
        hasPrev:    pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get tracks error:', error);
    return errorResponse(res, 500, 'Failed to fetch tracks');
  }
}

// ─── Get Single Track ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/tracks/:id
 * Public — returns track detail with signed preview URL
 * Increments play count
 */
export async function getTrackById(req, res) {
  try {
    const { id } = req.params;

    const track = await prisma.track.findUnique({
      where: { id },
      select: {
        id:           true,
        title:        true,
        description:  true,
        genre:        true,
        bpm:          true,
        key:          true,
        price:        true,
        audioUrl:     true,  // S3 key for mastered WAV
        coverUrl:     true,
        waveformData: true,
        duration:     true,
        tags:         true,
        isExclusive:  true,
        playsCount:   true,
        likesCount:   true,
        status:       true,
        createdAt:    true,
        seller: {
          select: {
            id:       true,
            username: true,
            fullName: true,
            avatarUrl: true,
            bio:      true,
          },
        },
        _count: { select: { orderItems: true } },
      },
    });

    if (!track) {
      return errorResponse(res, 404, 'Track not found');
    }

    // Only show approved tracks publicly (unless the requester is the seller)
    const requesterId = req.user?.id;
    if (track.status !== 'APPROVED' && track.seller.id !== requesterId) {
      return errorResponse(res, 404, 'Track not found');
    }

    // Determine if track has been sold
    const isSold = track._count.orderItems > 0;

    // ── Increment play count (fire-and-forget, don't block response) ──
    prisma.track.update({
      where: { id },
      data: { playsCount: { increment: 1 } },
    }).catch(() => {}); // silent fail — not critical

    // ── Extract waveformData before destructuring ──
    const waveformData = track.waveformData || {};

    // ── Generate signed preview URL (30 min) ──
    // Use FFmpeg-generated preview (S3 key) if available, else fall back to full WAV
    const ffmpegPreviewKey = waveformData?.ffmpegPreviewUrl ?? null;
    let previewUrl;
    if (ffmpegPreviewKey && !ffmpegPreviewKey.startsWith('http')) {
      // It's an S3 key — generate a fresh signed URL
      previewUrl = await getPreviewUrl(ffmpegPreviewKey);
    } else if (ffmpegPreviewKey && ffmpegPreviewKey.startsWith('http')) {
      // Legacy: old CDN URL stored — fall back to full WAV (will be regenerated on next upload)
      previewUrl = track.audioUrl ? await getPreviewUrl(track.audioUrl) : null;
    } else {
      // No preview yet — serve full WAV
      previewUrl = track.audioUrl ? await getPreviewUrl(track.audioUrl) : null;
    }
    const coverUrl = track.coverUrl ? await getPreviewUrl(track.coverUrl) : null;

    // ── Strip internal S3 keys from response ──
    const { audioUrl: _a, coverUrl: _c, waveformData: _wd, _count: _cnt, ...safeTrack } = track;

    return successResponse(res, 200, 'Track fetched', {
      track: {
        ...safeTrack,
        previewUrl,
        coverUrl,
        price: Number(track.price),
        sold: isSold,
        // Expose transparency and vocalType but NOT the actual file keys
        transparency: waveformData?.transparency || null,
        vocalType:    waveformData?.vocalType    || 'none',
        hasLyrics:    !!waveformData?.lyricsKey,
        hasMidi:      !!waveformData?.midiKey,
        hasProjectFile: !!waveformData?.midiKey, // legacy compat
        platformFee:  waveformData?.platformFee  ?? null,
        sellerPayout: waveformData?.sellerPayout ?? null,
        // Waveform visualizer data (100-point amplitude array)
        waveformPoints: waveformData?.waveformPoints ?? null,
        // Track preview versions available (with signed URLs for playback)
        versions: {
          radioEdit:    waveformData?.radioEditKey ? await getPreviewUrl(waveformData.radioEditKey) : null,
          extendedMix:  waveformData?.extendedMixKey ? await getPreviewUrl(waveformData.extendedMixKey) : null,
          instrumental: waveformData?.instrumentalKey ? await getPreviewUrl(waveformData.instrumentalKey) : null,
        },
      },
    });
  } catch (error) {
    console.error('Get track by ID error:', error);
    return errorResponse(res, 500, 'Failed to fetch track');
  }
}

// ─── Get My Tracks (Seller) ───────────────────────────────────────────────────

/**
 * GET /api/v1/tracks/my-tracks
 * Private — seller sees their own tracks (all statuses)
 */
export async function getMyTracks(req, res) {
  try {
    const sellerId = req.user.id;
    const { status, page = '1', limit = '50' } = req.query;

    const pageNum  = Math.max(1, safeInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, safeInt(limit) || 50));
    const skip     = (pageNum - 1) * limitNum;

    const where = { sellerId };
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id:           true,
          title:        true,
          genre:        true,
          bpm:          true,
          key:          true,
          price:        true,
          coverUrl:     true,
          status:       true,
          rejectionReason: true,
          tags:         true,
          isExclusive:  true,
          playsCount:   true,
          likesCount:   true,
          fileSize:     true,
          createdAt:    true,
          updatedAt:    true,
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.track.count({ where }),
    ]);

    // Generate signed cover URLs for seller's own tracks
    const tracksWithUrls = await Promise.all(
      tracks.map(async (track) => {
        const { _count, ...rest } = track;
        const sold = _count.orderItems > 0;
        return {
          ...rest,
          coverUrl: track.coverUrl ? await getPreviewUrl(track.coverUrl) : null,
          price:    Number(track.price),
          fileSize: track.fileSize ? Number(track.fileSize) : null,
          sold,
          // Override status to 'sold' for frontend display if track has been purchased
          status: sold ? 'sold' : track.status.toLowerCase(),
        };
      })
    );

    return successResponse(res, 200, 'My tracks fetched', {
      tracks: tracksWithUrls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get my tracks error:', error);
    return errorResponse(res, 500, 'Failed to fetch your tracks');
  }
}

// ─── Update Track ─────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/tracks/:id
 * Seller can update metadata of their own track
 * Cannot update files — must delete and re-upload
 * Cannot update if track is APPROVED (sold protection)
 */
export async function updateTrack(req, res) {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const track = await prisma.track.findUnique({
      where: { id },
      select: { id: true, sellerId: true, status: true },
    });

    if (!track) {
      return errorResponse(res, 404, 'Track not found');
    }

    // Ownership check
    if (track.sellerId !== sellerId) {
      return errorResponse(res, 403, 'You do not own this track');
    }

    // Cannot edit an approved (live) track's core metadata
    // Sellers must contact support for approved track changes
    if (track.status === 'APPROVED') {
      return errorResponse(res, 403, 'Cannot edit a live track. Contact support for changes.');
    }

    const { title, description, genre, bpm, key, price, tags } = req.body;

    const bpmInt     = bpm    ? safeInt(bpm)     : undefined;
    const priceFloat = price  ? safeFloat(price) : undefined;

    if (bpmInt !== undefined && (bpmInt < 60 || bpmInt > 220)) {
      return errorResponse(res, 400, 'BPM must be between 60 and 220');
    }
    if (priceFloat !== undefined && (priceFloat < 149 || priceFloat > 2000)) {
      return errorResponse(res, 400, 'Price must be between €149 and €2000');
    }

    const updated = await prisma.track.update({
      where: { id },
      data: {
        ...(title?.trim()       && { title: title.trim() }),
        ...(description?.trim() && { description: description.trim() }),
        ...(genre?.trim()       && { genre: genre.trim() }),
        ...(bpmInt              && { bpm: bpmInt }),
        ...(key?.trim()         && { key: key.trim() }),
        ...(priceFloat          && { price: priceFloat }),
        ...(tags                && { tags: parseTags(tags) }),
      },
      select: {
        id: true, title: true, genre: true, bpm: true,
        key: true, price: true, status: true, tags: true, updatedAt: true,
      },
    });

    return successResponse(res, 200, 'Track updated', {
      track: { ...updated, price: Number(updated.price) },
    });
  } catch (error) {
    console.error('Update track error:', error);
    return errorResponse(res, 500, 'Failed to update track');
  }
}

// ─── Delete Track ─────────────────────────────────────────────────────────────

/**
 * DELETE /api/v1/tracks/:id
 * Seller deletes their own track
 * Cannot delete if track has been sold (order exists)
 */
export async function deleteTrack(req, res) {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const track = await prisma.track.findUnique({
      where: { id },
      select: {
        id:          true,
        sellerId:    true,
        audioUrl:    true,
        coverUrl:    true,
        waveformData: true,
        status:      true,
        _count: { select: { orderItems: true } },
      },
    });

    if (!track) {
      return errorResponse(res, 404, 'Track not found');
    }

    // Ownership check
    if (track.sellerId !== sellerId) {
      return errorResponse(res, 403, 'You do not own this track');
    }

    // Cannot delete a sold track (legal/audit trail)
    if (track._count.orderItems > 0) {
      return errorResponse(res, 403, 'Cannot delete a track that has been purchased. Contact support.');
    }

    // ── Delete from DB first (if this fails, S3 files are still safe) ──
    await prisma.track.delete({ where: { id } });

    // ── Delete all S3 files (fire-and-forget after DB delete) ──
    const keysToDelete = [
      track.audioUrl,
      track.coverUrl,
      track.waveformData?.unmasteredKey,
      track.waveformData?.stemsKey,
      track.waveformData?.midiKey,
    ].filter(Boolean);

    Promise.allSettled(keysToDelete.map(deleteFromS3)).catch(() => {});

    return successResponse(res, 200, 'Track deleted successfully');
  } catch (error) {
    console.error('Delete track error:', error);
    return errorResponse(res, 500, 'Failed to delete track');
  }
}

// ─── Get Seller Stats ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/sellers/stats
 * Private — seller dashboard overview stats
 */
export async function getSellerStats(req, res) {
  try {
    const sellerId = req.user.id;

    const [trackStats, orderStats, monthlyEarnings] = await Promise.all([
      // Track counts by status
      prisma.track.groupBy({
        by: ['status'],
        where: { sellerId },
        _count: { id: true },
      }),

      // Total earnings from completed orders
      prisma.orderItem.aggregate({
        where: {
          track: { sellerId },
          order: { status: 'COMPLETED' },
        },
        _sum: { price: true },
        _count: { id: true },
      }),

      // Earnings this month
      prisma.orderItem.aggregate({
        where: {
          track: { sellerId },
          order: {
            status: 'COMPLETED',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        _sum: { price: true },
        _count: { id: true },
      }),
    ]);

    // Build status map
    const statusMap = {};
    trackStats.forEach((s) => { statusMap[s.status] = s._count.id; });

    const totalEarned      = Number(orderStats._sum.price || 0);
    const soldTracks       = orderStats._count.id || 0;
    const earnedThisMonth  = Number(monthlyEarnings._sum.price || 0);
    const soldThisMonth    = monthlyEarnings._count.id || 0;

    // Platform fee is 28% — seller payout is 72%
    const sellerPayout      = totalEarned * 0.72;
    const payoutThisMonth   = earnedThisMonth * 0.72;

    return successResponse(res, 200, 'Seller stats fetched', {
      stats: {
        total_earned:       sellerPayout,
        earned_this_month:  payoutThisMonth,
        sold_tracks:        soldTracks,
        sold_this_month:    soldThisMonth,
        pending_tracks:     statusMap['PENDING']  || 0,
        approved_tracks:    statusMap['APPROVED'] || 0,
        rejected_tracks:    statusMap['REJECTED'] || 0,
        active_tracks:      statusMap['APPROVED'] || 0,
      },
    });
  } catch (error) {
    console.error('Get seller stats error:', error);
    return errorResponse(res, 500, 'Failed to fetch seller stats');
  }
}

// ─── Direct S3 Upload (Presigned URLs) ────────────────────────────────────────

/**
 * POST /api/v1/tracks/init-upload
 * Seller requests presigned PUT URLs for direct browser-to-S3 upload.
 * 
 * Body: { files: [{ field, fileName, contentType, size }] }
 * Returns: { uploadUrls: { [field]: { key, uploadUrl } } }
 */
export async function initTrackUpload(req, res) {
  try {
    const sellerId = req.user.id;
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return errorResponse(res, 400, 'files array is required');
    }

    // Validate file list
    const VALID_FIELDS = ['mastered', 'unmastered', 'stems', 'midi', 'artwork', 'lyrics', 'radioEdit', 'extendedMix', 'instrumental'];
    const FOLDER_MAP = {
      mastered: 'tracks/audio/mastered',
      unmastered: 'tracks/audio/unmastered',
      stems: 'tracks/stems',
      midi: 'tracks/midi',
      artwork: 'tracks/artwork',
      lyrics: 'tracks/lyrics',
      radioEdit: 'tracks/previews/radio-edit',
      extendedMix: 'tracks/previews/extended-mix',
      instrumental: 'tracks/previews/instrumental',
    };

    const uploadUrls = {};

    for (const f of files) {
      if (!f.field || !f.fileName || !f.contentType) {
        return errorResponse(res, 400, `Each file must have field, fileName, contentType`);
      }
      if (!VALID_FIELDS.includes(f.field)) {
        return errorResponse(res, 400, `Invalid field: ${f.field}`);
      }

      const folder = FOLDER_MAP[f.field];
      const result = await getPresignedUploadUrl(folder, sellerId, f.fileName, f.contentType, f.size || 0);
      uploadUrls[f.field] = { key: result.key, uploadUrl: result.uploadUrl, contentType: result.contentType };
    }

    return successResponse(res, 200, 'Upload URLs generated', { uploadUrls });
  } catch (error) {
    console.error('Init upload error:', error);
    return errorResponse(res, 500, 'Failed to generate upload URLs');
  }
}

/**
 * POST /api/v1/tracks/finalize-upload
 * After browser uploads files directly to S3, seller finalizes with metadata + S3 keys.
 * 
 * Body: { title, genre, bpm, key, price, transparency, vocalType, description, tags, isExclusive,
 *          s3Keys: { mastered, unmastered, stems, midi?, artwork, lyrics?, radioEdit?, extendedMix?, instrumental? },
 *          fileSizes: { mastered, unmastered, stems, midi?, artwork, lyrics?, radioEdit?, extendedMix?, instrumental? } }
 */
export async function finalizeTrackUpload(req, res) {
  try {
    const sellerId = req.user.id;
    const {
      title, genre, bpm, key, description,
      price, isExclusive, transparency, tags, vocalType,
      s3Keys, fileSizes,
    } = req.body;

    // Validate metadata
    if (!title?.trim())       return errorResponse(res, 400, 'Track title is required');
    if (!genre?.trim())       return errorResponse(res, 400, 'Genre is required');
    if (!bpm)                 return errorResponse(res, 400, 'BPM is required');
    if (!key?.trim())         return errorResponse(res, 400, 'Musical key is required');
    if (!price)               return errorResponse(res, 400, 'Price is required');
    if (!transparency)        return errorResponse(res, 400, 'Transparency declaration is required');

    const bpmInt     = safeInt(bpm);
    const priceFloat = safeFloat(price);

    if (!bpmInt || bpmInt < 60 || bpmInt > 220) {
      return errorResponse(res, 400, 'BPM must be between 60 and 220');
    }
    if (!priceFloat || priceFloat < MIN_PRICE || priceFloat > MAX_PRICE) {
      return errorResponse(res, 400, `Price must be between €${MIN_PRICE} and €${MAX_PRICE}`);
    }
    if (!['original', 'loops'].includes(transparency)) {
      return errorResponse(res, 400, 'Invalid transparency value');
    }

    // Validate S3 keys
    if (!s3Keys) return errorResponse(res, 400, 's3Keys object is required');
    if (!s3Keys.mastered)   return errorResponse(res, 400, 'mastered S3 key is required');
    if (!s3Keys.unmastered) return errorResponse(res, 400, 'unmastered S3 key is required');
    if (!s3Keys.stems)      return errorResponse(res, 400, 'stems S3 key is required');
    if (!s3Keys.artwork)    return errorResponse(res, 400, 'artwork S3 key is required');

    const resolvedVocalType = vocalType && VALID_VOCAL_TYPES.includes(vocalType) ? vocalType : 'none';

    // Lyrics required for vocal tracks
    if (VOCAL_TYPES_REQUIRING_LYRICS.includes(resolvedVocalType) && !s3Keys.lyrics) {
      return errorResponse(res, 400, `Lyrics PDF required for "${resolvedVocalType}" vocal type`);
    }

    // Calculate fees
    const platformFee   = Math.round(priceFloat * PLATFORM_FEE_PCT * 100) / 100;
    const sellerPayout  = Math.round(priceFloat * SELLER_PAYOUT_PCT * 100) / 100;

    // Save to database — same structure as old uploadTrack
    const track = await prisma.track.create({
      data: {
        sellerId,
        title:       title.trim(),
        description: description?.trim() || null,
        genre:       genre.trim(),
        bpm:         bpmInt,
        key:         key.trim(),
        price:       priceFloat,
        audioUrl:    s3Keys.mastered,
        coverUrl:    s3Keys.artwork,
        tags:        parseTags(tags),
        isExclusive: isExclusive === 'false' ? false : true,
        status:      'PENDING',
        waveformData: {
          unmasteredKey:   s3Keys.unmastered,
          stemsKey:        s3Keys.stems,
          midiKey:         s3Keys.midi || null,
          lyricsKey:       s3Keys.lyrics || null,
          radioEditKey:    s3Keys.radioEdit || null,
          extendedMixKey:  s3Keys.extendedMix || null,
          instrumentalKey: s3Keys.instrumental || null,
          vocalType:       resolvedVocalType,
          transparency,
          platformFee,
          sellerPayout,
          platformFeePct:  PLATFORM_FEE_PCT,
          sellerPayoutPct: SELLER_PAYOUT_PCT,
          mrtStatus:       'scanning',
          mrtFileId:       null,
          mrtVerdict:      null,
          mrtScannedAt:    null,
          fileSizes:       fileSizes || {},
        },
        fileSize: BigInt(fileSizes?.mastered || 0),
      },
      select: {
        id: true, title: true, genre: true, bpm: true,
        key: true, price: true, status: true, tags: true,
        isExclusive: true, createdAt: true,
      },
    });

    // Trigger MRT + FFmpeg pipelines (async, non-blocking)
    triggerMRTScan(track.id, s3Keys.mastered).catch((err) => {
      console.error(`[MRT] Failed to trigger scan for track ${track.id}:`, err.message);
    });
    triggerFFmpegPipeline(track.id, s3Keys.mastered, s3Keys.stems).catch((err) => {
      console.error(`[FFmpeg] Pipeline failed for track ${track.id}:`, err.message);
    });

    return successResponse(res, 201, 'Track submitted for review', {
      track: {
        ...track,
        price: Number(track.price),
        platformFee,
        sellerPayout,
        vocalType: resolvedVocalType,
        mrtStatus: 'scanning',
      },
    });
  } catch (error) {
    console.error('Finalize upload error:', error);
    return errorResponse(res, 500, `Upload failed: ${error.message || 'Unknown error'}`);
  }
}

// ─── FFmpeg Pipeline ──────────────────────────────────────────────────────────

/**
 * Full FFmpeg processing pipeline for a newly uploaded track.
 * Runs async after upload — does NOT block the API response.
 * 
 * Steps:
 *  1. Verify stems ZIP contains WAV files
 *  2. Detect exact audio duration from mastered WAV
 *  3. Generate 30-second preview MP3 (saves to S3)
 *  4. Generate waveform data array (100 points)
 * 
 * All results stored in track.waveformData and track.duration
 */
async function triggerFFmpegPipeline(trackId, masteredKey, stemsKey) {
  console.log(`[FFmpeg] Starting pipeline for track ${trackId}`);

  try {
    const watermarkKey = process.env.GHOSTBUS_WATERMARK_S3_KEY || 'assets/ghostbus-watermark.mp3';

    // Run all operations sequentially to avoid uploading same file multiple times
    // Each ffmpeg util now downloads directly from S3 and uploads to ffmpeg-api storage

    // 1. Generate watermarked preview (most important — runs first)
    let previewMp3 = null;
    try {
      previewMp3 = await generatePreviewMP3(masteredKey, watermarkKey, trackId);
    } catch (e) {
      console.error(`[FFmpeg] Preview failed for ${trackId}:`, e.message);
    }

    // 2. Get audio duration
    let durationSec = null;
    try {
      durationSec = await getAudioDuration(masteredKey);
    } catch (e) {
      console.error(`[FFmpeg] Duration failed for ${trackId}:`, e.message);
    }

    // 3. Generate waveform
    let waveformData = null;
    try {
      waveformData = await generateWaveformData(masteredKey);
    } catch (e) {
      console.error(`[FFmpeg] Waveform failed for ${trackId}:`, e.message);
    }

    // 4. Verify stems ZIP
    let zipResult = { valid: true, reason: 'No stems file' };
    if (stemsKey) {
      try {
        zipResult = await verifyZipContainsAudio(stemsKey);
      } catch (e) {
        console.error(`[FFmpeg] ZIP verify failed for ${trackId}:`, e.message);
      }
    }

    console.log(`[FFmpeg] Pipeline results for track ${trackId}:`, {
      duration: durationSec,
      hasPreview: !!previewMp3,
      hasWaveform: !!waveformData,
      zipValid: zipResult.valid,
    });

    // Fetch current waveformData to merge into
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      select: { waveformData: true },
    });
    const existing = track?.waveformData ?? {};

    // Build update payload
    const updates = {
      waveformData: {
        ...existing,
        // Waveform amplitude data (100 points, 0.0–1.0)
        ...(waveformData && { waveformPoints: waveformData }),
        // Preview MP3 URL (external URL from FFmpeg API CDN)
        ...(previewMp3 && { ffmpegPreviewUrl: previewMp3 }),
        // ZIP verification result
        zipVerification: {
          valid:     zipResult.valid,
          reason:    zipResult.reason,
          checkedAt: new Date().toISOString(),
        },
        ffmpegProcessedAt: new Date().toISOString(),
      },
    };

    // Duration stored in top-level field (integer seconds)
    if (durationSec !== null) {
      updates.duration = Math.round(durationSec);
    }

    // If preview MP3 was generated, update the audioUrl to point to it
    // (buyers hear the short preview, not the full mastered WAV)
    if (previewMp3) {
      // Store preview separately — audioUrl still points to full WAV for purchased download
      updates.waveformData.ffmpegPreviewUrl = previewMp3;
    }

    await prisma.track.update({
      where: { id: trackId },
      data: updates,
    });

    console.log(`[FFmpeg] Pipeline complete for track ${trackId} — duration: ${durationSec}s`);

    // Log warning if ZIP is invalid — admin can act on it
    if (!zipResult.valid) {
      console.warn(`[FFmpeg] ⚠️  Track ${trackId}: ZIP verification failed — ${zipResult.reason}`);
    }
  } catch (err) {
    console.error(`[FFmpeg] Pipeline error for track ${trackId}:`, err.message);
    // Non-fatal — track upload still succeeded
  }
}

// ─── MRT: Trigger Background Scan ────────────────────────────────────────────

/**
 * Triggers an ACRCloud MRT scan for a track.
 * Gets a signed S3 URL for the mastered audio file and submits it to ACRCloud.
 * Once submitted, polls every 30 seconds (up to 10 minutes) for the result,
 * then updates the track's waveformData with the verdict.
 * 
 * This runs entirely in the background — the seller gets an immediate response.
 * 
 * @param {string} trackId  - Our internal track ID
 * @param {string} audioKey - S3 key of the mastered audio file
 */
async function triggerMRTScan(trackId, audioKey) {
  console.log(`[MRT] Starting scan for track ${trackId}`);
  try {
    // Get a 2-hour signed URL (ACRCloud will fetch from S3 directly)
    const signedUrl = await getSignedDownloadUrl(audioKey, 7200); // 2 hours

    // Submit to ACRCloud
    const { fileId } = await submitTrackForMRT(signedUrl, trackId);
    console.log(`[MRT] Submitted track ${trackId} → ACRCloud file ID: ${fileId}`);

    // Store fileId in waveformData immediately so admin can reference it
    await updateTrackWaveformField(trackId, { mrtFileId: fileId, mrtStatus: 'scanning' });

    // Poll for result — ACRCloud scans usually complete in 1–5 minutes
    pollMRTResult(trackId, fileId);
  } catch (err) {
    console.error(`[MRT] Scan trigger failed for track ${trackId}:`, err.message);
    // Mark as error so admin knows to review manually
    await updateTrackWaveformField(trackId, {
      mrtStatus: 'error',
      mrtVerdict: { status: 'error', reason: `Scan trigger failed: ${err.message}` },
      mrtScannedAt: new Date().toISOString(),
    }).catch(() => {});
  }
}

/**
 * Poll ACRCloud for scan result.
 * Retries every 30 seconds, up to 20 attempts (10 minutes total).
 * On timeout, marks as error for manual admin review.
 */
async function pollMRTResult(trackId, fileId, attempt = 0) {
  const MAX_ATTEMPTS   = 20;  // 20 × 30s = 10 minutes max
  const POLL_INTERVAL  = 30_000; // 30 seconds

  if (attempt >= MAX_ATTEMPTS) {
    console.warn(`[MRT] Scan timed out for track ${trackId} after ${MAX_ATTEMPTS} attempts`);
    await updateTrackWaveformField(trackId, {
      mrtStatus:   'error',
      mrtVerdict:  { status: 'error', reason: 'MRT scan timed out after 10 minutes — manual review required' },
      mrtScannedAt: new Date().toISOString(),
    }).catch(() => {});
    return;
  }

  setTimeout(async () => {
    try {
      const result  = await getMRTResult(fileId);
      const verdict = parseMRTVerdict(result);

      if (verdict.status === 'scanning') {
        // Still processing — poll again
        return pollMRTResult(trackId, fileId, attempt + 1);
      }

      console.log(`[MRT] Scan complete for track ${trackId}: ${verdict.status} — ${verdict.reason}`);

      // Determine new track status based on verdict
      // rejected → keep PENDING but mark for auto-reject (admin sees red badge)
      // flagged  → keep PENDING (admin sees yellow badge and decides)
      // clean    → keep PENDING (admin sees green badge — safe to approve)
      // error    → keep PENDING (admin reviews manually)
      const mrtUpdate = {
        mrtStatus:    verdict.status,
        mrtVerdict:   verdict,
        mrtScannedAt: new Date().toISOString(),
        mrtFileId:    fileId,
      };

      await updateTrackWaveformField(trackId, mrtUpdate);
      console.log(`[MRT] Updated waveformData for track ${trackId} with verdict: ${verdict.status}`);
    } catch (err) {
      console.error(`[MRT] Poll attempt ${attempt + 1} failed for track ${trackId}:`, err.message);
      // If fetch fails, retry
      return pollMRTResult(trackId, fileId, attempt + 1);
    }
  }, POLL_INTERVAL);
}

/**
 * Safely merge fields into waveformData JSON for a track.
 * Uses a raw SQL update to merge JSON without overwriting other fields.
 */
async function updateTrackWaveformField(trackId, fields) {
  // Get current waveformData then merge
  const track = await prisma.track.findUnique({
    where: { id: trackId },
    select: { waveformData: true },
  });
  if (!track) return;

  const merged = { ...(track.waveformData ?? {}), ...fields };
  await prisma.track.update({
    where: { id: trackId },
    data: { waveformData: merged },
  });
}

// ─── MRT: Get Track MRT Status ────────────────────────────────────────────────

/**
 * GET /api/v1/tracks/:id/mrt-status
 * Admin-only: get the MRT scan status and verdict for a track
 */
export async function getTrackMRTStatus(req, res) {
  try {
    const { id } = req.params;

    const track = await prisma.track.findUnique({
      where: { id },
      select: { id: true, title: true, waveformData: true, status: true },
    });

    if (!track) return errorResponse(res, 404, 'Track not found');

    const wd = track.waveformData ?? {};
    return successResponse(res, 200, 'MRT status fetched', {
      trackId:     track.id,
      trackTitle:  track.title,
      trackStatus: track.status,
      mrt: {
        status:     wd.mrtStatus     ?? 'not_scanned',
        fileId:     wd.mrtFileId     ?? null,
        verdict:    wd.mrtVerdict    ?? null,
        scannedAt:  wd.mrtScannedAt  ?? null,
      },
    });
  } catch (err) {
    console.error('Get MRT status error:', err);
    return errorResponse(res, 500, 'Failed to fetch MRT status');
  }
}

/**
 * POST /api/v1/tracks/:id/mrt-rescan
 * Admin-only: manually trigger a fresh MRT scan for a track
 */
export async function retriggerMRTScan(req, res) {
  try {
    const { id } = req.params;

    const track = await prisma.track.findUnique({
      where: { id },
      select: { id: true, audioUrl: true, status: true },
    });

    if (!track) return errorResponse(res, 404, 'Track not found');
    if (!track.audioUrl) return errorResponse(res, 400, 'Track has no audio file');

    // Reset MRT status
    await updateTrackWaveformField(id, {
      mrtStatus:    'scanning',
      mrtVerdict:   null,
      mrtScannedAt: null,
      mrtFileId:    null,
    });

    // Trigger fresh scan
    triggerMRTScan(id, track.audioUrl).catch((err) => {
      console.error(`[MRT] Re-scan trigger failed for track ${id}:`, err.message);
    });

    return successResponse(res, 200, 'MRT re-scan triggered');
  } catch (err) {
    console.error('Re-trigger MRT scan error:', err);
    return errorResponse(res, 500, 'Failed to trigger MRT re-scan');
  }
}

/**
 * GET /api/v1/tracks/:id/preview-url
 * Returns a fresh signed URL for audio preview
 * Rate limited — see rateLimit.middleware.js
 */
export async function getTrackPreviewUrl(req, res) {
  try {
    const { id } = req.params;

    const track = await prisma.track.findUnique({
      where: { id },
      select: { audioUrl: true, status: true, sellerId: true },
    });

    if (!track) {
      return errorResponse(res, 404, 'Track not found');
    }

    // Only approved tracks get preview URLs (or the seller themselves)
    const requesterId = req.user?.id;
    if (track.status !== 'APPROVED' && track.sellerId !== requesterId) {
      return errorResponse(res, 403, 'Track is not available for preview');
    }

    if (!track.audioUrl) {
      return errorResponse(res, 404, 'Audio file not found');
    }

    const previewUrl = await getPreviewUrl(track.audioUrl);

    return successResponse(res, 200, 'Preview URL generated', {
      previewUrl,
      expiresIn: 1800, // 30 minutes
    });
  } catch (error) {
    console.error('Get preview URL error:', error);
    return errorResponse(res, 500, 'Failed to generate preview URL');
  }
}
