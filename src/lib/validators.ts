import { z } from "zod";

export const categorySchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  image: z.string().url().optional().or(z.literal("")),
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

export const productSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
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
});
