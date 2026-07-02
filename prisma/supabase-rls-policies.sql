-- Multi-tenant RLS policies for Supabase / PostgreSQL
--
-- Notes:
-- 1) Prisma direct connections using the postgres/service role bypass RLS.
-- 2) Apply these policies when exposing tables through Supabase client APIs.
-- 3) Before authenticated writes, set the tenant context:
--    SELECT set_config('app.restaurant_id', '<restaurant-id>', true);
--
-- Public menu reads stay open. Dashboard writes are tenant-scoped.

ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Branch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductBranch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Addon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductAddon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Size" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductSize" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Offer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Gallery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QRCode" ENABLE ROW LEVEL SECURITY;

-- Public read policies (QR menu)
DROP POLICY IF EXISTS "public_read_restaurant" ON "Restaurant";
CREATE POLICY "public_read_restaurant" ON "Restaurant" FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_branch" ON "Branch";
CREATE POLICY "public_read_branch" ON "Branch" FOR SELECT USING ("isActive" = true);

DROP POLICY IF EXISTS "public_read_category" ON "Category";
CREATE POLICY "public_read_category" ON "Category" FOR SELECT USING ("isVisible" = true);

DROP POLICY IF EXISTS "public_read_product" ON "Product";
CREATE POLICY "public_read_product" ON "Product" FOR SELECT USING ("isAvailable" = true);

DROP POLICY IF EXISTS "public_read_product_image" ON "ProductImage";
CREATE POLICY "public_read_product_image" ON "ProductImage" FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_product_branch" ON "ProductBranch";
CREATE POLICY "public_read_product_branch" ON "ProductBranch" FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_addon" ON "Addon";
CREATE POLICY "public_read_addon" ON "Addon" FOR SELECT USING ("isActive" = true);

DROP POLICY IF EXISTS "public_read_product_addon" ON "ProductAddon";
CREATE POLICY "public_read_product_addon" ON "ProductAddon" FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_size" ON "Size";
CREATE POLICY "public_read_size" ON "Size" FOR SELECT USING ("isActive" = true);

DROP POLICY IF EXISTS "public_read_product_size" ON "ProductSize";
CREATE POLICY "public_read_product_size" ON "ProductSize" FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_offer" ON "Offer";
CREATE POLICY "public_read_offer" ON "Offer" FOR SELECT USING ("isActive" = true);

DROP POLICY IF EXISTS "public_read_settings" ON "Settings";
CREATE POLICY "public_read_settings" ON "Settings" FOR SELECT USING (true);

-- Tenant-scoped dashboard policies
DROP POLICY IF EXISTS "tenant_branch_all" ON "Branch";
CREATE POLICY "tenant_branch_all" ON "Branch"
  FOR ALL
  USING ("restaurantId" = current_setting('app.restaurant_id', true))
  WITH CHECK ("restaurantId" = current_setting('app.restaurant_id', true));

DROP POLICY IF EXISTS "tenant_category_all" ON "Category";
CREATE POLICY "tenant_category_all" ON "Category"
  FOR ALL
  USING ("restaurantId" = current_setting('app.restaurant_id', true))
  WITH CHECK ("restaurantId" = current_setting('app.restaurant_id', true));

DROP POLICY IF EXISTS "tenant_product_all" ON "Product";
CREATE POLICY "tenant_product_all" ON "Product"
  FOR ALL
  USING ("restaurantId" = current_setting('app.restaurant_id', true))
  WITH CHECK ("restaurantId" = current_setting('app.restaurant_id', true));

DROP POLICY IF EXISTS "tenant_addon_all" ON "Addon";
CREATE POLICY "tenant_addon_all" ON "Addon"
  FOR ALL
  USING ("restaurantId" = current_setting('app.restaurant_id', true))
  WITH CHECK ("restaurantId" = current_setting('app.restaurant_id', true));

DROP POLICY IF EXISTS "tenant_size_all" ON "Size";
CREATE POLICY "tenant_size_all" ON "Size"
  FOR ALL
  USING ("restaurantId" = current_setting('app.restaurant_id', true))
  WITH CHECK ("restaurantId" = current_setting('app.restaurant_id', true));

DROP POLICY IF EXISTS "tenant_offer_all" ON "Offer";
CREATE POLICY "tenant_offer_all" ON "Offer"
  FOR ALL
  USING ("restaurantId" = current_setting('app.restaurant_id', true))
  WITH CHECK ("restaurantId" = current_setting('app.restaurant_id', true));

DROP POLICY IF EXISTS "tenant_settings_all" ON "Settings";
CREATE POLICY "tenant_settings_all" ON "Settings"
  FOR ALL
  USING ("restaurantId" = current_setting('app.restaurant_id', true))
  WITH CHECK ("restaurantId" = current_setting('app.restaurant_id', true));

DROP POLICY IF EXISTS "tenant_user_all" ON "User";
CREATE POLICY "tenant_user_all" ON "User"
  FOR ALL
  USING ("restaurantId" = current_setting('app.restaurant_id', true))
  WITH CHECK ("restaurantId" = current_setting('app.restaurant_id', true));

DROP POLICY IF EXISTS "tenant_gallery_all" ON "Gallery";
CREATE POLICY "tenant_gallery_all" ON "Gallery"
  FOR ALL
  USING ("restaurantId" = current_setting('app.restaurant_id', true))
  WITH CHECK ("restaurantId" = current_setting('app.restaurant_id', true));

DROP POLICY IF EXISTS "tenant_media_all" ON "Media";
CREATE POLICY "tenant_media_all" ON "Media"
  FOR ALL
  USING ("restaurantId" = current_setting('app.restaurant_id', true))
  WITH CHECK ("restaurantId" = current_setting('app.restaurant_id', true));
