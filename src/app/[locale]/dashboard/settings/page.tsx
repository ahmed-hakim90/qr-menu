import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const settings = await db.settings.findUnique({
    where: { restaurantId: session.restaurantId },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      {settings && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-medium">{settings.currency} ({settings.currencySymbol})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax Rate</span>
              <span className="font-medium">{settings.taxRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Default Language</span>
              <Badge>{settings.language}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Theme</span>
              <Badge variant="secondary">{settings.theme}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
