import type { PrismaClient } from "../src/generated/prisma/client";
import { MENU_THEMES } from "../src/lib/menu-themes";

/**
 * Ensures every built-in theme exists in MenuTheme.
 * Creates missing rows from code defaults; never overwrites admin-edited fields.
 */
export async function ensureMenuThemes(db: PrismaClient) {
  await Promise.all(
    Object.values(MENU_THEMES).map((theme, sortOrder) =>
      db.menuTheme.upsert({
        where: { slug: theme.slug },
        update: {},
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

/**
 * Dev-only: reset admin-editable theme fields to code defaults.
 */
export async function resetMenuThemesToDefaults(db: PrismaClient) {
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
