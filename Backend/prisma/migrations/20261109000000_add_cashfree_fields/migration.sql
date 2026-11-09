-- Add Cashfree payment fields to orders table
-- Migration: 20261109000000_add_cashfree_fields

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'EUR';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cashfree_order_id" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cashfree_cf_payment_id" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "exchange_rate" DECIMAL(10,4);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "buyer_country" TEXT;

-- Unique constraint on cashfree_order_id
CREATE UNIQUE INDEX IF NOT EXISTS "orders_cashfree_order_id_key" ON "orders"("cashfree_order_id");

-- Update existing orders to have paymentMethod = 'PAYPAL' if paypalOrderId is set
UPDATE "orders" SET "payment_method" = 'PAYPAL' WHERE "paypal_order_id" IS NOT NULL AND "payment_method" IS NULL;
