-- AlterTable
ALTER TABLE "Plan" ADD COLUMN "hasTables" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Plan" ADD COLUMN "hasOrdering" BOOLEAN NOT NULL DEFAULT false;

-- Paid plans include table management and ordering when those features ship.
UPDATE "Plan"
SET "hasTables" = true, "hasOrdering" = true
WHERE slug IN ('pro', 'business');
