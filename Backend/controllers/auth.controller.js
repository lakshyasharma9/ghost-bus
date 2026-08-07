import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { errorResponse, successResponse } from '../utils/response.js';

/**
 * Signup - Register new user
 */
export async function signup(req, res) {
  try {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(res, 400, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (default role: BUYER)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'BUYER',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user);

    return successResponse(res, 201, 'Account created successfully', {
      user,
      ...tokens,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse(res, 500, 'Failed to create account');
  }
}

/**
 * Login - Authenticate user
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, 200, 'Login successful', {
      user: userWithoutPassword,
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Failed to login');
  }
}

/**
 * Refresh token - Get new access token
 */
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 400, 'Refresh token required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    return successResponse(res, 200, 'Token refreshed', tokens);
  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, 401, 'Invalid or expired refresh token');
  }
}

/**
 * Logout - Clear tokens (client-side)
 */
export async function logout(req, res) {
  // In a stateless JWT system, logout is handled client-side
  // by removing tokens from storage
  return successResponse(res, 200, 'Logout successful');
}

/**
 * Get current user profile
 */
export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        role: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        isVerified: true,
        sellerModeEnabled: true,
        sellerVerified: true,
        sellerApplicationStatus: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'Profile retrieved', { user });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 500, 'Failed to get profile');
  }
}
