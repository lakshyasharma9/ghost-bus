-- Add dedicated isSuspended field (separate from isVerified which is email-verification)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_suspended" BOOLEAN NOT NULL DEFAULT false;
