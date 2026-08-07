import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { errorResponse, successResponse } from '../utils/response.js';
import { uploadToS3, validateFile } from '../utils/s3.js';

/**
 * Toggle seller mode — only allowed if user is verified as a seller
 */
export async function toggleSellerMode(req, res) {
  try {
    const { enabled } = req.body;
    const userId = req.user.id;

    // If trying to enable, check if user is already a verified seller
    if (enabled) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { sellerVerified: true, sellerApplicationStatus: true, role: true },
      });

      if (!user.sellerVerified) {
        // Check if already has a pending application
        if (user.sellerApplicationStatus === 'pending') {
          return errorResponse(res, 403, 'Your seller application is pending review. Please wait for admin approval.');
        }
        return errorResponse(res, 403, 'Seller verification required. Please complete Account Verification first.');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { sellerModeEnabled: enabled },
      select: {
        id: true, email: true, fullName: true, username: true,
        role: true, avatarUrl: true, sellerModeEnabled: true, sellerVerified: true,
        sellerApplicationStatus: true,
      },
    });

    return successResponse(res, 200, 'Seller mode updated', { user: updatedUser });
  } catch (error) {
    console.error('Toggle seller mode error:', error);
    return errorResponse(res, 500, 'Failed to toggle seller mode');
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { fullName, username, bio, avatarUrl, bannerUrl, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName !== undefined   && { fullName }),
        ...(username !== undefined   && { username }),
        ...(bio !== undefined        && { bio }),
        ...(avatarUrl !== undefined  && { avatarUrl }),
        ...(bannerUrl !== undefined  && { bannerUrl }),
        ...(phone !== undefined      && { phone }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        phone: true,
        role: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        sellerModeEnabled: true,
        sellerVerified: true,
      },
    });

    return successResponse(res, 200, 'Profile updated', { user });
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, 409, 'Username is already taken');
    }
    console.error('Update profile error:', error);
    return errorResponse(res, 500, 'Failed to update profile');
  }
}

/**
 * Change password
 */
export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Fetch user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 500, 'Failed to change password');
  }
}

/**
 * Upload avatar to S3 and update profile
 */
export async function uploadAvatar(req, res) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return errorResponse(res, 400, 'No file provided');
    }

    // Validate image type and size
    validateFile(req.file, 'image');

    // Upload to S3
    const key = await uploadToS3(req.file, 'avatars', userId);

    // Build a CloudFront / S3 public URL from the key
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;
    const avatarUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    // Persist URL on user record
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        phone: true,
        role: true,
        avatarUrl: true,
        bio: true,
        sellerModeEnabled: true,
        sellerVerified: true,
      },
    });

    return successResponse(res, 200, 'Avatar uploaded', { user, avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return errorResponse(res, 500, error.message || 'Failed to upload avatar');
  }
}

/**
 * Submit seller verification application
 * POST /api/v1/users/seller-application
 * Stores the complete application JSON in the bio field
 */
export async function submitSellerApplication(req, res) {
  try {
    const userId = req.user.id;

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { sellerApplicationStatus: true, sellerVerified: true },
    });

    if (existing.sellerVerified) {
      return errorResponse(res, 400, 'You are already a verified seller.');
    }
    if (existing.sellerApplicationStatus === 'pending') {
      return errorResponse(res, 400, 'You already have a pending seller application.');
    }

    // Store the ENTIRE request body as JSON in bio — admin reads this
    // Remove any file or internal fields, keep everything else
    const { passportFile, ...applicationData } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        sellerApplicationStatus: 'pending',
        bio: JSON.stringify(applicationData),
      },
      select: {
        id: true, email: true, fullName: true, username: true,
        role: true, sellerModeEnabled: true, sellerVerified: true,
        sellerApplicationStatus: true,
      },
    });

    return successResponse(res, 201, 'Seller application submitted successfully. Review takes 2–3 business days.', {
      user: updatedUser,
    });
  } catch (error) {
    console.error('Submit seller application error:', error);
    return errorResponse(res, 500, 'Failed to submit seller application');
  }
}

/**
 * Get current user's seller application status
 * GET /api/v1/users/seller-application/status
 */
export async function getSellerApplicationStatus(req, res) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        sellerApplicationStatus: true,
        sellerVerified: true,
        sellerModeEnabled: true,
        kycSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
          select: { status: true, rejectionReason: true, submittedAt: true },
        },
      },
    });

    const latestKyc = user.kycSubmissions?.[0] ?? null;
    return successResponse(res, 200, 'Seller application status', {
      applicationStatus: user.sellerApplicationStatus,
      sellerVerified: user.sellerVerified,
      sellerModeEnabled: user.sellerModeEnabled,
      kyc: latestKyc,
    });
  } catch (error) {
    console.error('Get seller application status error:', error);
    return errorResponse(res, 500, 'Failed to get application status');
  }
}

/**
 * Submit KYC identity documents (for approved sellers who need payout identity verification)
 * POST /api/v1/users/kyc
 */
export async function submitKyc(req, res) {
  try {
    const userId = req.user.id;

    // Check if user already has approved KYC
    const existingKyc = await prisma.kYCSubmission.findFirst({
      where: { userId, status: 'APPROVED' },
    });
    if (existingKyc) {
      return errorResponse(res, 400, 'Your identity has already been verified.');
    }

    // Upload document to S3 if provided
    let documentUrl = 'pending';
    if (req.file) {
      validateFile(req.file, 'image');
      documentUrl = await uploadToS3(req.file, 'kyc/documents', userId);
    }

    const { documentType = 'Passport', paypalEmail, firstName, lastName, address, zip, city, country } = req.body;

    // Store extra KYC form data as JSON in documentType field for admin review
    const kycData = JSON.stringify({ documentType, firstName, lastName, address, zip, city, country, paypalEmail });

    // Create KYC submission record
    const kyc = await prisma.kYCSubmission.create({
      data: {
        userId,
        documentType: kycData,
        documentUrl,
        status: 'PENDING',
      },
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' },
    });

    return successResponse(res, 201, 'KYC documents submitted. Review takes 2–3 business days.', { kyc });
  } catch (error) {
    console.error('Submit KYC error:', error);
    return errorResponse(res, 500, 'Failed to submit KYC documents');
  }
}
