ALTER TABLE "Settings" ALTER COLUMN "currency" SET DEFAULT 'EGP';
ALTER TABLE "Settings" ALTER COLUMN "currencySymbol" SET DEFAULT 'ج.م';
UPDATE "Settings" SET "currency" = 'EGP', "currencySymbol" = 'ج.م';
