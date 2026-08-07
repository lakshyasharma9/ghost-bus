import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for upload endpoints
 * Sellers can upload max 10 tracks per hour
 */
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many uploads. You can upload up to 10 tracks per hour.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
});

/**
 * Rate limiter for marketplace listing (public)
 * 200 requests per 15 minutes per IP
 */
export const marketplaceRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for signed URL generation
 * Prevents abuse of S3 signed URL endpoint
 */
export const signedUrlRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many preview requests. Please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
});
