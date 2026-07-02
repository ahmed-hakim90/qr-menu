-- Optional: Apply when using Supabase with anon/authenticated clients
-- Prisma direct connection (postgres role) bypasses RLS by default

CREATE POLICY "public_read_restaurant" ON "Restaurant" FOR SELECT USING (true);
CREATE POLICY "public_read_branch" ON "Branch" FOR SELECT USING (true);
CREATE POLICY "public_read_category" ON "Category" FOR SELECT USING (true);
CREATE POLICY "public_read_product" ON "Product" FOR SELECT USING (true);
CREATE POLICY "public_read_product_image" ON "ProductImage" FOR SELECT USING (true);
CREATE POLICY "public_read_product_branch" ON "ProductBranch" FOR SELECT USING (true);
CREATE POLICY "public_read_addon" ON "Addon" FOR SELECT USING (true);
CREATE POLICY "public_read_product_addon" ON "ProductAddon" FOR SELECT USING (true);
CREATE POLICY "public_read_size" ON "Size" FOR SELECT USING (true);
CREATE POLICY "public_read_product_size" ON "ProductSize" FOR SELECT USING (true);
CREATE POLICY "public_read_offer" ON "Offer" FOR SELECT USING (true);
CREATE POLICY "public_read_settings" ON "Settings" FOR SELECT USING (true);
