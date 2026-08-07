import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import prisma from '../config/database.js';

/**
 * Authenticate user via JWT token
 */
export async function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        role: true,
        avatarUrl: true,
        sellerModeEnabled: true,
        sellerVerified: true,
        isVerified: true,
      },
    });

    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired token');
  }
}

/**
 * Optional authentication - attach user if token exists, otherwise continue
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        role: true,
      },
    });

    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
}

/**
 * Check if user has required role
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, 'Forbidden: Insufficient permissions');
    }

    next();
  };
}

/**
 * Check if seller mode is enabled
 */
export function requireSellerMode(req, res, next) {
  if (!req.user) {
    return errorResponse(res, 401, 'Unauthorized');
  }

  if (!req.user.sellerModeEnabled) {
    return errorResponse(res, 403, 'Seller mode not enabled');
  }

  next();
}
