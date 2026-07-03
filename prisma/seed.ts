import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import { ANTIKA_BRAND, ANTIKA_CATEGORIES } from "./antika-data";
import { MENU_THEMES } from "../src/lib/menu-themes";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL is required for seeding");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function seedPlans() {
  await db.plan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      id: "plan_free",
      slug: "free",
      nameAr: "مجاني",
      nameEn: "Free",
      priceMonthly: 0,
      maxBranches: 1,
      maxProducts: 30,
      maxUsers: 2,
      customDomain: false,
      hasTables: false,
      hasOrdering: false,
      sortOrder: 0,
    },
  });

  await db.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      id: "plan_pro",
      slug: "pro",
      nameAr: "احترافي",
      nameEn: "Pro",
      priceMonthly: 99,
      maxBranches: 3,
      maxProducts: 150,
      maxUsers: 5,
      customDomain: false,
      hasTables: true,
      hasOrdering: true,
      sortOrder: 1,
    },
  });

  await db.plan.upsert({
    where: { slug: "business" },
    update: {},
    create: {
      id: "plan_business",
      slug: "business",
      nameAr: "أعمال",
      nameEn: "Business",
      priceMonthly: 249,
      maxBranches: 10,
      maxProducts: 500,
      maxUsers: 15,
      customDomain: true,
      hasTables: true,
      hasOrdering: true,
      sortOrder: 2,
    },
  });
}

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

async function clearTenantData() {
  await db.productAddon.deleteMany();
  await db.productSize.deleteMany();
  await db.productImage.deleteMany();
  await db.productBranch.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.addon.deleteMany();
  await db.size.deleteMany();
  await db.offer.deleteMany();
  await db.qRCode.deleteMany();
  await db.gallery.deleteMany();
  await db.media.deleteMany();
  await db.subscription.deleteMany();
  await db.themePurchase.deleteMany();
  await db.user.deleteMany();
  await db.branch.deleteMany();
  await db.restaurant.deleteMany();
}

async function main() {
  console.log("🌱 Seeding Antika Beirut...");

  await db.platformAdmin.upsert({
    where: { email: "admin@qrmenu.com" },
    update: {},
    create: {
      email: "admin@qrmenu.com",
      name: "Super Admin",
      passwordHash: await bcrypt.hash("superadmin123", 12),
    },
  });

  await clearTenantData();
  await seedPlans();
  await seedMenuThemes();

  const restaurant = await db.restaurant.create({
    data: {
      nameAr: "أنتيكا بيروت",
      nameEn: "Antika Beirut",
      descriptionAr: "مطعم وكافيه لبناني بطابع كلاسيكي دافئ من وحي منيو أنتيكا الأصلي",
      descriptionEn: "A warm Lebanese restaurant and cafe experience inspired by Antika's original classic menu.",
      slug: ANTIKA_BRAND.slug,
      subdomain: ANTIKA_BRAND.slug,
      logo: ANTIKA_BRAND.logo,
      coverImage: ANTIKA_BRAND.cover,
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
      nameAr: "أنتيكا بيروت - Mar.V Mall",
      nameEn: "Antika Beirut - Mar.V Mall",
      slug: ANTIKA_BRAND.branchSlug,
      addressAr: ANTIKA_BRAND.addressAr,
      addressEn: ANTIKA_BRAND.addressEn,
      phone: ANTIKA_BRAND.phone,
      whatsapp: ANTIKA_BRAND.whatsapp,
      reservationPhone: ANTIKA_BRAND.reservationPhone,
      instagram: ANTIKA_BRAND.instagram,
      facebook: ANTIKA_BRAND.facebook,
      hoursAr: "يومياً: 10 صباحاً - 1 صباحاً",
      hoursEn: "Daily: 10 AM - 1 AM",
      coverImage: ANTIKA_BRAND.cover,
      logo: ANTIKA_BRAND.logo,
      primaryColor: "#b67b31",
      secondaryColor: "#2a160f",
    },
  });

  await db.settings.create({
    data: {
      restaurantId: restaurant.id,
      currency: "EGP",
      currencySymbol: "ج.م",
      taxRate: 14,
      language: "ar",
      theme: "light",
      menuTheme: "antika",
      fontFamily: "Georgia",
      borderRadius: "0.5rem",
    },
  });

  await db.themePurchase.create({
    data: {
      restaurantId: restaurant.id,
      themeSlug: "antika",
      status: "ACTIVE",
      pricePaid: 199,
      paymentReference: "seed-antika",
    },
  });

  const passwordHash = await bcrypt.hash("antika123", 12);
  await db.user.createMany({
    data: [
      {
        email: "owner@antika.local",
        passwordHash,
        name: "Antika Owner",
        role: "OWNER",
        restaurantId: restaurant.id,
      },
      {
        email: "manager@antika.local",
        passwordHash,
        name: "Antika Manager",
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

  const addons = await Promise.all(
    [
      { nameEn: "Extra Cheese", nameAr: "جبنة إضافية", price: 51 },
      { nameEn: "Garlic", nameAr: "تومية", price: 46 },
      { nameEn: "Tahina", nameAr: "طحينة", price: 63 },
      { nameEn: "Add Flavor", nameAr: "إضافة نكهة", price: 56 },
    ].map((addon, sortOrder) =>
      db.addon.create({
        data: { ...addon, restaurantId: restaurant.id, sortOrder },
      })
    )
  );

  const categories = await Promise.all(
    ANTIKA_CATEGORIES.map((category, sortOrder) =>
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
    const sourceCategory = ANTIKA_CATEGORIES[categoryIndex];

    for (let sortOrder = 0; sortOrder < sourceCategory.items.length; sortOrder++) {
      const item = sourceCategory.items[sortOrder];
      const product = await db.product.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: category.id,
          nameEn: item.en,
          nameAr: item.ar,
          descriptionEn: `${sourceCategory.en} from Antika Beirut's original menu. Prices are subject to 12% service and 14% VAT.`,
          descriptionAr: `${sourceCategory.ar} من منيو أنتيكا بيروت الأصلي. الأسعار يضاف عليها 12% خدمة و14% ضريبة قيمة مضافة.`,
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

      if (["Hot Drinks", "Fresh Juice", "Milkshake", "Mojito & Ice Tea", "Frappe"].includes(sourceCategory.en)) {
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

      if (["Hot Mazza", "Sandwiches", "Pizza", "Manakish"].includes(sourceCategory.en)) {
        for (const addon of addons.slice(0, 3)) {
          await db.productAddon.create({
            data: { productId: product.id, addonId: addon.id },
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
        titleEn: "Classic Lebanese Table",
        titleAr: "الطاولة اللبنانية الكلاسيكية",
        descriptionEn: "A curated Antika experience across cold mazza, hot mazza, grills, and drinks.",
        descriptionAr: "تجربة أنتيكا مختارة من المازة الباردة والساخنة والمشاوي والمشروبات.",
        discount: 0,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        titleEn: "Prices Note",
        titleAr: "تنويه الأسعار",
        descriptionEn: "Prices are subject to 12% service charge and 14% VAT.",
        descriptionAr: "تضاف على الأسعار 12% خدمة و14% ضريبة القيمة المضافة.",
        discount: 0,
        isActive: true,
      },
    ],
  });

  await db.qRCode.create({
    data: { branchId: branch.id, color: "#b67b31", logoUrl: ANTIKA_BRAND.logo },
  });

  console.log(`✅ Seeded: Antika Beirut, 1 branch, ${categories.length} categories, ${productCount} products`);
  console.log("📧 Tenant Login: owner@antika.local / antika123");
  console.log("👤 Manager Login: manager@antika.local / antika123");
  console.log("🛡️ Super Admin: admin@qrmenu.com / superadmin123");
  console.log(`🔗 Menu: /menu/${ANTIKA_BRAND.branchSlug}`);
  console.log("🔗 Admin Panel: /admin");
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
