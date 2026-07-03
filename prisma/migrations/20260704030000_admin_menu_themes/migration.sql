-- CreateTable
CREATE TABLE "MenuTheme" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuTheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuTheme_slug_key" ON "MenuTheme"("slug");

-- Seed existing built-in themes as admin-manageable records.
INSERT INTO "MenuTheme" (
    "id",
    "slug",
    "nameAr",
    "nameEn",
    "descriptionAr",
    "descriptionEn",
    "isPremium",
    "price",
    "sortOrder",
    "isActive",
    "updatedAt"
)
VALUES
    (
        'menu_theme_classic',
        'classic',
        'كلاسيك',
        'Classic',
        'بطاقات منتجات بعمودين مع صور — التصميم الافتراضي',
        'Two-column product cards with images — the default look',
        false,
        0,
        0,
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'menu_theme_minimal',
        'minimal',
        'بسيط',
        'Minimal',
        'قائمة نظيفة بعمود واحد بدون صور — سريع وخفيف',
        'Clean single-column list without images — fast and light',
        false,
        0,
        1,
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'menu_theme_antika',
        'antika',
        'أنتيكا',
        'Antika',
        'تصميم لبناني فاخر بألوان دافئة وخطوط كلاسيكية',
        'Premium Lebanese style with warm tones and classic typography',
        true,
        199,
        2,
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'menu_theme_bistro',
        'bistro',
        'بيسترو',
        'Bistro',
        'مظهر داكن أنيق بذهبي — مثالي للمطاعم الراقية',
        'Elegant dark theme with gold accents — ideal for upscale venues',
        true,
        149,
        3,
        true,
        CURRENT_TIMESTAMP
    )
ON CONFLICT ("slug") DO UPDATE SET
    "nameAr" = EXCLUDED."nameAr",
    "nameEn" = EXCLUDED."nameEn",
    "descriptionAr" = EXCLUDED."descriptionAr",
    "descriptionEn" = EXCLUDED."descriptionEn",
    "isPremium" = EXCLUDED."isPremium",
    "price" = EXCLUDED."price",
    "sortOrder" = EXCLUDED."sortOrder",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;
