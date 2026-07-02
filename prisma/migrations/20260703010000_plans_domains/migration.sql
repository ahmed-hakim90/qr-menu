-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "priceMonthly" DOUBLE PRECISION NOT NULL,
    "maxBranches" INTEGER NOT NULL,
    "maxProducts" INTEGER NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "customDomain" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3),
    "paymentReference" TEXT,
    "paymentNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "subdomain" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "customDomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");
CREATE UNIQUE INDEX "Subscription_restaurantId_key" ON "Subscription"("restaurantId");
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");
CREATE UNIQUE INDEX "Restaurant_subdomain_key" ON "Restaurant"("subdomain");
CREATE UNIQUE INDEX "Restaurant_customDomain_key" ON "Restaurant"("customDomain");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default plans
INSERT INTO "Plan" ("id", "slug", "nameAr", "nameEn", "priceMonthly", "maxBranches", "maxProducts", "maxUsers", "customDomain", "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('plan_free', 'free', 'مجاني', 'Free', 0, 1, 30, 2, false, 0, true, NOW(), NOW()),
  ('plan_pro', 'pro', 'احترافي', 'Pro', 99, 3, 150, 5, false, 1, true, NOW(), NOW()),
  ('plan_business', 'business', 'أعمال', 'Business', 249, 10, 500, 15, true, 2, true, NOW(), NOW());

-- Backfill subdomain from slug
UPDATE "Restaurant" SET "subdomain" = "slug" WHERE "subdomain" IS NULL;

-- Create subscriptions for existing restaurants on free plan
INSERT INTO "Subscription" ("id", "restaurantId", "planId", "status", "currentPeriodStart", "createdAt", "updatedAt")
SELECT
  'sub_' || "id",
  "id",
  'plan_free',
  'ACTIVE',
  NOW(),
  NOW(),
  NOW()
FROM "Restaurant"
WHERE NOT EXISTS (
  SELECT 1 FROM "Subscription" s WHERE s."restaurantId" = "Restaurant"."id"
);
