"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/dashboard-api";
import type { Settings } from "@/generated/prisma";

const CURRENCIES = [
  { code: "SAR", symbol: "ر.س", label: "Saudi Riyal" },
  { code: "EGP", symbol: "ج.م", label: "Egyptian Pound" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { code: "KWD", symbol: "د.ك", label: "Kuwaiti Dinar" },
  { code: "QAR", symbol: "ر.ق", label: "Qatari Riyal" },
  { code: "BHD", symbol: "د.ب", label: "Bahraini Dinar" },
  { code: "OMR", symbol: "ر.ع", label: "Omani Rial" },
  { code: "JOD", symbol: "د.أ", label: "Jordanian Dinar" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
];

interface SettingsManagerProps {
  settings: Settings;
}

export function SettingsManager({ settings }: SettingsManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    currency: settings.currency,
    currencySymbol: settings.currencySymbol,
    taxRate: String(settings.taxRate),
    language: settings.language as "ar" | "en",
    theme: settings.theme as "light" | "dark" | "system",
  });
  const [saving, setSaving] = useState(false);

  const handleCurrencyChange = (code: string) => {
    const preset = CURRENCIES.find((c) => c.code === code);
    setForm((prev) => ({
      ...prev,
      currency: code,
      currencySymbol: preset?.symbol ?? prev.currencySymbol,
    }));
  };

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
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={form.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Currency Symbol</Label>
              <Input
                value={form.currencySymbol}
                onChange={(e) =>
                  setForm({ ...form, currencySymbol: e.target.value })
                }
                placeholder="ر.س"
              />
              <p className="text-xs text-muted-foreground">
                Preview: 25.00 {form.currencySymbol}
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
              <Label>Menu Theme</Label>
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
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
