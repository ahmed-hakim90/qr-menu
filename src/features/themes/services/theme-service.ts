import { db } from "@/lib/db";
import {
  isMenuThemeSlug,
  mergeMenuThemeSettings,
  MENU_THEME_SLUGS,
  type MenuThemeSlug,
} from "@/lib/menu-themes";

type MenuThemeSettingsRow = {
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  isPremium: boolean;
  price: number;
  sortOrder: number;
  isActive: boolean;
};

function resolveThemeSettings(
  rows: MenuThemeSettingsRow[],
  includeHidden = false
) {
  const bySlug = new Map(rows.map((theme) => [theme.slug, theme]));

  return MENU_THEME_SLUGS
    .map((slug) => mergeMenuThemeSettings(slug, bySlug.get(slug)))
    .filter((theme) => includeHidden || theme.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getConfiguredMenuThemes(options?: { includeHidden?: boolean }) {
  const rows = await db.menuTheme.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
  });

  return resolveThemeSettings(rows, options?.includeHidden);
}

export async function getAdminMenuThemes() {
  const [themes, purchaseCounts] = await Promise.all([
    getConfiguredMenuThemes({ includeHidden: true }),
    db.themePurchase.groupBy({
      by: ["themeSlug"],
      _count: { themeSlug: true },
    }),
  ]);

  const countsBySlug = new Map(
    purchaseCounts.map((item) => [item.themeSlug, item._count.themeSlug])
  );

  return themes.map((theme) => ({
    ...theme,
    purchaseCount: countsBySlug.get(theme.slug) ?? 0,
  }));
}

export async function getRestaurantThemeState(restaurantId: string) {
  const [settings, purchases, menuThemes] = await Promise.all([
    db.settings.findUnique({ where: { restaurantId } }),
    db.themePurchase.findMany({ where: { restaurantId } }),
    getConfiguredMenuThemes(),
  ]);

  const activeMenuTheme = settings?.menuTheme ?? "classic";
  const ownedThemes = purchases
    .filter((p) => p.status === "ACTIVE")
    .map((p) => p.themeSlug);

  const themes = menuThemes.map((theme) => {
    const purchase = purchases.find((p) => p.themeSlug === theme.slug);
    const isOwned = !theme.isPremium || ownedThemes.includes(theme.slug);
    const isActive = activeMenuTheme === theme.slug;

    return {
      ...theme,
      isOwned,
      isActive,
      purchaseStatus: purchase?.status ?? null,
    };
  });

  return {
    activeMenuTheme,
    themes,
    purchases,
  };
}

export async function selectMenuTheme(restaurantId: string, themeSlug: string) {
  if (!isMenuThemeSlug(themeSlug)) {
    throw new Error("Theme not found");
  }

  const theme = (await getConfiguredMenuThemes()).find((item) => item.slug === themeSlug);
  if (!theme) {
    throw new Error("Theme not available");
  }

  if (theme.isPremium) {
    const purchase = await db.themePurchase.findUnique({
      where: { restaurantId_themeSlug: { restaurantId, themeSlug } },
    });

    if (!purchase || purchase.status !== "ACTIVE") {
      throw new Error("Premium theme not purchased");
    }
  }

  return db.settings.upsert({
    where: { restaurantId },
    create: { restaurantId, menuTheme: themeSlug },
    update: { menuTheme: themeSlug },
  });
}

export async function submitThemePurchaseRequest(input: {
  restaurantId: string;
  themeSlug: string;
  paymentReference?: string;
  paymentNotes?: string;
}) {
  if (!isMenuThemeSlug(input.themeSlug)) {
    throw new Error("Theme not found");
  }

  const theme = (await getConfiguredMenuThemes()).find(
    (item) => item.slug === input.themeSlug
  );
  if (!theme) {
    throw new Error("Theme not available");
  }

  if (!theme.isPremium) {
    throw new Error("This theme is free");
  }

  const paymentReference = input.paymentReference?.trim() || null;
  const paymentNotes = input.paymentNotes?.trim() || null;

  if (!paymentReference) {
    throw new Error("Payment reference is required");
  }

  return db.themePurchase.upsert({
    where: {
      restaurantId_themeSlug: {
        restaurantId: input.restaurantId,
        themeSlug: input.themeSlug,
      },
    },
    create: {
      restaurantId: input.restaurantId,
      themeSlug: input.themeSlug,
      pricePaid: theme.price,
      status: "PENDING",
      paymentReference,
      paymentNotes,
    },
    update: {
      pricePaid: theme.price,
      status: "PENDING",
      paymentReference,
      paymentNotes,
    },
  });
}

export async function countPendingThemePurchases() {
  return db.themePurchase.count({ where: { status: "PENDING" } });
}

export async function resolveMenuThemeForDisplay(
  menuTheme: string | null | undefined,
  purchases: { themeSlug: string; status: string }[]
): Promise<MenuThemeSlug> {
  const requestedSlug = menuTheme && isMenuThemeSlug(menuTheme) ? menuTheme : "classic";
  const availableThemes = await getConfiguredMenuThemes();
  const theme = availableThemes.find((item) => item.slug === requestedSlug);

  if (!theme) {
    return "classic";
  }

  if (!theme.isPremium) {
    return theme.slug;
  }

  const owned = purchases.some(
    (p) => p.themeSlug === theme.slug && p.status === "ACTIVE"
  );

  return owned ? theme.slug : "classic";
}
