import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Admin sessions last 24 hours — no need for short rotation since admins are trusted
const ADMIN_JWT_EXPIRES_IN = '24h';

/**
 * Generate access token
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Generate access token with custom expiry (used for admin sessions)
 */
export function generateAccessTokenWithExpiry(payload, expiresIn) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Generate both tokens.
 * ADMIN users get a 24h access token.
 */
export function generateTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const isAdmin = user.role === 'ADMIN';

  return {
    accessToken: isAdmin
      ? generateAccessTokenWithExpiry(payload, ADMIN_JWT_EXPIRES_IN)
      : generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
