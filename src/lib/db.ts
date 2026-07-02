import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const REQUIRED_DELEGATES = ["branch", "subscription", "order", "user"] as const;

function resolveDatabaseUrl() {
  // Session pooler (5432) is more reliable for Prisma's pg adapter in dev.
  const direct = process.env.DIRECT_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();
  if (process.env.NODE_ENV !== "production" && direct) return direct;
  return pooled ?? direct;
}

function createPrismaClient() {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL (or DIRECT_URL) is not configured");
  }

  const pool = new pg.Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function isUsableClient(client: PrismaClient | undefined): client is PrismaClient {
  if (!client) return false;

  const delegate = client as unknown as Record<
    string,
    { findMany?: unknown; findUnique?: unknown; findFirst?: unknown } | undefined
  >;

  return REQUIRED_DELEGATES.every((model) => {
    const modelDelegate = delegate[model];
    if (!modelDelegate) return false;
    return (
      typeof modelDelegate.findMany === "function" ||
      typeof modelDelegate.findUnique === "function" ||
      typeof modelDelegate.findFirst === "function"
    );
  });
}

function getPrismaClient() {
  if (isUsableClient(globalForPrisma.prisma)) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
