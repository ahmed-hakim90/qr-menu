import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";
import { isMenuThemeSlug, mergeMenuThemeSettings } from "@/lib/menu-themes";

const menuThemeUpdateSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  descriptionAr: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  isPremium: z.boolean().optional(),
  price: z.coerce.number().min(0).optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const { slug } = await params;
  if (!isMenuThemeSlug(slug)) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = menuThemeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const base = mergeMenuThemeSettings(slug);
  const data = {
    ...parsed.data,
    ...(slug === "classic" ? { isActive: true, isPremium: false, price: 0 } : {}),
  };

  const theme = await db.menuTheme.upsert({
    where: { slug },
    create: {
      slug,
      nameAr: data.nameAr ?? base.nameAr,
      nameEn: data.nameEn ?? base.nameEn,
      descriptionAr: data.descriptionAr ?? base.descriptionAr,
      descriptionEn: data.descriptionEn ?? base.descriptionEn,
      isPremium: data.isPremium ?? base.isPremium,
      price: data.price ?? base.price,
      sortOrder: data.sortOrder ?? base.sortOrder,
      isActive: data.isActive ?? base.isActive,
    },
    update: data,
  });

  return NextResponse.json(theme);
}
