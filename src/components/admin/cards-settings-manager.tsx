"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CARD_TYPE_LABELS } from "@/features/cards/card-labels";
import type { CardType } from "@/generated/prisma";

type Settings = {
  scanBaseUrl: string;
  tokenLength: number;
  rateLimitPerMinute: number;
  defaultCardType: CardType;
};

export function CardsSettingsManager() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cards/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cards/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return <p className="text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QR & NFC Settings</h1>
        <p className="text-sm text-muted-foreground">Scan URL base, token length, and rate limits</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6 max-w-lg">
          <div className="space-y-2">
            <Label>Scan Base URL</Label>
            <Input
              value={settings.scanBaseUrl}
              onChange={(e) => setSettings({ ...settings, scanBaseUrl: e.target.value })}
              placeholder="https://menu.yourdomain.com"
            />
            <p className="text-xs text-muted-foreground">
              QR codes encode: {settings.scanBaseUrl.replace(/\/$/, "")}/s/&#123;TOKEN&#125;
            </p>
          </div>

          <div className="space-y-2">
            <Label>Token Length</Label>
            <Input
              type="number"
              min={6}
              max={16}
              value={settings.tokenLength}
              onChange={(e) => setSettings({ ...settings, tokenLength: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Rate Limit (scans per minute per IP)</Label>
            <Input
              type="number"
              min={10}
              max={1000}
              value={settings.rateLimitPerMinute}
              onChange={(e) => setSettings({ ...settings, rateLimitPerMinute: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Default Card Type</Label>
            <Select
              value={settings.defaultCardType}
              onChange={(e) => setSettings({ ...settings, defaultCardType: e.target.value as CardType })}
            >
              {Object.entries(CARD_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
