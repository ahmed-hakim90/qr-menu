import { z } from "zod";
import { DAY_KEYS, normalizeTimeValue } from "./working-hours";

const timeValue = z.preprocess(
  (value) => (typeof value === "string" ? normalizeTimeValue(value) : value),
  z.string().regex(/^\d{2}:\d{2}$/)
);

const dayHoursSchema = z.object({
  closed: z.boolean(),
  open: timeValue,
  close: timeValue,
});

const workingHoursSchema = z.object(
  Object.fromEntries(DAY_KEYS.map((day) => [day, dayHoursSchema])) as Record<
    (typeof DAY_KEYS)[number],
    typeof dayHoursSchema
  >
);

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
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  googleMaps: z.string().optional(),
  hoursAr: z.string().optional(),
  hoursEn: z.string().optional(),
  workingHours: workingHoursSchema.optional().nullable(),
  logo: imageField,
  coverImage: imageField,
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const diningTableSchema = z.object({
  branchId: z.string().min(1),
  name: z.string().min(1),
  number: z.coerce.number().int().min(1),
  seats: z.coerce.number().int().min(1).optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "WAITING_BILL", "RESERVED"]).optional(),
});

export const openSessionSchema = z.object({
  branchSlug: z.string().min(1),
  tableNumber: z.coerce.number().int().min(1),
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
  guestCount: z.coerce.number().int().min(1).optional(),
});

export const createOrderSchema = z.object({
  sessionId: z.string().min(1),
  customerNote: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
        notes: z.string().optional(),
        sizeId: z.string().optional(),
        addonIds: z.array(z.string()).optional(),
      })
    )
    .min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "PREPARING",
    "READY",
    "DELIVERED",
    "WAITING_BILL",
    "PAID",
    "CANCELLED",
  ]),
});

export const createPaymentSchema = z.object({
  sessionId: z.string().min(1),
  provider: z.enum(["CASH", "PAYMOB"]),
  amount: z.coerce.number().positive().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

export const floorSchema = z.object({
  branchId: z.string().min(1),
  name: z.string().min(1),
  width: z.coerce.number().int().min(400).optional(),
  height: z.coerce.number().int().min(300).optional(),
});

export const floorLayoutSchema = z.object({
  name: z.string().min(1).optional(),
  width: z.coerce.number().int().min(400).optional(),
  height: z.coerce.number().int().min(300).optional(),
  tables: z
    .array(
      z.object({
        tableId: z.string().min(1),
        shape: z.enum(["circle", "rectangle", "square"]),
        x: z.coerce.number(),
        y: z.coerce.number(),
        width: z.coerce.number().positive(),
        height: z.coerce.number().positive(),
        rotation: z.coerce.number(),
        color: z.string().min(1),
      })
    )
    .optional(),
});

export const reservationSchema = z.object({
  branchId: z.string().min(1).optional(),
  branchSlug: z.string().min(1).optional(),
  tableId: z.string().optional(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(5),
  partySize: z.coerce.number().int().min(1),
  startsAt: z.coerce.date(),
  notes: z.string().optional(),
});

export const reservationStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SEATED", "CANCELLED", "NO_SHOW"]),
});

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["OWNER", "MANAGER", "CAPTAIN", "CASHIER", "VIEWER"]),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["OWNER", "MANAGER", "CAPTAIN", "CASHIER", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
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
  notificationsEnabled: z.boolean().optional(),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const registerTenantSchema = z.object({
  restaurantName: z.string().min(1),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  language: z.enum(["ar", "en"]).default("ar"),
});
