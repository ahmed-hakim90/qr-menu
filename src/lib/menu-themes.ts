export type MenuThemeLayout = "grid" | "list";

export type MenuThemeSlug = "classic" | "minimal" | "antika" | "bistro";

export interface MenuThemeDefinition {
  slug: MenuThemeSlug;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  isPremium: boolean;
  price: number;
  layout: MenuThemeLayout;
  cssClass: string | null;
  previewColors: {
    background: string;
    primary: string;
    accent: string;
  };
}

export type MenuThemeAdminSettings = Pick<
  MenuThemeDefinition,
  "slug" | "nameAr" | "nameEn" | "descriptionAr" | "descriptionEn" | "isPremium" | "price"
> & {
  sortOrder: number;
  isActive: boolean;
};

export const MENU_THEMES: Record<MenuThemeSlug, MenuThemeDefinition> = {
  classic: {
    slug: "classic",
    nameAr: "كلاسيك",
    nameEn: "Classic",
    descriptionAr: "بطاقات منتجات بعمودين مع صور — التصميم الافتراضي",
    descriptionEn: "Two-column product cards with images — the default look",
    isPremium: false,
    price: 0,
    layout: "grid",
    cssClass: null,
    previewColors: { background: "#fafafa", primary: "#e94560", accent: "#1a1a2e" },
  },
  minimal: {
    slug: "minimal",
    nameAr: "بسيط",
    nameEn: "Minimal",
    descriptionAr: "قائمة نظيفة بعمود واحد بدون صور — سريع وخفيف",
    descriptionEn: "Clean single-column list without images — fast and light",
    isPremium: false,
    price: 0,
    layout: "list",
    cssClass: "minimal-menu",
    previewColors: { background: "#ffffff", primary: "#18181b", accent: "#71717a" },
  },
  antika: {
    slug: "antika",
    nameAr: "أنتيكا",
    nameEn: "Antika",
    descriptionAr: "تصميم لبناني فاخر بألوان دافئة وخطوط كلاسيكية",
    descriptionEn: "Premium Lebanese style with warm tones and classic typography",
    isPremium: true,
    price: 199,
    layout: "list",
    cssClass: "antika-menu",
    previewColors: { background: "#f5eee3", primary: "#b67b31", accent: "#2a160f" },
  },
  bistro: {
    slug: "bistro",
    nameAr: "بيسترو",
    nameEn: "Bistro",
    descriptionAr: "مظهر داكن أنيق بذهبي — مثالي للمطاعم الراقية",
    descriptionEn: "Elegant dark theme with gold accents — ideal for upscale venues",
    isPremium: true,
    price: 149,
    layout: "grid",
    cssClass: "bistro-menu",
    previewColors: { background: "#141210", primary: "#c9a84c", accent: "#f5f0e8" },
  },
};

export const MENU_THEME_SLUGS = Object.keys(MENU_THEMES) as MenuThemeSlug[];

export function getMenuTheme(slug: string | null | undefined): MenuThemeDefinition {
  if (slug && slug in MENU_THEMES) {
    return MENU_THEMES[slug as MenuThemeSlug];
  }
  return MENU_THEMES.classic;
}

export function isMenuThemeSlug(value: string): value is MenuThemeSlug {
  return value in MENU_THEMES;
}

export function mergeMenuThemeSettings(
  slug: MenuThemeSlug,
  settings?: Partial<Omit<MenuThemeAdminSettings, "slug">> | null
): MenuThemeDefinition & { sortOrder: number; isActive: boolean } {
  const base = MENU_THEMES[slug];
  return {
    ...base,
    nameAr: settings?.nameAr ?? base.nameAr,
    nameEn: settings?.nameEn ?? base.nameEn,
    descriptionAr: settings?.descriptionAr ?? base.descriptionAr,
    descriptionEn: settings?.descriptionEn ?? base.descriptionEn,
    isPremium: settings?.isPremium ?? base.isPremium,
    price: settings?.price ?? base.price,
    sortOrder: settings?.sortOrder ?? MENU_THEME_SLUGS.indexOf(slug),
    isActive: settings?.isActive ?? true,
  };
}
