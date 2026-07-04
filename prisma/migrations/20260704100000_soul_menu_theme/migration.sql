-- Register Soul theme and keep premium theme prices in EGP (not piasters).
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
        'menu_theme_soul',
        'soul',
        'سول',
        'Soul',
        'تصميم داكن فاخر بخطوط ذهبية — مستوحى من منيو Soul الأصلي',
        'Premium dark theme with gold script accents — inspired by Soul''s original menu',
        true,
        25000,
        4,
        true,
        CURRENT_TIMESTAMP
    )
ON CONFLICT ("slug") DO UPDATE SET
    "nameAr" = EXCLUDED."nameAr",
    "nameEn" = EXCLUDED."nameEn",
    "descriptionAr" = EXCLUDED."descriptionAr",
    "descriptionEn" = EXCLUDED."descriptionEn",
    "isPremium" = EXCLUDED."isPremium",
    "sortOrder" = EXCLUDED."sortOrder",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;
