/**
 * ACRCloud MRT (Music Recognition Technology) Utility
 * Uses File Scanning API to detect:
 *  - Previously released tracks (music[] matches)
 *  - Cover songs / derivative works (cover_songs[] matches)
 *  - AI-generated music (ai_detection[].ai_probability)
 * 
 * Container Region: ap-southeast-1
 * Docs: https://docs.acrcloud.com/reference/console-api/file-scanning
 */

// ── Read credentials lazily inside functions — NOT at module level.
// Module-level reads happen before dotenv.config() loads .env.local
// which means they'd always be undefined.
const getBaseUrl   = () => `https://api-${process.env.ACRCLOUD_REGION || 'ap-southeast-1'}.acrcloud.com`;
const getToken     = () => process.env.ACRCLOUD_ACCESS_TOKEN;
const getContainer = () => process.env.ACRCLOUD_CONTAINER_ID;

// AI probability thresholds
export const MRT_AI_THRESHOLD_WARN   = 35;  // 35%+ → Flag as "Likely AI"
export const MRT_AI_THRESHOLD_REJECT = 70;  // 70%+ → Auto-reject as "Pure AI"

/**
 * Submit an audio URL to ACRCloud File Scanning for MRT analysis.
 * Uses audio_url data_type — sends a pre-signed S3 URL, so ACRCloud
 * fetches the file directly. No file upload to our server needed.
 * 
 * @param {string} audioUrl  - Pre-signed S3 URL of the audio file
 * @param {string} trackId   - Our internal track ID (used as filename for reference)
 * @returns {Promise<{fileId: string, state: number}>}
 */
export async function submitTrackForMRT(audioUrl, trackId) {
  if (!getToken() || !getContainer()) {
    throw new Error('ACRCloud credentials not configured (ACRCLOUD_ACCESS_TOKEN, ACRCLOUD_CONTAINER_ID)');
  }

  const response = await fetch(
    `${getBaseUrl()}/api/fs-containers/${getContainer()}/files`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data_type: 'audio_url',
        url:       audioUrl,
        name:      `ghostbus-track-${trackId}`,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`ACRCloud submission failed (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const data = json?.data;

  if (!data?.id) {
    throw new Error('ACRCloud returned unexpected response: missing file ID');
  }

  return {
    fileId: data.id,
    state:  data.state, // 0 = processing
    name:   data.name,
  };
}

/**
 * Poll ACRCloud for scan results for a specific file.
 * Use this to manually check status when no callback is configured.
 * 
 * @param {string} fileId - ACRCloud file ID returned from submitTrackForMRT
 * @returns {Promise<ACRCloudResult>}
 */
export async function getMRTResult(fileId) {
  if (!getToken() || !getContainer()) {
    throw new Error('ACRCloud credentials not configured');
  }

  const response = await fetch(
    `${getBaseUrl()}/api/fs-containers/${getContainer()}/files/${fileId}`,
    {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`ACRCloud result fetch failed (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  return json?.data ?? null;
}

/**
 * Parse and normalize an ACRCloud result into a clean MRT verdict.
 * This is the single source of truth for MRT decision logic.
 * 
 * @param {object} acrResult - Raw ACRCloud file result object
 * @returns {MRTVerdict}
 */
export function parseMRTVerdict(acrResult) {
  if (!acrResult) {
    return { status: 'error', reason: 'No result received from ACRCloud' };
  }

  // state: 0 = processing, 1 = ready, -1 = no results, -2/-3 = error
  if (acrResult.state === 0) {
    return { status: 'scanning', reason: 'Scan still in progress' };
  }
  if (acrResult.state === -1) {
    // No matches found — clean
    return { status: 'clean', reason: 'No matches found', details: null };
  }
  if (acrResult.state < 0) {
    return { status: 'error', reason: `ACRCloud scan error (state: ${acrResult.state})` };
  }

  const results      = acrResult.results ?? {};
  const musicMatches = results.music        ?? [];
  const coverMatches = results.cover_songs  ?? [];
  const aiDetection  = results.ai_detection ?? [];

  // ── Check 1: Known released track ─────────────────────────────────────────
  if (musicMatches.length > 0) {
    const topMatch = musicMatches[0]?.result;
    return {
      status: 'rejected',
      reason: 'Track matches a known released recording',
      details: {
        matchType:    'released_track',
        matchTitle:   topMatch?.title ?? 'Unknown',
        matchArtist:  topMatch?.artists?.[0]?.name ?? 'Unknown',
        matchLabel:   topMatch?.label ?? null,
        matchScore:   topMatch?.score ?? null,
        isrc:         topMatch?.external_ids?.isrc ?? null,
        spotifyId:    topMatch?.external_metadata?.spotify?.track?.id ?? null,
      },
    };
  }

  // ── Check 2: Cover song / derivative work ──────────────────────────────────
  if (coverMatches.length > 0) {
    const topMatch = coverMatches[0]?.result;
    return {
      status: 'flagged',
      reason: 'Track shows similarity to a known song (possible derivative work)',
      details: {
        matchType:   'cover_song',
        matchTitle:  topMatch?.title ?? 'Unknown',
        matchArtist: topMatch?.artists?.[0]?.name ?? 'Unknown',
        matchScore:  topMatch?.score ?? null,
      },
    };
  }

  // ── Check 3: AI-generated music ───────────────────────────────────────────
  if (aiDetection.length > 0) {
    const aiResult     = aiDetection[0];
    const aiProbability = aiResult?.ai_probability ?? 0;
    const prediction   = aiResult?.prediction ?? 'unknown';

    if (aiProbability >= MRT_AI_THRESHOLD_REJECT) {
      return {
        status: 'rejected',
        reason: `AI-generated music detected (${aiProbability.toFixed(1)}% probability)`,
        details: {
          matchType:      'ai_generated',
          aiProbability,
          prediction,
          likelySource:   aiResult?.likely_source ?? null,
          topAiSource:    aiResult?.source_probabilities?.[0]?.source ?? null,
        },
      };
    }

    if (aiProbability >= MRT_AI_THRESHOLD_WARN) {
      return {
        status: 'flagged',
        reason: `Possible AI-generated music (${aiProbability.toFixed(1)}% probability — manual review required)`,
        details: {
          matchType:    'ai_possible',
          aiProbability,
          prediction,
          likelySource: aiResult?.likely_source ?? null,
        },
      };
    }
  }

  // ── All checks passed ─────────────────────────────────────────────────────
  return {
    status:  'clean',
    reason:  'No copyright or AI issues detected',
    details: {
      aiProbability: aiDetection[0]?.ai_probability ?? 0,
      prediction:    aiDetection[0]?.prediction ?? 'human',
    },
  };
}

/**
 * @typedef {Object} MRTVerdict
 * @property {'scanning'|'clean'|'flagged'|'rejected'|'error'} status
 * @property {string} reason
 * @property {object|null} [details]
 */
