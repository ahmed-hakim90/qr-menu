import { z } from "zod";

// Accepts a full URL (https://...) or a local upload path (/uploads/...)
const imageField = z
  .union([z.string().url(), z.string().regex(/^\/[\w\-./]+$/), z.literal("")])
  .optional();

export const categorySchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  image: imageField,
  sortOrder: z.coerce.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const addonSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  price: z.coerce.number().min(0),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const sizeSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  priceModifier: z.coerce.number().min(0),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const branchSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  addressAr: z.string().optional(),
  addressEn: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  googleMaps: z.string().optional(),
  hoursAr: z.string().optional(),
  hoursEn: z.string().optional(),
  logo: imageField,
  coverImage: imageField,
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const productSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  image: imageField,
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  categoryId: z.string().min(1),
  tax: z.coerce.number().min(0).optional(),
  sortOrder: z.coerce.number().int().optional(),
  isAvailable: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isOffer: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isHot: z.boolean().optional(),
  isCold: z.boolean().optional(),
  calories: z.coerce.number().int().optional().nullable(),
  prepTime: z.coerce.number().int().optional().nullable(),
  spiceLevel: z.coerce.number().int().min(1).max(5).optional().nullable(),
  branchIds: z.array(z.string()).optional(),
});

export const branchCreateSchema = branchSchema;

export const domainSchema = z.object({
  subdomain: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase letters, numbers, and hyphens"),
  customDomain: z
    .union([
      z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i),
      z.literal(""),
    ])
    .optional(),
});

export const billingSubscribeSchema = z.object({
  planSlug: z.string().min(1),
  paymentReference: z.string().optional(),
  paymentNotes: z.string().optional(),
});

export const settingsSchema = z.object({
  taxRate: z.coerce.number().min(0).max(100),
  language: z.enum(["ar", "en"]),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

export const registerTenantSchema = z.object({
  restaurantName: z.string().min(1),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  language: z.enum(["ar", "en"]).default("ar"),
});
