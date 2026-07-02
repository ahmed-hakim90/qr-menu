import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const FOOD_IMAGES = Array.from(
  { length: 24 },
  (_, index) => `https://picsum.photos/seed/qr-menu-product-${index}/800/600`
);

const BRAND_IMAGES = {
  logo: "https://picsum.photos/seed/qr-menu-logo/200/200",
  cover: "https://picsum.photos/seed/qr-menu-cover/1400/800",
  branch: "https://picsum.photos/seed/qr-menu-branch/1400/800",
};

const CATEGORIES = [
  { nameEn: "Coffee", nameAr: "قهوة" },
  { nameEn: "Cold Coffee", nameAr: "قهوة باردة" },
  { nameEn: "Tea", nameAr: "شاي" },
  { nameEn: "Fresh Juice", nameAr: "عصائر طازجة" },
  { nameEn: "Milkshake", nameAr: "ميلك شيك" },
  { nameEn: "Mojito", nameAr: "موهيتو" },
  { nameEn: "Soft Drinks", nameAr: "مشروبات غازية" },
  { nameEn: "Breakfast", nameAr: "فطور" },
  { nameEn: "Bakery", nameAr: "مخبوزات" },
  { nameEn: "Sandwiches", nameAr: "ساندويتشات" },
  { nameEn: "Burger", nameAr: "برجر" },
  { nameEn: "Pizza", nameAr: "بيتزا" },
  { nameEn: "Pasta", nameAr: "باستا" },
  { nameEn: "Main Course", nameAr: "أطباق رئيسية" },
  { nameEn: "Grills", nameAr: "مشويات" },
  { nameEn: "Seafood", nameAr: "مأكولات بحرية" },
  { nameEn: "Salads", nameAr: "سلطات" },
  { nameEn: "Appetizers", nameAr: "مقبلات" },
  { nameEn: "Desserts", nameAr: "حلويات" },
  { nameEn: "Kids Menu", nameAr: "قائمة الأطفال" },
  { nameEn: "Offers", nameAr: "عروض" },
];

const PRODUCT_TEMPLATES: Record<string, { en: string[]; ar: string[] }> = {
  Coffee: {
    en: ["Espresso", "Americano", "Cappuccino", "Latte", "Mocha", "Flat White", "Turkish Coffee", "V60 Pour Over"],
    ar: ["إسبريسو", "أمريكانو", "كابتشينو", "لاتيه", "موكا", "فلات وايت", "قهوة تركية", "في 60"],
  },
  "Cold Coffee": {
    en: ["Iced Latte", "Iced Americano", "Cold Brew", "Frappe", "Iced Mocha", "Affogato"],
    ar: ["آيس لاتيه", "آيس أمريكانو", "كولد برو", "فرابيه", "آيس موكا", "أفوجاتو"],
  },
  Tea: {
    en: ["Green Tea", "Black Tea", "Moroccan Tea", "Chamomile", "Mint Tea", "Earl Grey"],
    ar: ["شاي أخضر", "شاي أسود", "شاي مغربي", "بابونج", "شاي نعناع", "إيرل غراي"],
  },
  "Fresh Juice": {
    en: ["Orange Juice", "Apple Juice", "Mango Juice", "Pomegranate", "Mixed Berry", "Watermelon"],
    ar: ["عصير برتقال", "عصير تفاح", "عصير مانجو", "رمان", "توت مشكل", "بطيخ"],
  },
  Milkshake: {
    en: ["Vanilla Shake", "Chocolate Shake", "Strawberry Shake", "Oreo Shake", "Pistachio Shake"],
    ar: ["ميلك شيك فانيلا", "ميلك شيك شوكولاتة", "ميلك شيك فراولة", "ميلك شيك أوريو", "ميلك شيك فستق"],
  },
  Mojito: {
    en: ["Classic Mojito", "Strawberry Mojito", "Blue Mojito", "Passion Mojito"],
    ar: ["موهيتو كلاسيك", "موهيتو فراولة", "موهيتو أزرق", "موهيتو باشن"],
  },
  "Soft Drinks": {
    en: ["Cola", "Sprite", "Fanta", "Sparkling Water", "Iced Tea Peach"],
    ar: ["كولا", "سبرايت", "فانتا", "ماء فوار", "شاي خوخ بارد"],
  },
  Breakfast: {
    en: ["Full English", "Shakshuka", "Pancakes", "French Toast", "Omelette", "Avocado Toast"],
    ar: ["فطور إنجليزي", "شكشوكة", "بان كيك", "توست فرنسي", "أومليت", "توست أفوكادو"],
  },
  Bakery: {
    en: ["Croissant", "Danish Pastry", "Blueberry Muffin", "Cinnamon Roll", "Bagel"],
    ar: ["كرواسون", "دانش", "مافن توت", "لفائف قرفة", "بيغل"],
  },
  Sandwiches: {
    en: ["Club Sandwich", "Grilled Chicken", "Tuna Sandwich", "Falafel Wrap", "Steak Sandwich"],
    ar: ["كلوب ساندويتش", "دجاج مشوي", "تونة", "فلافل راب", "ستيك ساندويتش"],
  },
  Burger: {
    en: ["Classic Burger", "Cheese Burger", "Double Burger", "Chicken Burger", "Mushroom Burger"],
    ar: ["برجر كلاسيك", "تشيز برجر", "دبل برجر", "برجر دجاج", "برجر فطر"],
  },
  Pizza: {
    en: ["Margherita", "Pepperoni", "Four Cheese", "Vegetarian", "BBQ Chicken", "Hawaiian"],
    ar: ["مارغريتا", "بيبروني", "أربع أجبان", "نباتية", "دجاج باربيكيو", "هاواي"],
  },
  Pasta: {
    en: ["Spaghetti Bolognese", "Fettuccine Alfredo", "Penne Arrabiata", "Lasagna", "Carbonara"],
    ar: ["سباغيتي بولونيز", "فيتوتشيني ألفريدو", "بيني أرابياتا", "لازانيا", "كاربونارا"],
  },
  "Main Course": {
    en: ["Grilled Salmon", "Beef Steak", "Chicken Parmesan", "Lamb Chops", "Butter Chicken"],
    ar: ["سلمون مشوي", "ستيك لحم", "دجاج بارميزان", "ريش غنم", "دجاج بالزبدة"],
  },
  Grills: {
    en: ["Mixed Grill", "Shish Tawook", "Kebab", "Kofta", "Lamb Skewers"],
    ar: ["مشكل مشاوي", "شيش طاووق", "كباب", "كفتة", "أسياخ لحم"],
  },
  Seafood: {
    en: ["Grilled Fish", "Shrimp Platter", "Calamari", "Fish & Chips", "Lobster Tail"],
    ar: ["سمك مشوي", "طبق ربيان", "كاليماري", "سمك وبطاطس", "ذيل استاكوزا"],
  },
  Salads: {
    en: ["Caesar Salad", "Greek Salad", "Quinoa Salad", "Tuna Salad", "Garden Salad"],
    ar: ["سلطة سيزر", "سلطة يونانية", "سلطة كينوا", "سلطة تونة", "سلطة خضراء"],
  },
  Appetizers: {
    en: ["Hummus", "Falafel", "Spring Rolls", "Mozzarella Sticks", "Bruschetta"],
    ar: ["حمص", "فلافل", "سبرينغ رول", "أصابع موزاريلا", "بروشيتا"],
  },
  Desserts: {
    en: ["Chocolate Cake", "Cheesecake", "Tiramisu", "Kunafa", "Ice Cream Sundae"],
    ar: ["كيك شوكولاتة", "تشيز كيك", "تيراميسو", "كنافة", "آيس كريم"],
  },
  "Kids Menu": {
    en: ["Kids Burger", "Chicken Nuggets", "Mini Pizza", "Pasta Kids", "Fruit Plate"],
    ar: ["برجر أطفال", "ناجتس دجاج", "بيتزا صغيرة", "باستا أطفال", "طبق فواكه"],
  },
  Offers: {
    en: ["Family Meal", "Lunch Combo", "Happy Hour Coffee", "Weekend Brunch", "2+1 Pizza"],
    ar: ["وجبة عائلية", "كومبو غداء", "قهوة ساعة سعيدة", "برنش نهاية الأسبوع", "بيتزا 2+1"],
  },
};

async function main() {
  console.log("🌱 Seeding database...");

  await db.platformAdmin.upsert({
    where: { email: "admin@qrmenu.com" },
    update: {},
    create: {
      email: "admin@qrmenu.com",
      name: "Super Admin",
      passwordHash: await bcrypt.hash("superadmin123", 12),
    },
  });

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
  await db.user.deleteMany();
  await db.branch.deleteMany();
  await db.restaurant.deleteMany();

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
      sortOrder: 2,
    },
  });

  const restaurant = await db.restaurant.create({
    data: {
      nameAr: "بساطة كافيه",
      nameEn: "Basata Cafe",
      descriptionAr: "كافيه ومطعم يقدم أفضل المشروبات والأطباق في أجواء مميزة",
      descriptionEn: "A premium cafe & restaurant serving the finest drinks and dishes in a unique atmosphere",
      slug: "basata-cafe",
      subdomain: "basata-cafe",
      logo: BRAND_IMAGES.logo,
      coverImage: BRAND_IMAGES.cover,
    },
  });

  const proPlan = await db.plan.findUnique({ where: { slug: "pro" } });
  if (proPlan) {
    await db.subscription.create({
      data: {
        restaurantId: restaurant.id,
        planId: proPlan.id,
        status: "ACTIVE",
      },
    });
  }

  const branch1 = await db.branch.create({
    data: {
      restaurantId: restaurant.id,
      nameAr: "بساطة كافيه - الفرع الرئيسي",
      nameEn: "Basata Cafe - Main Branch",
      slug: "basata-cafe-main",
      addressAr: "شارع التحلية، الرياض",
      addressEn: "Tahlia Street, Riyadh",
      phone: "+966501234567",
      whatsapp: "966501234567",
      instagram: "https://instagram.com/basatacafe",
      facebook: "https://facebook.com/basatacafe",
      googleMaps: "https://maps.google.com",
      hoursAr: "السبت - الخميس: 7ص - 12م | الجمعة: 2م - 12م",
      hoursEn: "Sat - Thu: 7AM - 12AM | Fri: 2PM - 12AM",
      coverImage: BRAND_IMAGES.cover,
      logo: BRAND_IMAGES.logo,
      primaryColor: "#e94560",
      secondaryColor: "#1a1a2e",
    },
  });

  const branch2 = await db.branch.create({
    data: {
      restaurantId: restaurant.id,
      nameAr: "بساطة كافيه - فرع النخيل",
      nameEn: "Basata Cafe - Al Nakheel",
      slug: "basata-cafe-nakheel",
      addressAr: "حي النخيل، الرياض",
      addressEn: "Al Nakheel District, Riyadh",
      phone: "+966507654321",
      whatsapp: "966507654321",
      hoursAr: "يومياً: 8ص - 11م",
      hoursEn: "Daily: 8AM - 11PM",
      coverImage: BRAND_IMAGES.branch,
      primaryColor: "#e94560",
      secondaryColor: "#16213e",
      sortOrder: 1,
    },
  });

  await db.settings.create({
    data: {
      restaurantId: restaurant.id,
      currency: "EGP",
      currencySymbol: "ج.م",
      taxRate: 15,
      language: "ar",
    },
  });

  const passwordHash = await bcrypt.hash("admin123", 12);
  await db.user.createMany({
    data: [
      {
        email: "admin@basata.com",
        passwordHash,
        name: "Admin Owner",
        role: "OWNER",
        restaurantId: restaurant.id,
      },
      {
        email: "manager@basata.com",
        passwordHash,
        name: "Branch Manager",
        role: "MANAGER",
        restaurantId: restaurant.id,
      },
    ],
  });

  const sizes = await Promise.all(
    [
      { nameEn: "Small", nameAr: "صغير", priceModifier: 0 },
      { nameEn: "Medium", nameAr: "وسط", priceModifier: 3 },
      { nameEn: "Large", nameAr: "كبير", priceModifier: 6 },
    ].map((s, i) =>
      db.size.create({
        data: { ...s, restaurantId: restaurant.id, sortOrder: i },
      })
    )
  );

  const addons = await Promise.all(
    [
      { nameEn: "Extra Cheese", nameAr: "جبنة إضافية", price: 5 },
      { nameEn: "Extra Sauce", nameAr: "صوص إضافي", price: 3 },
      { nameEn: "Extra Shot", nameAr: "شوت إضافي", price: 4 },
      { nameEn: "Caramel", nameAr: "كراميل", price: 3 },
      { nameEn: "Hazelnut", nameAr: "بندق", price: 3 },
      { nameEn: "Whipped Cream", nameAr: "كريمة مخفوقة", price: 4 },
    ].map((a, i) =>
      db.addon.create({
        data: { ...a, restaurantId: restaurant.id, sortOrder: i },
      })
    )
  );

  const categories = await Promise.all(
    CATEGORIES.map((cat, i) =>
      db.category.create({
        data: {
          restaurantId: restaurant.id,
          nameEn: cat.nameEn,
          nameAr: cat.nameAr,
          sortOrder: i,
          image: FOOD_IMAGES[i % FOOD_IMAGES.length],
        },
      })
    )
  );

  let productCount = 0;
  let imageIndex = 0;

  for (const category of categories) {
    const templates = PRODUCT_TEMPLATES[category.nameEn];
    if (!templates) continue;

    for (let i = 0; i < templates.en.length; i++) {
      const basePrice = 8 + Math.floor(Math.random() * 60);
      const hasDiscount = Math.random() > 0.7;
      const isCoffee = ["Coffee", "Cold Coffee", "Tea"].includes(category.nameEn);

      const product = await db.product.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: category.id,
          nameEn: templates.en[i],
          nameAr: templates.ar[i],
          descriptionEn: `Delicious ${templates.en[i]} prepared with fresh ingredients`,
          descriptionAr: `${templates.ar[i]} لذيذ محضر بمكونات طازجة`,
          image: FOOD_IMAGES[imageIndex % FOOD_IMAGES.length],
          price: hasDiscount ? basePrice * 0.8 : basePrice,
          compareAtPrice: hasDiscount ? basePrice : undefined,
          sortOrder: i,
          isBestSeller: Math.random() > 0.85,
          isNew: Math.random() > 0.9,
          isOffer: hasDiscount,
          isSpicy: ["Grills", "Main Course", "Appetizers"].includes(category.nameEn) && Math.random() > 0.7,
          isVegetarian: ["Salads", "Bakery", "Pizza"].includes(category.nameEn) && Math.random() > 0.5,
          isVegan: category.nameEn === "Salads" && Math.random() > 0.8,
          isHot: isCoffee || ["Breakfast", "Main Course", "Grills"].includes(category.nameEn),
          isCold: ["Cold Coffee", "Fresh Juice", "Milkshake", "Mojito", "Soft Drinks", "Desserts"].includes(category.nameEn),
          calories: 100 + Math.floor(Math.random() * 500),
          ingredientsEn: "Fresh ingredients, premium quality",
          ingredientsAr: "مكونات طازجة، جودة عالية",
          allergensEn: Math.random() > 0.7 ? "Contains dairy, gluten" : "None",
          allergensAr: Math.random() > 0.7 ? "يحتوي على ألبان، غلوتين" : "لا يوجد",
          temperature: isCoffee ? "Hot" : ["Cold Coffee", "Fresh Juice"].includes(category.nameEn) ? "Cold" : undefined,
          prepTime: 5 + Math.floor(Math.random() * 25),
          spiceLevel: Math.random() > 0.7 ? 1 + Math.floor(Math.random() * 3) : undefined,
        },
      });

      await db.productBranch.createMany({
        data: [
          { productId: product.id, branchId: branch1.id },
          { productId: product.id, branchId: branch2.id },
        ],
      });

      if (isCoffee || category.nameEn === "Milkshake") {
        for (const size of sizes) {
          await db.productSize.create({
            data: {
              productId: product.id,
              sizeId: size.id,
              price: product.price + size.priceModifier,
            },
          });
        }
        for (const addon of addons.slice(0, 4)) {
          await db.productAddon.create({
            data: { productId: product.id, addonId: addon.id },
          });
        }
      }

      if (Math.random() > 0.6) {
        await db.productImage.createMany({
          data: [
            { productId: product.id, url: FOOD_IMAGES[(imageIndex + 1) % FOOD_IMAGES.length], sortOrder: 0 },
            { productId: product.id, url: FOOD_IMAGES[(imageIndex + 2) % FOOD_IMAGES.length], sortOrder: 1 },
          ],
        });
      }

      productCount++;
      imageIndex++;
    }
  }

  await db.offer.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        titleEn: "Happy Hour Coffee",
        titleAr: "ساعة سعيدة للقهوة",
        descriptionEn: "50% off all coffee drinks from 3-5 PM",
        descriptionAr: "خصم 50% على جميع مشروبات القهوة من 3-5 مساءً",
        discount: 50,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        titleEn: "Weekend Family Meal",
        titleAr: "وجبة عائلية نهاية الأسبوع",
        descriptionEn: "Special family platter for 4 people",
        descriptionAr: "طبق عائلي مميز لـ 4 أشخاص",
        discount: 25,
        isActive: true,
      },
    ],
  });

  await db.qRCode.createMany({
    data: [
      { branchId: branch1.id, color: "#e94560" },
      { branchId: branch2.id, color: "#1a1a2e" },
    ],
  });

  console.log(`✅ Seeded: 1 restaurant, 2 branches, ${categories.length} categories, ${productCount} products`);
  console.log("📧 Tenant Login: admin@basata.com / admin123");
  console.log("🛡️ Super Admin: admin@qrmenu.com / superadmin123");
  console.log("🔗 Menu: /menu/basata-cafe-main");
  console.log("🔗 Admin Panel: /admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
