import { db } from "@/lib/db";
import { getAppDomain } from "@/lib/tenant-host";
import type { CardType } from "@/generated/prisma";

export async function getCardSettings() {
  let settings = await db.platformCardSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    const domain = getAppDomain();
    const scanBaseUrl =
      process.env.NEXT_PUBLIC_MENU_SCAN_URL ||
      (domain === "localhost"
        ? "http://localhost:3000"
        : `https://menu.${domain}`);

    settings = await db.platformCardSettings.create({
      data: {
        id: "default",
        scanBaseUrl,
      },
    });
  }

  return settings;
}

export async function updateCardSettings(data: {
  scanBaseUrl?: string;
  tokenLength?: number;
  rateLimitPerMinute?: number;
  defaultCardType?: CardType;
}) {
  return db.platformCardSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...data,
    },
    update: data,
  });
}
