import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsManager } from "@/components/dashboard/settings-manager";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  let settings = await db.settings.findUnique({
    where: { restaurantId: session.restaurantId },
  });

  if (!settings) {
    settings = await db.settings.create({
      data: { restaurantId: session.restaurantId },
    });
  }

  return <SettingsManager settings={settings} />;
}
