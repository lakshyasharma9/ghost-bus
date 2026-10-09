-- Add PayPal fields to orders table and isSold to tracks
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paypal_order_id" TEXT UNIQUE;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paypal_capture_id" TEXT UNIQUE;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_method" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "buyer_email" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "buyer_phone" TEXT;
ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "is_sold" BOOLEAN NOT NULL DEFAULT false;
