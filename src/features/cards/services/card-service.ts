import { db } from "@/lib/db";
import type { CardStatus, CardType, Prisma } from "@/generated/prisma";
import {
  generatePrintCode,
  generateSecretKey,
  generateSecureToken,
  hashIp,
} from "./card-token";
import { generateQrForToken } from "./card-qr";
import { getCardSettings } from "./card-settings";
import { checkRateLimit } from "./rate-limiter";
import { buildMenuUrl } from "@/lib/menu-url";

const ACTIVE_SCAN_STATUSES = new Set<CardStatus>(["ASSIGNED"]);

export type ScanRequestMeta = {
  ip?: string;
  userAgent?: string;
  language?: string;
  referrer?: string;
};

function parseUserAgent(ua?: string) {
  if (!ua) return { device: null, browser: null, os: null };

  let browser: string | null = null;
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edge")) browser = "Edge";

  let os: string | null = null;
  if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";

  let device: string | null = "Desktop";
  if (/Mobile|Android|iPhone/i.test(ua)) device = "Mobile";
  else if (/iPad|Tablet/i.test(ua)) device = "Tablet";

  return { device, browser, os };
}

async function nextSerialNumber(): Promise<string> {
  const last = await db.platformCard.findFirst({
    orderBy: { createdAt: "desc" },
    select: { serialNumber: true },
  });

  const lastNum = last ? parseInt(last.serialNumber.replace(/\D/g, ""), 10) : 0;
  return `C${String(lastNum + 1).padStart(6, "0")}`;
}

async function uniqueToken(length: number): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const token = generateSecureToken(length);
    const exists = await db.platformCard.findUnique({ where: { token } });
    if (!exists) return token;
  }
  throw new Error("Failed to generate unique token");
}

export async function createPlatformCard(options: {
  cardType: CardType;
  createdById?: string;
  batchId?: string;
  nfcUid?: string;
}) {
  const settings = await getCardSettings();
  const token = await uniqueToken(settings.tokenLength);
  const secretKey = generateSecretKey();
  const printCode = generatePrintCode();
  const serialNumber = await nextSerialNumber();
  const qrImage = await generateQrForToken(settings.scanBaseUrl, token);

  const nfcWriteStatus =
    options.cardType === "QR_ONLY" ? "NOT_APPLICABLE" : "PENDING";

  return db.platformCard.create({
    data: {
      token,
      serialNumber,
      secretKey,
      printCode,
      qrImage,
      cardType: options.cardType,
      nfcUid: options.nfcUid,
      nfcWriteStatus,
      batchId: options.batchId,
      createdById: options.createdById,
      status: "AVAILABLE",
    },
  });
}

export async function bulkCreateCards(options: {
  quantity: number;
  cardType: CardType;
  batchName: string;
  createdById?: string;
}) {
  const batch = await db.cardBatch.create({
    data: {
      name: options.batchName,
      quantity: options.quantity,
      cardType: options.cardType,
      createdById: options.createdById,
    },
  });

  const cards = [];
  for (let i = 0; i < options.quantity; i++) {
    const card = await createPlatformCard({
      cardType: options.cardType,
      createdById: options.createdById,
      batchId: batch.id,
    });
    cards.push(card);
  }

  return { batch, cards };
}

export async function assignCard(options: {
  cardId: string;
  restaurantId: string;
  branchId: string;
  tableId: string;
  assignedById?: string;
}) {
  const card = await db.platformCard.findUnique({ where: { id: options.cardId } });
  if (!card) throw new Error("Card not found");
  if (card.status === "DISABLED" || card.status === "LOST" || card.status === "BROKEN") {
    throw new Error("Card cannot be assigned in its current status");
  }

  const table = await db.diningTable.findFirst({
    where: {
      id: options.tableId,
      branchId: options.branchId,
      restaurantId: options.restaurantId,
      isActive: true,
    },
  });
  if (!table) throw new Error("Table not found");

  return db.$transaction(async (tx) => {
    await tx.cardAssignment.updateMany({
      where: { cardId: options.cardId, active: true },
      data: { active: false, unassignedAt: new Date() },
    });

    const assignment = await tx.cardAssignment.create({
      data: {
        cardId: options.cardId,
        restaurantId: options.restaurantId,
        branchId: options.branchId,
        tableId: options.tableId,
        assignedById: options.assignedById,
        active: true,
      },
      include: {
        restaurant: true,
        branch: true,
        table: true,
        card: true,
      },
    });

    await tx.platformCard.update({
      where: { id: options.cardId },
      data: { status: "ASSIGNED" },
    });

    return assignment;
  });
}

export async function unassignCard(cardId: string) {
  return db.$transaction(async (tx) => {
    await tx.cardAssignment.updateMany({
      where: { cardId, active: true },
      data: { active: false, unassignedAt: new Date() },
    });

    return tx.platformCard.update({
      where: { id: cardId },
      data: { status: "AVAILABLE" },
    });
  });
}

export async function updateCardStatus(cardId: string, status: CardStatus) {
  if (status === "AVAILABLE") {
    await unassignCard(cardId);
  }
  return db.platformCard.update({
    where: { id: cardId },
    data: { status },
  });
}

export async function regenerateCardQr(cardId: string) {
  const card = await db.platformCard.findUnique({ where: { id: cardId } });
  if (!card) throw new Error("Card not found");

  const settings = await getCardSettings();
  const qrImage = await generateQrForToken(settings.scanBaseUrl, card.token);

  return db.platformCard.update({
    where: { id: cardId },
    data: { qrImage },
  });
}

export async function resolveScanToken(token: string, meta: ScanRequestMeta) {
  const start = Date.now();
  const settings = await getCardSettings();

  const rateKey = meta.ip ? hashIp(meta.ip) : "unknown";
  if (!checkRateLimit(rateKey, settings.rateLimitPerMinute)) {
    return { error: "rate_limited" as const };
  }

  const card = await db.platformCard.findUnique({
    where: { token: token.toUpperCase() },
    include: {
      assignments: {
        where: { active: true },
        include: {
          restaurant: { include: { settings: true } },
          branch: true,
          table: true,
        },
        take: 1,
      },
    },
  });

  if (!card) {
    return { error: "invalid_token" as const };
  }

  if (card.status === "DISABLED" || card.status === "LOST" || card.status === "BROKEN") {
    return { error: "card_disabled" as const };
  }

  const assignment = card.assignments[0];
  const { device, browser, os } = parseUserAgent(meta.userAgent);
  const responseTime = Date.now() - start;

  await db.$transaction([
    db.cardScanLog.create({
      data: {
        cardId: card.id,
        token: card.token,
        restaurantId: assignment?.restaurantId,
        branchId: assignment?.branchId,
        tableId: assignment?.tableId,
        device: device ?? undefined,
        browser: browser ?? undefined,
        os: os ?? undefined,
        language: meta.language,
        referrer: meta.referrer,
        ipHash: meta.ip ? hashIp(meta.ip) : undefined,
        userAgent: meta.userAgent,
        responseTime,
      },
    }),
    db.platformCard.update({
      where: { id: card.id },
      data: {
        scanCount: { increment: 1 },
        lastScanAt: new Date(),
        readCount: card.nfcUid ? { increment: 0 } : undefined,
      },
    }),
  ]);

  if (!assignment || !ACTIVE_SCAN_STATUSES.has(card.status)) {
    return { error: "not_assigned" as const, card };
  }

  const menuUrl = buildMenuUrl({
    branchSlug: assignment.branch.slug,
    customDomain: assignment.restaurant.customDomain,
    table: assignment.table.number,
  });

  return {
    menuUrl,
    assignment,
    card,
    language: assignment.restaurant.settings?.language ?? "ar",
  };
}

export const cardInclude = {
  assignments: {
    where: { active: true },
    include: {
      restaurant: { select: { id: true, nameEn: true, nameAr: true } },
      branch: { select: { id: true, nameEn: true, slug: true } },
      table: { select: { id: true, name: true, number: true } },
      assignedBy: { select: { id: true, name: true } },
    },
  },
  createdBy: { select: { id: true, name: true } },
  batch: { select: { id: true, name: true } },
} satisfies Prisma.PlatformCardInclude;

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    available,
    assigned,
    inactive,
    lost,
    disabled,
    printed,
    neverUsed,
    todayScans,
    monthScans,
    topCards,
    topRestaurants,
    latestAssignments,
  ] = await Promise.all([
    db.platformCard.count({ where: { status: "AVAILABLE" } }),
    db.platformCard.count({ where: { status: "ASSIGNED" } }),
    db.platformCard.count({ where: { status: "INACTIVE" } }),
    db.platformCard.count({ where: { status: "LOST" } }),
    db.platformCard.count({ where: { status: "DISABLED" } }),
    db.platformCard.count({ where: { qrImage: { not: null } } }),
    db.platformCard.count({ where: { scanCount: 0 } }),
    db.cardScanLog.count({ where: { scannedAt: { gte: todayStart } } }),
    db.cardScanLog.count({ where: { scannedAt: { gte: monthStart } } }),
    db.platformCard.findMany({
      orderBy: { scanCount: "desc" },
      take: 5,
      include: cardInclude,
    }),
    db.cardScanLog.groupBy({
      by: ["restaurantId"],
      where: { restaurantId: { not: null }, scannedAt: { gte: monthStart } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    db.cardAssignment.findMany({
      orderBy: { assignedAt: "desc" },
      take: 10,
      include: {
        card: { select: { token: true, serialNumber: true } },
        restaurant: { select: { nameEn: true } },
        branch: { select: { nameEn: true } },
        table: { select: { number: true, name: true } },
        assignedBy: { select: { name: true } },
      },
    }),
  ]);

  const restaurantIds = topRestaurants
    .map((r) => r.restaurantId)
    .filter((id): id is string => Boolean(id));

  const restaurants = restaurantIds.length
    ? await db.restaurant.findMany({
        where: { id: { in: restaurantIds } },
        select: { id: true, nameEn: true },
      })
    : [];

  const restaurantMap = new Map(restaurants.map((r) => [r.id, r.nameEn]));

  return {
    counts: {
      available,
      assigned,
      inactive,
      lost,
      disabled,
      printed,
      neverUsed,
    },
    scans: { today: todayScans, month: monthScans },
    topCards,
    topRestaurants: topRestaurants.map((r) => ({
      restaurantId: r.restaurantId,
      name: restaurantMap.get(r.restaurantId!) ?? "Unknown",
      scans: r._count.id,
    })),
    latestAssignments,
  };
}
