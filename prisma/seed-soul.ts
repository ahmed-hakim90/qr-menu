import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import { SOUL_BRAND, SOUL_CATEGORIES, SOUL_DRINK_CATEGORIES } from "./soul-data";
import { MENU_THEMES } from "../src/lib/menu-themes";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL is required for seeding");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function seedMenuThemes() {
  await Promise.all(
    Object.values(MENU_THEMES).map((theme, sortOrder) =>
      db.menuTheme.upsert({
        where: { slug: theme.slug },
        update: {
          nameAr: theme.nameAr,
          nameEn: theme.nameEn,
          descriptionAr: theme.descriptionAr,
          descriptionEn: theme.descriptionEn,
          isPremium: theme.isPremium,
          price: theme.price,
          sortOrder,
          isActive: true,
        },
        create: {
          id: `menu_theme_${theme.slug}`,
          slug: theme.slug,
          nameAr: theme.nameAr,
          nameEn: theme.nameEn,
          descriptionAr: theme.descriptionAr,
          descriptionEn: theme.descriptionEn,
          isPremium: theme.isPremium,
          price: theme.price,
          sortOrder,
          isActive: true,
        },
      })
    )
  );
}

async function clearSoulTenant(slug: string) {
  const restaurant = await db.restaurant.findUnique({ where: { slug } });
  if (!restaurant) return;

  const restaurantId = restaurant.id;
  const productIds = (
    await db.product.findMany({ where: { restaurantId }, select: { id: true } })
  ).map((p) => p.id);

  if (productIds.length) {
    await db.productAddon.deleteMany({ where: { productId: { in: productIds } } });
    await db.productSize.deleteMany({ where: { productId: { in: productIds } } });
    await db.productImage.deleteMany({ where: { productId: { in: productIds } } });
    await db.productBranch.deleteMany({ where: { productId: { in: productIds } } });
  }

  await db.product.deleteMany({ where: { restaurantId } });
  await db.category.deleteMany({ where: { restaurantId } });
  await db.addon.deleteMany({ where: { restaurantId } });
  await db.size.deleteMany({ where: { restaurantId } });
  await db.offer.deleteMany({ where: { restaurantId } });
  await db.themePurchase.deleteMany({ where: { restaurantId } });
  await db.user.deleteMany({ where: { restaurantId } });

  const branches = await db.branch.findMany({ where: { restaurantId }, select: { id: true } });
  for (const branch of branches) {
    await db.qRCode.deleteMany({ where: { branchId: branch.id } });
  }

  await db.branch.deleteMany({ where: { restaurantId } });
  await db.settings.deleteMany({ where: { restaurantId } });
  await db.subscription.deleteMany({ where: { restaurantId } });
  await db.restaurant.delete({ where: { id: restaurantId } });
}

async function main() {
  console.log("🌱 Seeding Soul Restaurant & Cafe...");

  await seedMenuThemes();
  await clearSoulTenant(SOUL_BRAND.slug);

  const restaurant = await db.restaurant.create({
    data: {
      nameAr: "سول",
      nameEn: "Soul Restaurant & Cafe",
      descriptionAr: "مطعم وكافيه فاخر يقدم تجربة طهي عالمية في Cloud 5 Mall",
      descriptionEn: "A premium restaurant and cafe serving international flavors at Cloud 5 Mall.",
      slug: SOUL_BRAND.slug,
      subdomain: SOUL_BRAND.slug,
      logo: SOUL_BRAND.logo,
      coverImage: SOUL_BRAND.cover,
    },
  });

  const businessPlan = await db.plan.findUnique({ where: { slug: "business" } });
  if (businessPlan) {
    await db.subscription.create({
      data: {
        restaurantId: restaurant.id,
        planId: businessPlan.id,
        status: "ACTIVE",
      },
    });
  }

  const branch = await db.branch.create({
    data: {
      restaurantId: restaurant.id,
      nameAr: "سول - Cloud 5 Mall",
      nameEn: "Soul - Cloud 5 Mall",
      slug: SOUL_BRAND.branchSlug,
      addressAr: SOUL_BRAND.addressAr,
      addressEn: SOUL_BRAND.addressEn,
      phone: SOUL_BRAND.phone,
      whatsapp: SOUL_BRAND.whatsapp,
      reservationPhone: SOUL_BRAND.reservationPhone,
      instagram: SOUL_BRAND.instagram,
      facebook: SOUL_BRAND.facebook,
      hoursAr: "يومياً: 10 صباحاً - 12 منتصف الليل",
      hoursEn: "Daily: 10 AM - 12 AM",
      coverImage: SOUL_BRAND.cover,
      logo: SOUL_BRAND.logo,
      primaryColor: "#d4af37",
      secondaryColor: "#f5f0e8",
    },
  });

  await db.settings.create({
    data: {
      restaurantId: restaurant.id,
      currency: "EGP",
      currencySymbol: "ج.م",
      taxRate: 14,
      language: "ar",
      theme: "dark",
      menuTheme: "soul",
      fontFamily: "Georgia",
      borderRadius: "0.5rem",
    },
  });

  await db.themePurchase.create({
    data: {
      restaurantId: restaurant.id,
      themeSlug: "soul",
      status: "ACTIVE",
      pricePaid: 199,
      paymentReference: "seed-soul",
    },
  });

  const passwordHash = await bcrypt.hash("soul123", 12);
  await db.user.createMany({
    data: [
      {
        email: "owner@soul.local",
        passwordHash,
        name: "Soul Owner",
        role: "OWNER",
        restaurantId: restaurant.id,
      },
      {
        email: "manager@soul.local",
        passwordHash,
        name: "Soul Manager",
        role: "MANAGER",
        restaurantId: restaurant.id,
      },
    ],
  });

  const sizes = await Promise.all(
    [
      { nameEn: "Regular", nameAr: "عادي", priceModifier: 0 },
      { nameEn: "Large", nameAr: "كبير", priceModifier: 15 },
    ].map((size, sortOrder) =>
      db.size.create({
        data: { ...size, restaurantId: restaurant.id, sortOrder },
      })
    )
  );

  const categories = await Promise.all(
    SOUL_CATEGORIES.map((category, sortOrder) =>
      db.category.create({
        data: {
          restaurantId: restaurant.id,
          nameEn: category.en,
          nameAr: category.ar,
          image: category.image,
          sortOrder,
        },
      })
    )
  );

  let productCount = 0;

  for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
    const category = categories[categoryIndex];
    const sourceCategory = SOUL_CATEGORIES[categoryIndex];

    for (let sortOrder = 0; sortOrder < sourceCategory.items.length; sortOrder++) {
      const item = sourceCategory.items[sortOrder];
      const product = await db.product.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: category.id,
          nameEn: item.en,
          nameAr: item.ar,
          descriptionEn: `${sourceCategory.en} from Soul's original menu.`,
          descriptionAr: `${sourceCategory.ar} من منيو Soul الأصلي.`,
          image: item.image || sourceCategory.image,
          price: item.price,
          sortOrder,
          isBestSeller: Boolean(item.best),
          isSpicy: Boolean(item.spicy),
          isVegetarian: Boolean(item.vegetarian),
          isHot: Boolean(item.hot),
          isCold: Boolean(item.cold),
          temperature: item.hot ? "Hot" : item.cold ? "Cold" : undefined,
        },
      });

      await db.productBranch.create({
        data: { productId: product.id, branchId: branch.id },
      });

      if (product.image) {
        await db.productImage.create({
          data: { productId: product.id, url: product.image, sortOrder: 0 },
        });
      }

      if (SOUL_DRINK_CATEGORIES.includes(sourceCategory.en as (typeof SOUL_DRINK_CATEGORIES)[number])) {
        for (const size of sizes) {
          await db.productSize.create({
            data: {
              productId: product.id,
              sizeId: size.id,
              price: product.price + size.priceModifier,
            },
          });
        }
      }

      productCount++;
    }
  }

  await db.offer.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        titleEn: "Brunch & Soul",
        titleAr: "برunch & Soul",
        descriptionEn: "Start your day with Soul's signature brunch — shakshuka, loaves, and healthy bowls.",
        descriptionAr: "ابدأ يومك مع برunch سول — شكشوكة، لفات، وبوولز صحية.",
        discount: 0,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        titleEn: "Prices Note",
        titleAr: "تنويه الأسعار",
        descriptionEn: "Prices are subject to 14% VAT.",
        descriptionAr: "تضاف على الأسعار 14% ضريبة القيمة المضافة.",
        discount: 0,
        isActive: true,
      },
    ],
  });

  await db.qRCode.create({
    data: { branchId: branch.id, color: "#d4af37", logoUrl: SOUL_BRAND.logo },
  });

  console.log(`✅ Seeded: Soul Restaurant, 1 branch, ${categories.length} categories, ${productCount} products`);
  console.log("📧 Tenant Login: owner@soul.local / soul123");
  console.log("👤 Manager Login: manager@soul.local / soul123");
  console.log(`🔗 Menu: /menu/${SOUL_BRAND.branchSlug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
