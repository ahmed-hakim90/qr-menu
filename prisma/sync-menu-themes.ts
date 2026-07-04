import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { ensureMenuThemes, resetMenuThemesToDefaults } from "./ensure-menu-themes";
import { formatCurrencyAmount } from "../src/lib/currency";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL is required");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const reset = process.argv.includes("--reset");

async function main() {
  if (reset) {
    await resetMenuThemesToDefaults(db);
    console.log("✅ Reset menu themes to code defaults");
  } else {
    await ensureMenuThemes(db);
    console.log("✅ Ensured missing menu themes exist (existing prices unchanged)");
  }

  const themes = await db.menuTheme.findMany({ orderBy: { sortOrder: "asc" } });
  for (const theme of themes) {
    console.log(`  - ${theme.slug}: ${theme.isPremium ? formatCurrencyAmount(theme.price) : "free"}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
