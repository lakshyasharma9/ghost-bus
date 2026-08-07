-- CreateTable: recently_sold
CREATE TABLE "recently_sold" (
  "id"            TEXT NOT NULL,
  "track_name"    TEXT NOT NULL,
  "genre"         TEXT NOT NULL,
  "image_url"     TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "is_active"     BOOLEAN NOT NULL DEFAULT true,
  "sold_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recently_sold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recently_sold_is_active_display_order_idx" ON "recently_sold"("is_active", "display_order");
