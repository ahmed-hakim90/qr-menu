"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/dashboard-api";
import { NotificationsSettings } from "./notifications-settings";
import { CURRENCY_CODE, CURRENCY_LABEL_AR, CURRENCY_LABEL_EN, CURRENCY_SYMBOL } from "@/lib/currency";
import type { Settings } from "@/generated/prisma";

interface SettingsManagerProps {
  settings: Settings;
}

export function SettingsManager({ settings }: SettingsManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    taxRate: String(settings.taxRate),
    language: settings.language as "ar" | "en",
    theme: settings.theme as "light" | "dark" | "system",
    notificationsEnabled: settings.notificationsEnabled,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          taxRate: Number(form.taxRate),
        }),
      });
      router.refresh();
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Currency & Language</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Currency</p>
                  <p className="text-sm text-muted-foreground">
                    {CURRENCY_LABEL_EN} · {CURRENCY_LABEL_AR}
                  </p>
                </div>
                <Badge variant="secondary">
                  {CURRENCY_CODE} · {CURRENCY_SYMBOL}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Preview: 25.00 {CURRENCY_SYMBOL}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select
                value={form.language}
                onChange={(e) =>
                  setForm({
                    ...form,
                    language: e.target.value as "ar" | "en",
                  })
                }
              >
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default language for your menu visitors
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Dashboard Theme</Label>
              <Select
                value={form.theme}
                onChange={(e) =>
                  setForm({
                    ...form,
                    theme: e.target.value as "light" | "dark" | "system",
                  })
                }
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                Theme for the admin dashboard only. Menu appearance is configured in Appearance.
              </p>
            </div>
          </CardContent>
        </Card>

        <NotificationsSettings
          enabled={form.notificationsEnabled}
          onEnabledChange={(notificationsEnabled) =>
            setForm({ ...form, notificationsEnabled })
          }
        />

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
