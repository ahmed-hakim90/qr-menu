-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'INACTIVE', 'LOST', 'BROKEN', 'DISABLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('QR_ONLY', 'NFC_ONLY', 'QR_AND_NFC', 'TABLE_STAND', 'TABLE_STICKER', 'ACRYLIC_STAND', 'TENT_CARD');

-- CreateEnum
CREATE TYPE "NfcWriteStatus" AS ENUM ('PENDING', 'WRITTEN', 'FAILED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "PrintQueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PrintSheetType" AS ENUM ('A4', 'LABEL_SHEET', 'STICKER_SHEET', 'PVC_CARD', 'ACRYLIC_STAND', 'TABLE_TENT');

-- CreateTable
CREATE TABLE "PlatformCard" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "cardType" "CardType" NOT NULL DEFAULT 'QR_ONLY',
    "status" "CardStatus" NOT NULL DEFAULT 'AVAILABLE',
    "qrImage" TEXT,
    "nfcUid" TEXT,
    "secretKey" TEXT NOT NULL,
    "printCode" TEXT,
    "nfcWriteStatus" "NfcWriteStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "lastScanAt" TIMESTAMP(3),
    "batchId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardAssignment" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "unassignedAt" TIMESTAMP(3),

    CONSTRAINT "CardAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardScanLog" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "restaurantId" TEXT,
    "branchId" TEXT,
    "tableId" TEXT,
    "token" TEXT NOT NULL,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "language" TEXT,
    "referrer" TEXT,
    "ipHash" TEXT,
    "responseTime" INTEGER,
    "userAgent" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardBatch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cardType" "CardType" NOT NULL DEFAULT 'QR_ONLY',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintQueueItem" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "sheetType" "PrintSheetType" NOT NULL DEFAULT 'A4',
    "status" "PrintQueueStatus" NOT NULL DEFAULT 'PENDING',
    "includeRestaurantName" BOOLEAN NOT NULL DEFAULT false,
    "includeTableNumber" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PrintQueueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformCardSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "scanBaseUrl" TEXT NOT NULL DEFAULT 'https://menu.yourdomain.com',
    "tokenLength" INTEGER NOT NULL DEFAULT 8,
    "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 60,
    "defaultCardType" "CardType" NOT NULL DEFAULT 'QR_ONLY',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformCardSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformCard_uuid_key" ON "PlatformCard"("uuid");
CREATE UNIQUE INDEX "PlatformCard_token_key" ON "PlatformCard"("token");
CREATE UNIQUE INDEX "PlatformCard_serialNumber_key" ON "PlatformCard"("serialNumber");
CREATE INDEX "PlatformCard_status_idx" ON "PlatformCard"("status");
CREATE INDEX "PlatformCard_cardType_idx" ON "PlatformCard"("cardType");
CREATE INDEX "PlatformCard_batchId_idx" ON "PlatformCard"("batchId");
CREATE INDEX "PlatformCard_lastScanAt_idx" ON "PlatformCard"("lastScanAt");

-- CreateIndex
CREATE INDEX "CardAssignment_cardId_idx" ON "CardAssignment"("cardId");
CREATE INDEX "CardAssignment_restaurantId_idx" ON "CardAssignment"("restaurantId");
CREATE INDEX "CardAssignment_branchId_idx" ON "CardAssignment"("branchId");
CREATE INDEX "CardAssignment_tableId_idx" ON "CardAssignment"("tableId");
CREATE INDEX "CardAssignment_active_idx" ON "CardAssignment"("active");
CREATE INDEX "CardAssignment_assignedAt_idx" ON "CardAssignment"("assignedAt");

-- CreateIndex
CREATE INDEX "CardScanLog_cardId_idx" ON "CardScanLog"("cardId");
CREATE INDEX "CardScanLog_token_idx" ON "CardScanLog"("token");
CREATE INDEX "CardScanLog_scannedAt_idx" ON "CardScanLog"("scannedAt");
CREATE INDEX "CardScanLog_restaurantId_idx" ON "CardScanLog"("restaurantId");

-- CreateIndex
CREATE INDEX "CardBatch_createdAt_idx" ON "CardBatch"("createdAt");

-- CreateIndex
CREATE INDEX "PrintQueueItem_status_idx" ON "PrintQueueItem"("status");
CREATE INDEX "PrintQueueItem_cardId_idx" ON "PrintQueueItem"("cardId");

-- AddForeignKey
ALTER TABLE "PlatformCard" ADD CONSTRAINT "PlatformCard_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "CardBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlatformCard" ADD CONSTRAINT "PlatformCard_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "PlatformAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAssignment" ADD CONSTRAINT "CardAssignment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PlatformCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CardAssignment" ADD CONSTRAINT "CardAssignment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CardAssignment" ADD CONSTRAINT "CardAssignment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CardAssignment" ADD CONSTRAINT "CardAssignment_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DiningTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CardAssignment" ADD CONSTRAINT "CardAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "PlatformAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardScanLog" ADD CONSTRAINT "CardScanLog_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PlatformCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CardScanLog" ADD CONSTRAINT "CardScanLog_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CardScanLog" ADD CONSTRAINT "CardScanLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CardScanLog" ADD CONSTRAINT "CardScanLog_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DiningTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintQueueItem" ADD CONSTRAINT "PrintQueueItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PlatformCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default settings
INSERT INTO "PlatformCardSettings" ("id", "scanBaseUrl", "tokenLength", "rateLimitPerMinute", "defaultCardType", "updatedAt")
VALUES ('default', 'https://menu.yourdomain.com', 8, 60, 'QR_ONLY', CURRENT_TIMESTAMP);
