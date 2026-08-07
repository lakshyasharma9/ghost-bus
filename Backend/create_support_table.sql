-- Run this SQL directly in Supabase SQL Editor
-- This creates the support_tickets table without using Prisma migrate

-- Create enums
DO $$ BEGIN
    CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TicketCategory" AS ENUM ('GENERAL_INQUIRY', 'TECHNICAL_SUPPORT', 'BILLING_PAYMENT', 'ACCOUNT_ISSUE', 'TRACK_ISSUE', 'LEGAL_COPYRIGHT', 'SELLER_SUPPORT', 'BUG_REPORT', 'FEATURE_REQUEST', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create table
CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" TEXT NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "user_type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL DEFAULT 'GENERAL_INQUIRY',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "message" TEXT NOT NULL,
    "attachment_url" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "user_id" TEXT,
    "assigned_to_id" TEXT,
    "admin_notes" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "support_tickets_ticket_number_key" ON "support_tickets"("ticket_number");
CREATE INDEX IF NOT EXISTS "support_tickets_status_idx" ON "support_tickets"("status");
CREATE INDEX IF NOT EXISTS "support_tickets_category_idx" ON "support_tickets"("category");
CREATE INDEX IF NOT EXISTS "support_tickets_priority_idx" ON "support_tickets"("priority");
CREATE INDEX IF NOT EXISTS "support_tickets_email_idx" ON "support_tickets"("email");

-- Add foreign keys (only if users table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE "support_tickets" DROP CONSTRAINT IF EXISTS "support_tickets_user_id_fkey";
        ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        
        ALTER TABLE "support_tickets" DROP CONSTRAINT IF EXISTS "support_tickets_assigned_to_id_fkey";
        ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_id_fkey" 
            FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Success message
SELECT 'Support tickets table created successfully!' AS message;
