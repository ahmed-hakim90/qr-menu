"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Palette } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrencyAmount } from "@/lib/currency";
import type { MenuThemeSlug } from "@/lib/menu-themes";

type AdminMenuTheme = {
  slug: MenuThemeSlug;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  isPremium: boolean;
  price: number;
  sortOrder: number;
  isActive: boolean;
  purchaseCount: number;
  previewColors: {
    background: string;
    primary: string;
    accent: string;
  };
};

interface MenuThemesManagerProps {
  themes: AdminMenuTheme[];
}

function toForm(theme: AdminMenuTheme) {
  return {
    nameAr: theme.nameAr,
    nameEn: theme.nameEn,
    descriptionAr: theme.descriptionAr,
    descriptionEn: theme.descriptionEn,
    isPremium: theme.isPremium,
    price: String(theme.price),
    sortOrder: String(theme.sortOrder),
    isActive: theme.isActive,
  };
}

export function MenuThemesManager({ themes }: MenuThemesManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminMenuTheme | null>(null);
  const [form, setForm] = useState(() => (themes[0] ? toForm(themes[0]) : null));
  const [saving, setSaving] = useState(false);

  const openEdit = (theme: AdminMenuTheme) => {
    setEditing(theme);
    setForm(toForm(theme));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !form) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        sortOrder: Number(form.sortOrder),
      };

      const res = await fetch(`/api/admin/menu-themes/${editing.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save theme");
      }

      setEditing(null);
      router.refresh();
      toast.success("Theme saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          Menu Themes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control which themes restaurants can see and how much premium themes cost.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <Card key={theme.slug}>
            <div
              className="h-24 rounded-t-2xl"
              style={{ background: theme.previewColors.background }}
            >
              <div className="flex h-full items-center justify-center gap-3">
                <div
                  className="h-9 w-9 rounded-full"
                  style={{ background: theme.previewColors.primary }}
                />
                <div className="space-y-1.5">
                  <div
                    className="h-2 w-20 rounded-full"
                    style={{ background: theme.previewColors.accent, opacity: 0.8 }}
                  />
                  <div
                    className="h-2 w-14 rounded-full"
                    style={{ background: theme.previewColors.accent, opacity: 0.4 }}
                  />
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{theme.nameEn}</h3>
                  <p className="text-sm text-muted-foreground">{theme.nameAr}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={theme.isActive ? "success" : "secondary"}>
                    {theme.isActive ? "Visible" : "Hidden"}
                  </Badge>
                  <Badge variant={theme.isPremium ? "warning" : "secondary"}>
                    {theme.isPremium ? "Premium" : "Free"}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{theme.descriptionEn}</p>
              <p className="text-2xl font-bold">
                {theme.isPremium ? formatCurrencyAmount(theme.price) : "Free"}
              </p>
              <p className="text-sm text-muted-foreground">
                {theme.purchaseCount} purchase requests
              </p>

              <Button variant="outline" size="sm" onClick={() => openEdit(theme)}>
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Theme</DialogTitle>
          </DialogHeader>
          {editing && form && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={editing.slug} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (Arabic)</Label>
                  <Input
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (Arabic)</Label>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  rows={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description (English)</Label>
                <Textarea
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.isActive}
                  disabled={editing.slug === "classic"}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                Theme visible to restaurants
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.isPremium}
                  disabled={editing.slug === "classic"}
                  onCheckedChange={(v) => setForm({ ...form, isPremium: v })}
                />
                Premium theme
              </label>

              <div className="space-y-2">
                <Label>One-time price (EGP)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={editing.slug === "classic" ? "0" : form.price}
                  disabled={editing.slug === "classic" || !form.isPremium}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
