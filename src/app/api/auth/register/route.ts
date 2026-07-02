import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { registerTenantSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  { nameEn: "Coffee", nameAr: "قهوة" },
  { nameEn: "Cold Coffee", nameAr: "قهوة باردة" },
  { nameEn: "Tea", nameAr: "شاي" },
  { nameEn: "Fresh Juice", nameAr: "عصائر طازجة" },
  { nameEn: "Breakfast", nameAr: "فطور" },
  { nameEn: "Bakery", nameAr: "مخبوزات" },
  { nameEn: "Sandwiches", nameAr: "ساندويتشات" },
  { nameEn: "Desserts", nameAr: "حلويات" },
  { nameEn: "Offers", nameAr: "عروض" },
];

async function uniqueRestaurantSlug(base: string) {
  const root = slugify(base) || "restaurant";
  let slug = root;
  let index = 2;

  while (await db.restaurant.findUnique({ where: { slug } })) {
    slug = `${root}-${index}`;
    index += 1;
  }

  return slug;
}

async function uniqueBranchSlug(base: string) {
  const root = slugify(base) || "branch";
  let slug = root;
  let index = 2;

  while (await db.branch.findUnique({ where: { slug } })) {
    slug = `${root}-${index}`;
    index += 1;
  }

  return slug;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerTenantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const existingUser = await db.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const restaurantSlug = await uniqueRestaurantSlug(data.restaurantNameEn);
  const branchSlug = await uniqueBranchSlug(`${restaurantSlug}-main`);
  const passwordHash = await hashPassword(data.password);

  const sessionUser = await db.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        nameAr: data.restaurantNameAr,
        nameEn: data.restaurantNameEn,
        slug: restaurantSlug,
      },
    });

    await tx.settings.create({
      data: {
        restaurantId: restaurant.id,
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        language: data.language,
      },
    });

    await tx.branch.create({
      data: {
        restaurantId: restaurant.id,
        nameAr: data.branchNameAr,
        nameEn: data.branchNameEn,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        slug: branchSlug,
      },
    });

    await tx.category.createMany({
      data: DEFAULT_CATEGORIES.map((category, index) => ({
        restaurantId: restaurant.id,
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        sortOrder: index,
      })),
    });

    const user = await tx.user.create({
      data: {
        restaurantId: restaurant.id,
        name: data.ownerName,
        email: data.email,
        passwordHash,
        role: "OWNER",
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId,
    };
  });

  await createSession(sessionUser);

  return NextResponse.json({ success: true, branchSlug }, { status: 201 });
}
