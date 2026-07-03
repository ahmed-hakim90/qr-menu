-- CreateEnum
CREATE TYPE "ThemePurchaseStatus" AS ENUM ('PENDING', 'ACTIVE');

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "menuTheme" TEXT NOT NULL DEFAULT 'classic';

-- CreateTable
CREATE TABLE "ThemePurchase" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "themeSlug" TEXT NOT NULL,
    "status" "ThemePurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "pricePaid" DOUBLE PRECISION NOT NULL,
    "paymentReference" TEXT,
    "paymentNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ThemePurchase_restaurantId_idx" ON "ThemePurchase"("restaurantId");
CREATE UNIQUE INDEX "ThemePurchase_restaurantId_themeSlug_key" ON "ThemePurchase"("restaurantId", "themeSlug");

-- AddForeignKey
ALTER TABLE "ThemePurchase" ADD CONSTRAINT "ThemePurchase_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate Antika restaurant to use antika menu theme
UPDATE "Settings"
SET "menuTheme" = 'antika'
FROM "Restaurant"
WHERE "Settings"."restaurantId" = "Restaurant"."id"
  AND "Restaurant"."slug" = 'antika-beirut';
